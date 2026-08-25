import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './time-tracker.component.html',
  styleUrl: './time-tracker.component.scss',
})
export class TimeTrackerComponent {}
