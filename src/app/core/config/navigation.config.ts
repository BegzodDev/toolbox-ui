import { NavItem } from '../interfaces/nav-item.model';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'tools.home',
    ext: 'index.ts',
    route: '/',
  },
  {
    label: 'tools.calculator',
    ext: 'calculate.ts',
    route: '/calculator',
  },
  //   {
  //     label: 'tools.seat_generator',
  //     ext: 'seat_gen.tsx',
  //     route: '/seat-generator',
  //   },
  //   {
  //     label: 'tools.furigana_reader',
  //     ext: 'furigana.log',
  //     route: '/furigana-reader',
  //   },
  //   {
  //     label: 'tools.time_tracker',
  //     ext: 'time_tracker.ts',
  //     route: '/time-tracker',
  //   },
];
