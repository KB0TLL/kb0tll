import { Component } from '@angular/core';

type AboutSection = {
  eyebrow: string;
  title: string;
  body: string[];
  bullets?: string[];
};

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly sections: AboutSection[] = [
    {
      eyebrow: 'Our Club Today',
      title: 'A friendly, growing, and active amateur radio club',
      body: [
        'The Jefferson County Amateur Radio Club is a friendly, growing, and vibrant organization with more than fifty members.',
        'Club members meet on the first Saturday of each month in the conference room of St. Clement Health Care Center, located at 300 Liguori Road near Barnhart in Liguori, Missouri.',
        'The club website provides detailed information about events, repeaters, nets, club news, and ways to get involved.',
      ],
      bullets: [
        'Providing important connections for fellow hams.',
        'Providing important services to the Jefferson County area.',
        'Partnering with the Jefferson County EOC and ARES through an active emergency preparedness plan.',
      ],
    },
    {
      eyebrow: 'Club Station',
      title: 'A radio station available to members',
      body: [
        'In 2022, the club began meeting at St. Clement Health Care Center.',
        'In 2023, the club added a complete radio station that is operational on all amateur radio bands.',
        'The radio station is available to club members by appointment.',
      ],
    },
    {
      eyebrow: 'Visitors Welcome',
      title: 'You do not need to be a member to visit',
      body: [
        'Anyone, whether a member or not, is welcome to join the club for meetings.',
        'Visitors can attend a meeting, ask questions, meet local operators, and learn more about amateur radio in Jefferson County.',
        'Prospective members can reach out through the contact form or submit a membership application.',
      ],
    },
    {
      eyebrow: 'Our Club History',
      title: 'Serving Jefferson County amateur radio since 1936',
      body: [
        'The club began in 1936 through the efforts of four Jefferson County men interested in amateur radio: Charles Herbert, Emanuel Roth, Walter Hample, and Tyndle Polk.',
        'The new organization held regular monthly meetings on the first Sunday of each month at the host member’s home.',
        'In 1938, the club changed its name to the Ozark Amateur Radio Club, representing Jefferson, Ste. Genevieve, Perry, and St. Francois counties. This name remained until the start of World War II, when the government ordered amateur radio operators off the air for security purposes.',
        'The club reorganized in the 1970s and took the name Jefferson County Amateur Radio Club, while Ste. Genevieve and St. Francois counties formed their own clubs.',
        'In 1996, JCARC was issued the club call sign KB0TLL and implemented the 147.075 repeater.',
        'For many years, the Windsor Branch of the Jefferson County Library hosted the club’s monthly meetings. During the COVID pandemic, club meetings continued on Zoom into early 2022.',
      ],
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
