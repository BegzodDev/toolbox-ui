import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-seat-generator',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './seat-generator.component.html',
  styleUrl: './seat-generator.component.scss',
})
export class SeatGeneratorComponent {}
