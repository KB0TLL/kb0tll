import { Component } from '@angular/core';

type Leader = {
  name: string;
  role: string;
  image?: string;
  email?: string;
};

@Component({
  selector: 'app-leadership',
  imports: [],
  templateUrl: './leadership.html',
  styleUrl: './leadership.scss',
})
export class Leadership {
  protected readonly executiveMembers: Leader[] = [
    {
      name: 'Gerry - KB8QAV',
      role: 'President',
      image: 'images/members/KB8QAV-GERRY.jpg',
      email: 'mailto:president@jcarcmo.com',
    },
    {
      name: 'NA',
      role: 'Vice-President',
    },
    {
      name: 'Jared - KF0OCM',
      role: 'Secretary',
      image: 'images/members/KF0OCM-JARED.jpg',
      email: 'mailto:secretary@jcarcmo.com',
    },
    {
      name: 'Melissa - N9UGX',
      role: 'Treasurer',
      image: 'images/members/N9UGX-MELISSA.jpg',
      email: 'mailto:treasurer@jcarcmo.com',
    },
    {
      name: 'Tim - KF9FJ',
      role: 'Trustee',
      image: 'images/members/KF9FJ-TIM-1.jpg',
      email: 'mailto:trustee@jcarcmo.com',
    },
  ];

  protected readonly boardMembers: Leader[] = [
    {
      name: 'Adam - N0ZIB',
      role: 'Board Member',
      image: 'images/members/N0ZIB-Adam.jpg',
    },
    {
      name: 'Tim - W1KBB',
      role: 'Board Member',
    },
    {
      name: 'Steve - K0SGB',
      role: 'Board Member',
      image: 'images/members/K0SGB-STEVE.jpg',
    },
    {
      name: 'Paul - K6STL',
      role: 'Board Member',
      image: 'images/members/Paul-K6STL-1.jpg',
    },
  ];

  protected readonly supportTeamTop: Leader[] = [
    {
      name: 'Leo - WB9PCO',
      role: 'Historian',
      image: 'images/members/WB9PCO-LEO-1.jpg',
    },
    {
      name: 'Gerry - KB8QAV',
      role: 'Deputy Trustee Al Ruder Memorial Station',
      image: 'images/members/KB8QAV-GERRY.jpg',
    },
    {
      name: 'Rich - WB0RDS',
      role: 'Deputy Trustee 147.075 Repeater',
      image: 'images/members/WB0RDS-RICH.jpg',
    },
    {
      name: 'Bill - KF0NNQ',
      role: 'Deputy Trustee Repeater 442.425',
      image: 'images/members/KF0NNQ-BILL.jpg',
    },
  ];

  protected readonly supportTeamBottom: Leader[] = [
    {
      name: 'Joe - KF0CJ',
      role: 'Deputy Webmaster',
      image: 'images/members/Joe-KFOCJ.jpg',
    },
    {
      name: 'Aaron - N0APT',
      role: 'Activities Coordinator',
      image: 'images/members/Aaron-NOAPT.jpg',
    },
  ];

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
