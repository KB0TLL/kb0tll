export type Net = {
  name: string;
  schedule: string;
  repeater: string;
  description: string;
};

export const NETS: Net[] = [
  {
    name: 'Monday Night Emergency Practice Net',
    schedule: 'Mondays at 8:00 PM',
    repeater: '147.075 MHz KBØTLL repeater',
    description:
      'Weekly emergency communications practice net for local operators.',
  },
  {
    name: 'Monthly Emergency Simplex Net',
    schedule: 'First Monday after the emergency practice net',
    repeater: 'Simplex',
    description:
      'Monthly simplex practice to test local station-to-station communication.',
  },
  {
    name: 'Swap Net',
    schedule: 'As scheduled',
    repeater: 'Club repeater system',
    description:
      'On-air swap and trade net for amateur radio equipment and related items.',
  },
  {
    name: 'Brunch Bunch',
    schedule: 'As scheduled',
    repeater: 'Club repeater system',
    description:
      'Casual on-air gathering and fellowship net.',
  },
];