import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-furigana-reader',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './furigana-reader.component.html',
  styleUrl: './furigana-reader.component.scss',
})
export class FuriganaReaderComponent {}
