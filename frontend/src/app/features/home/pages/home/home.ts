import { Component } from '@angular/core';
import {
  HOME_CLUB_NEWS,
  HOME_EVENTS,
  HOME_IMPORTANT_LINKS,
} from '../../data/home.data';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly events = HOME_EVENTS;
  protected readonly clubNews = HOME_CLUB_NEWS;
  protected readonly importantLinks = HOME_IMPORTANT_LINKS;

  protected sendContactEmail(event: SubmitEvent, form: HTMLFormElement): void {
    event.preventDefault();

    this.openEmail('KB0TLL Contact Us Form', form);
  }

  protected sendMembershipEmail(event: SubmitEvent, form: HTMLFormElement): void {
    event.preventDefault();

    this.openEmail('KB0TLL Join Our Club Form', form);
  }

  private openEmail(subject: string, form: HTMLFormElement): void {
    const formData = new FormData(form);
    const body = Array.from(formData.entries())
      .map(([key, value]) => `${this.formatLabel(key)}: ${value}`)
      .join('\n');

    window.location.href = [
      'mailto:af0fr.radio@gmail.com',
      `?subject=${encodeURIComponent(subject)}`,
      `&body=${encodeURIComponent(body)}`,
    ].join('');
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (letter) => letter.toUpperCase());
  }
}
