import { Component, ElementRef, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left" [class.w-full]="fullWidth">
      <!-- Botão Trigger -->
      <button
        type="button"
        (click)="toggle()"
        [class]="buttonClass"
        class="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-medium hover:border-neutral-700 focus:outline-none transition-all cursor-pointer shadow-sm"
      >
        <div class="flex items-center gap-2 truncate">
          @if (selectedOption()?.color) {
            <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="selectedOption()!.color"></span>
          }
          <span class="truncate">{{ selectedOption() ? selectedOption()!.label : (placeholder || 'Selecione...') }}</span>
        </div>

        <svg
          class="w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 shrink-0"
          [class.rotate-180]="isOpen()"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu Flutuante Dark Glassmorphism -->
      @if (isOpen()) {
        <div
          class="absolute z-50 mt-1.5 min-w-full w-max max-w-xs max-h-60 overflow-y-auto rounded-xl bg-[#0c0c0e] border border-neutral-800 shadow-2xl p-1 text-xs font-sans animate-fade-in backdrop-blur-xl"
        >
          @for (option of options; track option.value) {
            <button
              type="button"
              (click)="selectOption(option)"
              [class]="option.value === value ? 'bg-neutral-800/80 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'"
              class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-2 truncate">
                @if (option.color) {
                  <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="option.color"></span>
                }
                <span class="truncate">{{ option.label }}</span>
                @if (option.sublabel) {
                  <span class="text-[10px] text-neutral-500 font-mono">({{ option.sublabel }})</span>
                }
              </div>

              @if (option.value === value) {
                <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class CustomSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() value: any;
  @Input() placeholder = '';
  @Input() fullWidth = false;
  @Input() buttonClass = '';

  @Output() valueChange = new EventEmitter<any>();

  isOpen = signal(false);

  constructor(private elementRef: ElementRef) {}

  get selectedOption(): () => SelectOption | undefined {
    return () => this.options.find((o) => o.value === this.value);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  selectOption(option: SelectOption) {
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
