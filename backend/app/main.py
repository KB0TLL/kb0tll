from __future__ import annotations

import os
import sqlite3
import datetime as dt
from hmac import compare_digest
from contextlib import asynccontextmanager, contextmanager
from pathlib import Path
from typing import Any, AsyncIterator, Iterator, Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # pragma: no cover - psycopg is installed in production.
    psycopg = None
    dict_row = None


CalendarEventType = Literal["meeting", "net", "event"]

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

FRONTEND_DIST = Path(
    os.getenv("FRONTEND_DIST", BASE_DIR.parent / "frontend" / "dist" / "frontend" / "browser")
)
SQLITE_PATH = Path(os.getenv("SQLITE_PATH", BASE_DIR / "data" / "calendar-events.db"))
DATABASE_URL = os.getenv("DATABASE_URL")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")


class CalendarEventInput(BaseModel):
    date: dt.date
    title: str = Field(min_length=1, max_length=200)
    time: dt.time | None = None
    type: CalendarEventType
    notes: str = ""

    @field_validator("time", mode="before")
    @classmethod
    def empty_time_is_none(cls, value: Any) -> Any:
        if value == "":
            return None

        return value


class CalendarEvent(BaseModel):
    id: int
    date: str
    title: str
    time: str = ""
    type: CalendarEventType
    notes: str = ""


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_calendar_events_table()
    yield


app = FastAPI(title="KB0TLL API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)


def require_admin(x_admin_token: str | None = Header(default=None, alias="X-Admin-Token")) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin token is not configured")

    if not x_admin_token or not compare_digest(x_admin_token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Admin access required")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/calendar-events", response_model=list[CalendarEvent])
def list_calendar_events() -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = execute_fetch_all(
            connection,
            """
            select id, event_date as date, event_time as time, type, title, notes
            from calendar_events
            order by event_date asc, event_time asc nulls first, id asc
            """,
        )

    return [serialize_event(row) for row in rows]


@app.post("/api/calendar-events", response_model=CalendarEvent, status_code=201)
def create_calendar_event(
    event: CalendarEventInput,
    _: None = Depends(require_admin),
) -> dict[str, Any]:
    with get_connection() as connection:
        if is_postgres_connection(connection):
            row = execute_fetch_one(
                connection,
                """
                insert into calendar_events (event_date, event_time, type, title, notes)
                values (%s, %s, %s, %s, %s)
                returning id, event_date as date, event_time as time, type, title, notes
                """,
                event_params(event),
            )
        else:
            cursor = connection.execute(
                """
                insert into calendar_events (event_date, event_time, type, title, notes)
                values (?, ?, ?, ?, ?)
                """,
                event_params(event),
            )
            row = execute_fetch_one(
                connection,
                """
                select id, event_date as date, event_time as time, type, title, notes
                from calendar_events
                where id = ?
                """,
                (cursor.lastrowid,),
            )

        connection.commit()

    return serialize_event(row)


@app.delete("/api/calendar-events/{event_id}", status_code=204)
def delete_calendar_event(
    event_id: int,
    _: None = Depends(require_admin),
) -> Response:
    with get_connection() as connection:
        cursor = connection.execute(
            "delete from calendar_events where id = %s" if is_postgres_connection(connection) else "delete from calendar_events where id = ?",
            (event_id,),
        )
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Event not found")

    return Response(status_code=204)


if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")


def create_calendar_events_table() -> None:
    with get_connection() as connection:
        if is_postgres_connection(connection):
            connection.execute(
                """
                create table if not exists calendar_events (
                  id bigserial primary key,
                  event_date date not null,
                  event_time time,
                  type text not null check (type in ('meeting', 'net', 'event')),
                  title text not null,
                  notes text not null default ''
                )
                """
            )
        else:
            connection.execute(
                """
                create table if not exists calendar_events (
                  id integer primary key autoincrement,
                  event_date text not null,
                  event_time text,
                  type text not null check (type in ('meeting', 'net', 'event')),
                  title text not null,
                  notes text not null default ''
                )
                """
            )

        connection.commit()


@contextmanager
def get_connection() -> Iterator[Any]:
    if DATABASE_URL:
        if psycopg is None or dict_row is None:
            raise RuntimeError("psycopg is required when DATABASE_URL is set")

        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as connection:
            yield connection
        return

    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(SQLITE_PATH)
    connection.row_factory = sqlite3.Row

    try:
        yield connection
    finally:
        connection.close()


def execute_fetch_all(connection: Any, query: str, params: tuple[Any, ...] = ()) -> list[Any]:
    cursor = connection.execute(normalize_query(connection, query), params)
    return cursor.fetchall()


def execute_fetch_one(connection: Any, query: str, params: tuple[Any, ...] = ()) -> Any:
    cursor = connection.execute(normalize_query(connection, query), params)
    row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return row


def normalize_query(connection: Any, query: str) -> str:
    if is_postgres_connection(connection):
        return query

    return query.replace(" nulls first", "")


def is_postgres_connection(connection: Any) -> bool:
    return psycopg is not None and isinstance(connection, psycopg.Connection)


def event_params(event: CalendarEventInput) -> tuple[Any, ...]:
    return (
        event.date.isoformat(),
        event.time.strftime("%H:%M") if event.time else None,
        event.type,
        event.title.strip(),
        event.notes.strip(),
    )


def serialize_event(row: Any) -> dict[str, Any]:
    data = dict(row)

    return {
        "id": data["id"],
        "date": serialize_date(data["date"]),
        "time": serialize_time(data["time"]),
        "type": data["type"],
        "title": data["title"],
        "notes": data["notes"] or "",
    }


def serialize_date(value: Any) -> str:
    if isinstance(value, dt.date):
        return value.isoformat()

    return str(value)


def serialize_time(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, dt.time):
        return value.strftime("%H:%M")

    return str(value)[:5]
