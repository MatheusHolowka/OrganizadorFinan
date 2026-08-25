import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div
        (click)="onBackdropClick($event)"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="relative w-full max-w-lg rounded-3xl bg-surface-900 border border-surface-700/80 p-6 shadow-glass-dark animate-slide-up max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-surface-800">
            <h3 class="text-lg font-bold text-white font-display">{{ title() }}</h3>
            <button
              type="button"
              (click)="onClose()"
              aria-label="Fechar"
              class="p-1.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input.required<string>();
  close = output<void>();
  closeModal = output<void>();

  onClose() {
    this.close.emit();
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
