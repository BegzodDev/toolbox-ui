import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import * as XLSX from 'xlsx';

export interface Student {
  id: string;
  fullName: string;
}
export interface Seat {
  id: string;
  row: number;
  column: number;
  studentId: string | null;
}
export interface SeatingLayout {
  rows: number;
  columns: number;
  seats: Seat[];
}
export interface SavedArrangement {
  id: string;
  name: string;
  createdAt: string;
  students: Student[];
  layout: SeatingLayout;
}
interface StoredState {
  rows: number;
  columns: number;
  students: Student[];
  layout: SeatingLayout;
  history: SavedArrangement[];
}

@Component({
  selector: 'app-student-seat-randomizer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './student-seat-randomizer.component.html',
  styleUrl: './student-seat-randomizer.component.scss',
})
export class StudentSeatRandomizerComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private translations: Record<string, string> = {};
  rows = 4;
  columns = 5;
  newStudent = '';
  feedback = '';
  feedbackType: 'success' | 'error' = 'success';
  students: Student[] = [];
  selectedSeatId: string | null = null;
  saveDialog = false;
  saveName = '';
  history: SavedArrangement[] = [];
  deleteTarget: SavedArrangement | null = null;
  deleteDialog = false;
  layout: SeatingLayout = this.createLayout(4, 5);

  constructor() {
    this.transloco
      .selectTranslateObject<Record<string, string>>('seatRandomizer')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translations) => (this.translations = translations));
    if (isPlatformBrowser(this.platformId)) this.restore();
  }
  t(key: string): string {
    return this.translations[key] ?? '';
  }
  get assignedCount(): number {
    return this.layout.seats.filter((seat) => seat.studentId).length;
  }
  get unassigned(): Student[] {
    const ids = new Set(
      this.layout.seats
        .map((seat) => seat.studentId)
        .filter((id): id is string => id !== null),
    );
    return this.students.filter((student) => !ids.has(student.id));
  }
  get unassignedCount(): string {
    return `${this.unassigned.length}`;
  }
  studentFor(seat: Seat): Student | undefined {
    return this.students.find((student) => student.id === seat.studentId);
  }

  addStudent(): void {
    const fullName = this.newStudent.trim().replace(/\s+/g, ' ');
    if (!fullName) return;
    if (
      this.students.some(
        (student) =>
          student.fullName.toLocaleLowerCase() === fullName.toLocaleLowerCase(),
      )
    ) {
      this.notice('duplicate', 'error');
      return;
    }
    this.students = [...this.students, { id: this.id(), fullName }];
    this.newStudent = '';
    this.persist();
  }
  removeStudent(student: Student): void {
    this.students = this.students.filter((item) => item.id !== student.id);
    this.layout.seats = this.layout.seats.map((seat) =>
      seat.studentId === student.id ? { ...seat, studentId: null } : seat,
    );
    this.persist();
  }
  editStudent(student: Student): void {
    const name = window
      .prompt(this.t('fullName'), student.fullName)
      ?.trim()
      .replace(/\s+/g, ' ');
    if (!name) return;
    if (
      this.students.some(
        (item) =>
          item.id !== student.id &&
          item.fullName.toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
    ) {
      this.notice('duplicate', 'error');
      return;
    }
    student.fullName = name;
    this.persist();
  }
  applyDimensions(): void {
    if (
      !Number.isInteger(this.rows) ||
      !Number.isInteger(this.columns) ||
      this.rows < 1 ||
      this.columns < 1
    ) {
      this.notice('invalid', 'error');
      return;
    }
    const previous = new Map(
      this.layout.seats.map((seat) => [
        `${seat.row}-${seat.column}`,
        seat.studentId,
      ]),
    );
    this.layout = this.createLayout(this.rows, this.columns, previous);
    this.selectedSeatId = null;
    this.persist();
  }
  randomize(): void {
    if (!this.students.length)
      this.students = Array.from(
        { length: this.rows * this.columns },
        (_, index) => ({
          id: this.id(),
          fullName: `${this.t('fallbackStudent')} ${index + 1}`,
        }),
      );
    const shuffled = [...this.students].sort(() => Math.random() - 0.5);
    this.layout.seats = this.layout.seats.map((seat, index) => ({
      ...seat,
      studentId: shuffled[index]?.id ?? null,
    }));
    this.selectedSeatId = null;
    this.persist();
  }
  selectSeat(seat: Seat): void {
    if (!this.selectedSeatId) {
      this.selectedSeatId = seat.id;
      return;
    }
    if (this.selectedSeatId === seat.id) {
      this.selectedSeatId = null;
      return;
    }
    const first = this.layout.seats.find(
      (item) => item.id === this.selectedSeatId,
    );
    if (first) {
      const studentId = first.studentId;
      first.studentId = seat.studentId;
      seat.studentId = studentId;
    }
    this.selectedSeatId = null;
    this.persist();
  }
  importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          blankrows: false,
        });
        const names = rows
          .map((row) => String(row[0] ?? '').trim())
          .filter(
            (name) => name && !/^full\s*name|^f\.i\.o\.?|^name$/i.test(name),
          );
        const unique = [
          ...new Set(names.map((name) => name.replace(/\s+/g, ' '))),
        ];
        if (!unique.length) throw new Error('empty import');
        this.students = unique.map((fullName) => ({ id: this.id(), fullName }));
        this.layout.seats = this.layout.seats.map((seat) => ({
          ...seat,
          studentId: null,
        }));
        this.persist();
        this.notice('importSuccess', 'success');
      } catch {
        this.notice('importError', 'error');
      } finally {
        input.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }
  openSave(): void {
    this.saveName = `${this.t('title')} ${new Date().toLocaleDateString()}`;
    this.saveDialog = true;
  }
  saveArrangement(): void {
    const name = this.saveName.trim();
    if (!name) return;
    this.history = [
      {
        id: this.id(),
        name,
        createdAt: new Date().toISOString(),
        students: structuredClone(this.students),
        layout: structuredClone(this.layout),
      },
      ...this.history,
    ];
    this.saveDialog = false;
    this.persist();
    this.notice('saved', 'success');
  }
  load(item: SavedArrangement): void {
    this.students = structuredClone(item.students);
    this.layout = structuredClone(item.layout);
    this.rows = item.layout.rows;
    this.columns = item.layout.columns;
    this.selectedSeatId = null;
    this.persist();
    this.notice('loaded', 'success');
  }
  rename(item: SavedArrangement): void {
    const name = window.prompt(this.t('arrangementName'), item.name)?.trim();
    if (name) {
      item.name = name;
      this.persist();
    }
  }
  deleteArrangement(): void {
    if (!this.deleteTarget) return;
    this.history = this.history.filter(
      (item) => item.id !== this.deleteTarget?.id,
    );
    this.deleteTarget = null;
    this.deleteDialog = false;
    this.persist();
  }
  print(): void {
    window.print();
  }
  exportPng(): void {
    const svg = this.planSvg();
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0);
      const link = document.createElement('a');
      link.download = 'seating-plan.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  }
  exportPdf(): void {
    const popup = window.open('', '_blank');
    if (!popup) return;
    popup.document.write(
      `<html><head><title>${this.escape(this.t('title'))}</title><style>body{font-family:Arial;padding:28px}svg{max-width:100%;height:auto}@media print{button{display:none}}</style></head><body><button onclick="print()">${this.escape(this.t('print'))}</button>${this.planSvg()}</body></html>`,
    );
    popup.document.close();
  }
  private createLayout(
    rows: number,
    columns: number,
    previous?: Map<string, string | null>,
  ): SeatingLayout {
    return {
      rows,
      columns,
      seats: Array.from({ length: rows * columns }, (_, index) => {
        const row = Math.floor(index / columns) + 1;
        const column = (index % columns) + 1;
        return {
          id: this.id(),
          row,
          column,
          studentId: previous?.get(`${row}-${column}`) ?? null,
        };
      }),
    };
  }
  private id(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
  private notice(key: string, type: 'success' | 'error'): void {
    this.feedback = this.t(key);
    this.feedbackType = type;
    window.setTimeout(() => (this.feedback = ''), 3500);
  }
  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const state: StoredState = {
        rows: this.rows,
        columns: this.columns,
        students: this.students,
        layout: this.layout,
        history: this.history,
      };
      localStorage.setItem('student-seat-randomizer', JSON.stringify(state));
    } catch {
      this.notice('storageError', 'error');
    }
  }
  private restore(): void {
    try {
      const raw = localStorage.getItem('student-seat-randomizer');
      if (!raw) return;
      const state = JSON.parse(raw) as StoredState;
      if (state.layout && state.students && state.history) {
        this.rows = state.rows;
        this.columns = state.columns;
        this.students = state.students;
        this.layout = state.layout;
        this.history = state.history;
      }
    } catch {
      localStorage.removeItem('student-seat-randomizer');
    }
  }
  private planSvg(): string {
    const cell = 140;
    const width = this.columns * cell + 60;
    const height = this.rows * 88 + 140;
    const seats = this.layout.seats
      .map((seat) => {
        const x = 30 + (seat.column - 1) * cell;
        const y = 110 + (seat.row - 1) * 88;
        const name = this.studentFor(seat)?.fullName ?? '—';
        return `<rect x="${x}" y="${y}" width="120" height="62" rx="9" fill="${seat.studentId ? '#e5a13e' : '#ececec'}"/><text x="${x + 60}" y="${y + 36}" text-anchor="middle" font-size="13" fill="#18202a">${this.escape(name)}</text>`;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#fff"/><text x="30" y="32" font-family="Arial" font-size="20" font-weight="bold">${this.escape(this.t('title'))}</text><rect x="30" y="52" width="${this.columns * cell - 20}" height="35" rx="6" fill="#263746"/><text x="${width / 2}" y="75" text-anchor="middle" font-family="Arial" font-size="14" fill="#fff">${this.escape(this.t('board'))}</text>${seats}</svg>`;
  }
  private escape(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character] ?? character,
    );
  }
}
