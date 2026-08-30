import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category:
    | 'Developer'
    | 'Text'
    | 'Finance'
    | 'Converter'
    | 'Security'
    | 'Other';
  route: string;
  featured?: boolean;
}

interface CategoryOption {
  label: string;
  value: string;
}

const CATEGORIES: CategoryOption[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'DEVELOPER', value: 'Developer' },
  { label: 'TEXT', value: 'Text' },
  { label: 'FINANCE', value: 'Finance' },
  { label: 'CONVERTER', value: 'Converter' },
  { label: 'SECURITY', value: 'Security' },
  { label: 'OTHER', value: 'Other' },
];

const TOOLS: Tool[] = [
  {
    id: 'rental-calculator',
    name: 'Rental Calculator',
    description: 'Calculate rental costs quickly and accurately.',
    category: 'Finance',
    route: '/tools/rental-calculator',
    featured: true,
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate and inspect JSON data.',
    category: 'Developer',
    route: '/tools/json-formatter',
    featured: true,
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong random passwords instantly.',
    category: 'Security',
    route: '/tools/password-generator',
    featured: true,
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert common units without unnecessary steps.',
    category: 'Converter',
    route: '/tools/unit-converter',
    featured: true,
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to readable dates.',
    category: 'Developer',
    route: '/tools/timestamp-converter',
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert HEX, RGB and HSL color values.',
    category: 'Developer',
    route: '/tools/color-converter',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LowerCasePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('searchInput')
  private readonly searchInputRef?: ElementRef<HTMLInputElement>;

  protected readonly categories = CATEGORIES;
  protected readonly searchQuery = signal('');
  protected readonly selectedCategory = signal('ALL');

  private readonly tools = signal<Tool[]>(TOOLS);

  protected readonly totalCount = computed(() => this.tools().length);

  protected readonly featuredTools = computed(() =>
    this.tools().filter((tool) => tool.featured),
  );

  protected readonly filteredTools = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.tools().filter((tool) => {
      const matchesCategory = category === 'ALL' || tool.category === category;

      const matchesQuery =
        query.length === 0 ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  });

  protected readonly hasResults = computed(
    () => this.filteredTools().length > 0,
  );

  protected readonly showFeatured = computed(
    () =>
      this.selectedCategory() === 'ALL' &&
      this.searchQuery().trim().length === 0,
  );

  constructor(private readonly router: Router) {}

  @HostListener('document:keydown', ['$event'])
  protected onGlobalKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;

    const isTyping =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      this.searchInputRef?.nativeElement.focus();
    }
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected selectCategory(value: string): void {
    this.selectedCategory.set(value);
  }

  protected indexLabel(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected surpriseMe(): void {
    const pool = this.tools();

    if (pool.length === 0) {
      return;
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];

    void this.router.navigateByUrl(pick.route);
  }
}
