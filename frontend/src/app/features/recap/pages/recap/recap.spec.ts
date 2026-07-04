import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recap } from './recap';

describe('Recap', () => {
  let fixture: ComponentFixture<Recap>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recap],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Recap);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders the recap page', () => {
    const request = httpTesting.expectOne('/api/recap-posts');
    request.flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Club Recap');
  });
});
