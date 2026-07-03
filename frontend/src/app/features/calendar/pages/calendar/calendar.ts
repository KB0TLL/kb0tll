import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { forkJoin } from 'rxjs';

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
  imports: [FormsModule, NgIcon],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  private readonly http = inject(HttpClient);

  private readonly calendarEventsUrl = '/api/calendar-events';

  private readonly adminTokenStorageKey = 'kb0tll-calendar-admin-token';

  private readonly printableGalleryPhotos = [
    'images/photo_gallery/004_twin_city_days_booth_2025_img_6780_scaled.jpg',
    'images/photo_gallery/008_twin_city_days_booth_2025_img_6778_scaled.jpg',
    'images/photo_gallery/019_christmas_party_december_72024_img_0579_scaled.jpg',
    'images/photo_gallery/044_club_tower_raising_2024_img_7198_1.jpg',
    'images/photo_gallery/049_club_tower_raising_2024_img_0120_scaled.jpg',
    'images/photo_gallery/064_twin_city_days_2024_img_0139_scaled.jpg',
    'images/photo_gallery/072_field_day_2024_img_9839_scaled.jpg',
    'images/photo_gallery/086_field_day_2024_img_9824_scaled.jpg',
    'images/photo_gallery/088_assorted_club_photos_img_6862_1_scaled.jpg',
    'images/photo_gallery/092_assorted_club_photos_img_9956.jpg',
    'images/photo_gallery/124_assorted_club_photos_club_station.jpg',
    'images/photo_gallery/129_assorted_club_photos_field_day.jpg',
  ];

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

  protected readonly showAdminLogin = signal<boolean>(false);

  protected readonly isLoadingEvents = signal<boolean>(false);

  protected readonly calendarError = signal<string | null>(null);

  protected readonly adminError = signal<string | null>(null);

  protected readonly events = signal<CalendarEvent[]>([]);

  protected readonly printableGalleryPhoto = signal(this.printableGalleryPhotos[1]);

  protected readonly adminToken = signal<string>('');

  protected readonly isAdmin = computed(() => this.adminToken().length > 0);

  protected adminTokenInput = '';

  protected newEvent = {
    date: this.toDateKey(new Date()),
    title: '',
    time: '09:00',
    type: 'meeting' as CalendarEventType,
    notes: '',
    recurringWeekly: false,
  };

  protected readonly currentMonthLabel = computed(
    () => `${this.monthNames[this.displayDate().month]} ${this.displayDate().year}`
  );

  protected readonly calendarDays = computed(() => this.buildCalendarDays());

  protected readonly currentMonthEvents = computed(() => {
    const { year, month } = this.displayDate();

    return this.sortEvents(
      this.events().filter((event) => {
        const eventDate = new Date(`${event.date}T00:00:00`);

        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      })
    );
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

  protected readonly atAGlanceEvents = computed(() =>
    this.currentMonthEvents().filter((event) => event.type !== 'net')
  );

  protected readonly printableCalendarRows = computed(() => {
    const days = this.calendarDays();
    const rows: CalendarDay[][] = [];

    for (let index = 0; index < days.length; index += 7) {
      rows.push(days.slice(index, index + 7));
    }

    return rows;
  });

  ngOnInit(): void {
    this.loadAdminToken();
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
    const eventsToCreate = this.newEvent.recurringWeekly
      ? this.buildWeeklyRecurringEvents(event)
      : [event];

    forkJoin(
      eventsToCreate.map((eventToCreate) =>
        this.http.post<CalendarEvent>(this.calendarEventsUrl, eventToCreate, {
          headers: this.getAdminHeaders(),
        })
      )
    ).subscribe({
      next: (savedEvents) => {
        this.events.update((events) => [...events, ...savedEvents]);

        const eventDate = new Date(`${savedEvents[0].date}T00:00:00`);

        this.displayDate.set({
          year: eventDate.getFullYear(),
          month: eventDate.getMonth(),
        });

        this.newEvent = {
          date: savedEvents[0].date,
          title: '',
          time: '09:00',
          type: 'meeting',
          notes: '',
          recurringWeekly: false,
        };
        this.calendarError.set(null);
        this.adminError.set(null);
      },
      error: () => {
        this.calendarError.set('Could not save the event or recurring events. Please try again.');
        this.adminError.set('Check your admin token and try again.');
      },
    });
  }

  protected removeEvent(eventId: number): void {
    this.http.delete(`${this.calendarEventsUrl}/${eventId}`, {
      headers: this.getAdminHeaders(),
    }).subscribe({
      next: () => {
        this.events.update((events) => events.filter((event) => event.id !== eventId));

        if (this.selectedEvent()?.id === eventId) {
          this.closeEventDetail();
        }

        this.calendarError.set(null);
      },
      error: () => {
        this.calendarError.set('Could not remove the event. Please try again.');
        this.adminError.set('Check your admin token and try again.');
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

  protected formatAtAGlanceEvent(event: CalendarEvent): string {
    const eventDate = new Date(`${event.date}T00:00:00`);
    const dateLabel = eventDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
    const timeLabel = this.formatTime(event.time);

    return `${dateLabel} ${event.title}${timeLabel ? ` ${timeLabel}` : ''}`;
  }

  protected formatPrintableEvent(event: CalendarEvent): string {
    const timeLabel = this.formatTime(event.time);

    return `${event.title}${timeLabel ? ` - ${timeLabel}` : ''}`;
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

  protected printableEventClasses(type: CalendarEventType): string {
    switch (type) {
      case 'meeting':
        return 'calendar-pdf-event calendar-pdf-event-meeting';
      case 'net':
        return 'calendar-pdf-event calendar-pdf-event-net';
      case 'event':
        return 'calendar-pdf-event calendar-pdf-event-special';
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
        events: this.sortEvents(this.events().filter((event) => event.date === dateKey)),
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

  private sortEvents(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (a.time || '99:99').localeCompare(b.time || '99:99');
    });
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

  protected toggleAdminLogin(): void {
    this.showAdminLogin.set(!this.showAdminLogin());
    this.adminError.set(null);
  }

  protected unlockAdmin(): void {
    const token = this.adminTokenInput.trim();

    if (!token) {
      this.adminError.set('Enter the admin token.');
      return;
    }

    this.adminToken.set(token);
    localStorage.setItem(this.adminTokenStorageKey, token);
    this.adminTokenInput = '';
    this.adminError.set(null);
    this.showAdminLogin.set(false);
  }

  protected signOutAdmin(): void {
    this.adminToken.set('');
    this.adminTokenInput = '';
    localStorage.removeItem(this.adminTokenStorageKey);
    this.adminError.set(null);
    this.showAddForm.set(false);
  }

  protected exportPdf(): void {
    this.closeEventDetail();
    this.printableGalleryPhoto.set(this.getRandomPrintableGalleryPhoto());

    document.body.classList.add('calendar-printing');

    const cleanup = () => {
      document.body.classList.remove('calendar-printing');
      window.removeEventListener('afterprint', cleanup);
      window.removeEventListener('focus', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.addEventListener('focus', cleanup, { once: true });

    document.body.getBoundingClientRect();
    window.print();
    window.setTimeout(cleanup, 30000);
  }

  private getRandomPrintableGalleryPhoto(): string {
    if (this.printableGalleryPhotos.length === 1) {
      return this.printableGalleryPhotos[0];
    }

    const currentPhoto = this.printableGalleryPhoto();
    const availablePhotos = this.printableGalleryPhotos.filter((photo) => photo !== currentPhoto);
    const index = Math.floor(Math.random() * availablePhotos.length);

    return availablePhotos[index];
  }

  private buildWeeklyRecurringEvents(event: CalendarEventInput): CalendarEventInput[] {
    const events: CalendarEventInput[] = [];
    const currentDate = new Date(`${event.date}T00:00:00`);
    const month = currentDate.getMonth();

    while (currentDate.getMonth() === month) {
      events.push({
        ...event,
        date: this.toDateKey(currentDate),
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return events;
  }

  private loadAdminToken(): void {
    const token = localStorage.getItem(this.adminTokenStorageKey);

    if (token) {
      this.adminToken.set(token);
    }
  }

  private getAdminHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Admin-Token': this.adminToken(),
    });
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
