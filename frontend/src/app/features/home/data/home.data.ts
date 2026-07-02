export type ClubNewsItem = {
  title: string;
  body: string;
};

export type ImportantLink = {
  label: string;
  url: string;
};

export type EventItem = {
  title: string;
  body: string;
};

export const HOME_EVENTS: EventItem[] = [
  {
    title: 'Twin City Days',
    body: 'Local public service and community event.',
  },
  {
    title: 'Ozark Off Road Riders',
    body: 'Public service support event.',
  },
  {
    title: 'ARRL Field Day',
    body: 'Annual operating and public outreach event.',
  },
  {
    title: 'Bottleneck Bridge Ride',
    body: 'Public service communications support.',
  },
  {
    title: 'Annual Christmas Party',
    body: 'Annual club Christmas gathering.',
  },
];

export const HOME_CLUB_NEWS: ClubNewsItem[] = [
  {
    title: 'Current Activities Calendar',
    body: 'Club activities, meetings, events, and nets are listed here for members and visitors.',
  },
  {
    title: 'Upcoming Hamfest',
    body: 'Watch this section for upcoming regional hamfests, swap meets, and special events.',
  },
  {
    title: 'JCARC Radio Shack',
    body: 'The club has a station available to members by appointment.',
  },
];

export const HOME_IMPORTANT_LINKS: ImportantLink[] = [
  { label: 'JCARC Members Packet', url: '#' },
  { label: 'JCARC Official By-Laws', url: '#' },
  { label: 'Eastern Missouri Beacon', url: '#' },
  { label: 'NetLogger', url: '#' },
  { label: 'EchoLink', url: '#' },
  { label: 'ARRL', url: 'https://www.arrl.org/' },
  { label: 'QRZ', url: 'https://www.qrz.com/' },
];