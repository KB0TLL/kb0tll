export type Repeater = {
  name: string;
  frequency: string;
  offset: string;
  tone: string;
  mode: string;
  notes: string;
};

export const REPEATERS: Repeater[] = [
  {
    name: 'KBØTLL VHF FM / EchoLink',
    frequency: '147.075 MHz',
    offset: '+0.600 MHz',
    tone: '141.3 Hz',
    mode: 'FM / EchoLink',
    notes: 'Primary club repeater used for the Monday Night Emergency Practice Net.',
  },
  {
    name: 'KBØTLL VHF C4FM / Wires-X',
    frequency: '147.105 MHz',
    offset: '+0.600 MHz',
    tone: 'None',
    mode: 'C4FM / Wires-X',
    notes: 'Digital voice repeater resource for club and local amateur radio use.',
  },
  {
    name: 'KBØTLL UHF FM',
    frequency: '442.425 MHz',
    offset: '+5.000 MHz',
    tone: '141.3 Hz',
    mode: 'FM',
    notes: 'UHF club repeater resource.',
  },
];