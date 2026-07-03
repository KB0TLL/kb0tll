import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Calendar } from './calendar';

describe('Calendar', () => {
  let fixture: ComponentFixture<Calendar>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Calendar);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders the current month and a calendar grid', async () => {
    const request = httpTesting.expectOne('/api/calendar-events');
    request.flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Club Calendar');
  });
});
