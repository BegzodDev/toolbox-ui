import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'calculator',
    loadComponent: () =>
      import('./components/calculator/calculator.component').then(
        (m) => m.CalculatorComponent,
      ),
  },
  {
    path: 'seat-generator',
    loadComponent: () =>
      import('./components/seat-generator/seat-generator.component').then(
        (m) => m.SeatGeneratorComponent,
      ),
  },
  {
    path: 'furigana-reader',
    loadComponent: () =>
      import('./components/furigana-reader/furigana-reader.component').then(
        (m) => m.FuriganaReaderComponent,
      ),
  },
  {
    path: 'time-tracker',
    loadComponent: () =>
      import('./components/time-tracker/time-tracker.component').then(
        (m) => m.TimeTrackerComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
