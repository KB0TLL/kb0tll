import { Component } from '@angular/core';

type MemberPhoto = {
  image: string;
  caption: string;
};

@Component({
  selector: 'app-member-photos',
  imports: [],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.scss',
})
export class MemberPhotos {
  protected readonly memberPhotos: MemberPhoto[] = [
    { image: 'images/members/AC0MV-JERRY.jpg', caption: 'Technician - Dad - Grandpa' },
    { image: 'images/members/Don-KODDF.jpg', caption: 'General Class, Retired' },
    { image: 'images/members/K0SGB-STEVE.jpg', caption: 'ARES - Board Member' },
    { image: 'images/members/K0SLQ-BOB.jpg', caption: 'Telco Guy - Army Vet - Miami FL Native' },
    { image: 'images/members/Paul-K6STL-1.jpg', caption: 'Board Member - General Class' },
    { image: 'images/members/KB0FLU-Charlie.jpg', caption: 'OASIS Tutor - Tech+ - Retired' },
    { image: 'images/members/KB0WWQ-LORI.jpg', caption: 'ARES EC Jefferson County' },
    { image: 'images/members/KB8QAV-GERRY.jpg', caption: 'Club President - Exec. Dir. St. Clement Health Care Center' },
    { image: 'images/members/KC0DFA-JOHN-1.jpg', caption: 'Club Member' },
    { image: 'images/members/KC0KFP-DENNIS.jpg', caption: 'Member of SAR - Harrington Cemetery Trustee' },
    { image: 'images/members/KC9AEC-BOB.jpg', caption: 'Club Member - System Admin' },
    { image: 'images/members/KD0CIV-DELORES.jpg', caption: 'Board Member - Bread Maker' },
    { image: 'images/members/KD0DSA-FRED.jpg', caption: 'Retired Welder/Machinist - Lives South of Potosi' },
    { image: 'images/members/KD0RIS-Gary.jpg', caption: 'Repeater Owner - Retired Guy' },
    { image: 'images/members/KD0VEB-BILL-1.jpg', caption: '"Mr. Bill"' },
    { image: 'images/members/James-KDOVZL.jpg', caption: 'Class A CDL' },
    { image: 'images/members/KE0SBR-Bill.jpg', caption: 'Retired' },
    { image: 'images/members/KE0TTE-CHRIS-1.jpg', caption: 'Catholic Cemeteries' },
    { image: 'images/members/KE0TTG-LIAM-1.jpg', caption: 'SLUH Student - Cars' },
    { image: 'images/members/KE0VZP-AUBREY.jpg', caption: 'Ask - Bio QRT - Retired' },
    { image: 'images/members/KE0ZYI-Charles.jpg', caption: 'Pilot - Aircraft Mechanic' },
    { image: 'images/members/KF0XCUH-Kevin.jpg', caption: 'BA, RN, BSN' },
    { image: 'images/members/KF0LZM-ALVARO.jpg', caption: 'SPX HS Student - General Class' },
    { image: 'images/members/KF0NGN-CHARLES.jpg', caption: 'Retired Metal Fabricator - Current Babysitter' },
    { image: 'images/members/KF0NNQ-BILL.jpg', caption: 'MO Stream Team - VE' },
    { image: 'images/members/KF0OCM-JARED.jpg', caption: 'Club Secretary - IT - Electrical Tech' },
    { image: 'images/members/KF0ODV-ADAM.jpg', caption: 'Engineer - Computer Nerd' },
    { image: 'images/members/KF0OGF-TOM-1.jpg', caption: 'Technician Class - Truck Driver' },
    { image: 'images/members/KF0OYP-Don.jpg', caption: 'Customer Service' },
    { image: 'images/members/KF0PUY-Jerry-1.jpg', caption: 'Artist - Furniture Maker' },
    { image: 'images/members/Joe-KFOCJ.jpg', caption: 'Hospice Volunteer' },
    { image: 'images/members/Joe-KFOSUF.jpg', caption: 'Technician Class - Deputy Webmaster' },
    { image: 'images/members/Paul-KFOTXS.jpg', caption: 'Land Surveyor - Part 107 Drone Pilot' },
    { image: 'images/members/Richard-KF5ILA.jpg', caption: 'General Class' },
    { image: 'images/members/Ron-KF5LOA.jpg', caption: 'General Class' },
    { image: 'images/members/KF9FJ-TIM-1.jpg', caption: 'Club Trustee - Lives in Barnhart' },
    { image: 'images/members/Aaron-NOAPT.jpg', caption: 'Programmer - Camper - Woodworker' },
    { image: 'images/members/N0CALL-NORM-2.jpg', caption: 'Extra Class - Activities Committee Chairman' },
    { image: 'images/members/N0CYF-Art-1.jpg', caption: 'Past Master, Fenton Masonic Lodge' },
    { image: 'images/members/N0HKK-JOHN-1.jpg', caption: 'Member - Die-Caster' },
    { image: 'images/members/N0KQV-Bill.jpg', caption: 'Club Past-President - Classic Car Lover' },
    { image: 'images/members/N0NSP-RON.jpg', caption: 'Retired Manager - General Class - Working as an Electrician' },
    { image: 'images/members/N0POD-DONALD.jpg', caption: 'Registered Nurse' },
    { image: 'images/members/N0ZIB-Adam.jpg', caption: 'VP, shomg.org - Techie' },
    { image: 'images/members/NODSS-DEREK.jpg', caption: 'Board Member - Tech-Addict - Contester' },
    { image: 'images/members/N9UGX-MELISSA.jpg', caption: 'Dachshund Lover - Mom of Three' },
    { image: 'images/members/W0IFP-PAUL-1.jpg', caption: 'Ret. Electrical Contractor - Catholic Deacon' },
    { image: 'images/members/W0JET-HOWARD.jpg', caption: 'USAF Retired - ARES AEC Jefferson County' },
    { image: 'images/members/W1BTM-BEN-1.jpg', caption: 'Member - Eastern Ozark ARC President' },
    { image: 'images/members/WB0RDS-RICH.jpg', caption: 'Veteran - Outdoorsman - Rancher' },
    { image: 'images/members/WB0REW-BOB.jpg', caption: 'Board Member - Emergency Prep Instructor - Grandpa - Retired Army Colonel' },
    { image: 'images/members/WB9LUL-GENE.jpg', caption: 'Ham Since 1972' },
    { image: 'images/members/WB9PCO-LEO-1.jpg', caption: 'Club Historian - Ham Since 1974' },
    { image: 'images/members/WD8DSF-ANDY-1.jpg', caption: 'Club Member - Net Control "Come as You Are Net"' },
    { image: 'images/members/Al-Ruder-KA0MEB.jpg', caption: '' },
    { image: 'images/members/KC9JLI-JOHN.jpg', caption: '' },
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
