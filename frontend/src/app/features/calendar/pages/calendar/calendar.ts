import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type CalendarEventType = 'meeting' | 'net' | 'event';

type CalendarEvent = {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  time: string;
  type: CalendarEventType;
  notes?: string;
};

type CalendarEventInput = Omit<CalendarEvent, 'id'>;

type CalendarEventGroup = {
  date: string;
  events: CalendarEvent[];
};

type CalendarDay = {
  day: number | null;
  dateKey: string | null;
  events: CalendarEvent[];
};

type CalendarViewMode = 'calendar' | 'list';

type TooltipPosition = {
  top: number;
  left: number;
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  private readonly http = inject(HttpClient);

  private readonly calendarEventsUrl = '/api/calendar-events';

  protected readonly monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  protected readonly weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  protected readonly displayDate = signal({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  protected readonly viewMode = signal<CalendarViewMode>('calendar');

  protected readonly selectedEvent = signal<CalendarEvent | null>(null);

  protected readonly tooltipPosition = signal<TooltipPosition | null>(null);

  protected readonly showAddForm = signal<boolean>(true);

  protected readonly isLoadingEvents = signal<boolean>(false);

  protected readonly calendarError = signal<string | null>(null);

  protected readonly events = signal<CalendarEvent[]>([]);

  protected newEvent = {
    date: this.toDateKey(new Date()),
    title: '',
    time: '09:00',
    type: 'meeting' as CalendarEventType,
    notes: '',
  };

  protected readonly currentMonthLabel = computed(
    () => `${this.monthNames[this.displayDate().month]} ${this.displayDate().year}`
  );

  protected readonly calendarDays = computed(() => this.buildCalendarDays());

  protected readonly currentMonthEvents = computed(() => {
    const { year, month } = this.displayDate();

    return this.events()
      .filter((event) => {
        const eventDate = new Date(`${event.date}T00:00:00`);

        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return a.time.localeCompare(b.time);
      });
  });

  protected readonly currentMonthEventGroups = computed<CalendarEventGroup[]>(() => {
    const groups = new Map<string, CalendarEvent[]>();

    for (const event of this.currentMonthEvents()) {
      const existingEvents = groups.get(event.date) ?? [];
      groups.set(event.date, [...existingEvents, event]);
    }

    return Array.from(groups.entries()).map(([date, events]) => ({
      date,
      events,
    }));
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  protected previousMonth(): void {
    const { year, month } = this.displayDate();

    if (month === 0) {
      this.displayDate.set({ year: year - 1, month: 11 });
      return;
    }

    this.displayDate.set({ year, month: month - 1 });
  }

  protected nextMonth(): void {
    const { year, month } = this.displayDate();

    if (month === 11) {
      this.displayDate.set({ year: year + 1, month: 0 });
      return;
    }

    this.displayDate.set({ year, month: month + 1 });
  }

  protected addEvent(): void {
    const title = this.newEvent.title.trim();

    if (!this.newEvent.date || !title) {
      return;
    }

    const event: CalendarEventInput = {
      date: this.newEvent.date,
      title,
      time: this.newEvent.time,
      type: this.newEvent.type,
      notes: this.newEvent.notes,
    };

    this.http.post<CalendarEvent>(this.calendarEventsUrl, event).subscribe({
      next: (savedEvent) => {
        this.events.update((events) => [...events, savedEvent]);

        const eventDate = new Date(`${savedEvent.date}T00:00:00`);

        this.displayDate.set({
          year: eventDate.getFullYear(),
          month: eventDate.getMonth(),
        });

        this.newEvent = {
          date: savedEvent.date,
          title: '',
          time: '09:00',
          type: 'meeting',
          notes: '',
        };
        this.calendarError.set(null);
      },
      error: () => {
        this.calendarError.set('Could not save the event. Please try again.');
      },
    });
  }

  protected removeEvent(eventId: number): void {
    this.http.delete(`${this.calendarEventsUrl}/${eventId}`).subscribe({
      next: () => {
        this.events.update((events) => events.filter((event) => event.id !== eventId));

        if (this.selectedEvent()?.id === eventId) {
          this.closeEventDetail();
        }

        this.calendarError.set(null);
      },
      error: () => {
        this.calendarError.set('Could not remove the event. Please try again.');
      },
    });
  }

  protected formatTime(time: string): string {
    if (!time) {
      return '';
    }

    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  protected formatEventDate(dateKey: string): string {
    const date = new Date(`${dateKey}T00:00:00`);

    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  protected eventTypeLabel(type: CalendarEventType): string {
    switch (type) {
      case 'meeting':
        return 'Meeting';
      case 'net':
        return 'Net';
      case 'event':
        return 'Event';
    }
  }

  protected eventTypeClasses(type: CalendarEventType): string {
    switch (type) {
      case 'meeting':
        return 'border-red-200 bg-red-50 text-red-900';
      case 'net':
        return 'border-blue-200 bg-blue-50 text-blue-900';
      case 'event':
        return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    }
  }

  protected eventBadgeClasses(type: CalendarEventType): string {
    switch (type) {
      case 'meeting':
        return 'bg-red-600 text-white';
      case 'net':
        return 'bg-blue-600 text-white';
      case 'event':
        return 'bg-emerald-600 text-white';
    }
  }

  protected eventDotClasses(type: CalendarEventType): string {
    switch (type) {
      case 'meeting':
        return 'bg-red-600';
      case 'net':
        return 'bg-blue-600';
      case 'event':
        return 'bg-emerald-600';
    }
  }

  private buildCalendarDays(): CalendarDay[] {
    const { year, month } = this.displayDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays: CalendarDay[] = [];

    for (let empty = 0; empty < firstDayOfWeek; empty += 1) {
      calendarDays.push({
        day: null,
        dateKey: null,
        events: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = this.toDateKey(new Date(year, month, day));

      calendarDays.push({
        day,
        dateKey,
        events: this.events().filter((event) => event.date === dateKey),
      });
    }

    while (calendarDays.length % 7 !== 0) {
      calendarDays.push({
        day: null,
        dateKey: null,
        events: [],
      });
    }

    return calendarDays;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  protected setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }

  protected selectEvent(event: CalendarEvent, triggerEvent: Event): void {
    this.selectedEvent.set(event);
    this.tooltipPosition.set(this.getTooltipPosition(triggerEvent));
  }

  protected closeEventDetail(): void {
    this.selectedEvent.set(null);
    this.tooltipPosition.set(null);
  }

  protected toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
  }

  private loadEvents(): void {
    this.isLoadingEvents.set(true);

    this.http.get<CalendarEvent[]>(this.calendarEventsUrl).subscribe({
      next: (events) => {
        this.events.set(events);
        this.calendarError.set(null);
        this.isLoadingEvents.set(false);
      },
      error: () => {
        this.calendarError.set('Could not load calendar events.');
        this.isLoadingEvents.set(false);
      },
    });
  }

  @HostListener('document:click')
  protected closeEventDetailOnOutsideClick(): void {
    if (this.selectedEvent()) {
      this.closeEventDetail();
    }
  }

  private getTooltipPosition(triggerEvent: Event): TooltipPosition {
    const trigger = triggerEvent.currentTarget;

    if (!(trigger instanceof HTMLElement)) {
      return {
        top: 16,
        left: 16,
      };
    }

    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipEstimatedHeight = 180;
    const gap = 8;
    const viewportPadding = 8;
    let left = rect.right + gap;

    if (left + tooltipWidth > window.innerWidth - viewportPadding) {
      left = rect.left - tooltipWidth - gap;
    }

    const top = Math.min(
      Math.max(rect.top, viewportPadding),
      window.innerHeight - tooltipEstimatedHeight - viewportPadding
    );

    return {
      top,
      left: Math.max(left, viewportPadding),
    };
  }
}
