import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialogService.isOpen()) {
      <div class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <!-- Backdrop escuro com blur suave -->
        <div
          (click)="dialogService.onCancel()"
          class="absolute inset-0 bg-surface-950/80 backdrop-blur-md transition-opacity animate-fade-in"
        ></div>

        <!-- Modal Card -->
        <div
          class="relative w-full max-w-md bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-2xl overflow-hidden animate-scale-in z-10"
        >
          <!-- Brilho de fundo temático -->
          <div
            class="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
            [ngClass]="{
              'bg-rose-500': dialogService.dialogOptions()?.type === 'danger',
              'bg-amber-500': dialogService.dialogOptions()?.type === 'warning',
              'bg-brand-500': dialogService.dialogOptions()?.type === 'info'
            }"
          ></div>

          <div class="flex items-start gap-4">
            <!-- Ícone estilizado com badge -->
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold shadow-inner"
              [ngClass]="{
                'bg-rose-500/15 text-rose-400 border border-rose-500/30': dialogService.dialogOptions()?.type === 'danger',
                'bg-amber-500/15 text-amber-400 border border-amber-500/30': dialogService.dialogOptions()?.type === 'warning',
                'bg-brand-500/15 text-brand-400 border border-brand-500/30': dialogService.dialogOptions()?.type === 'info'
              }"
            >
              @if (dialogService.dialogOptions()?.type === 'danger') {
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              } @else if (dialogService.dialogOptions()?.type === 'warning') {
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else {
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            </div>

            <!-- Textos -->
            <div class="flex-1">
              <h3 class="text-lg font-bold text-white font-display">
                {{ dialogService.dialogOptions()?.title }}
              </h3>
              <p class="text-xs text-surface-300 mt-1.5 leading-relaxed">
                {{ dialogService.dialogOptions()?.message }}
              </p>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-800">
            <button
              type="button"
              (click)="dialogService.onCancel()"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white text-xs font-semibold transition-colors"
            >
              {{ dialogService.dialogOptions()?.cancelText }}
            </button>

            <button
              type="button"
              (click)="dialogService.onConfirm()"
              class="px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
              [ngClass]="{
                'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25': dialogService.dialogOptions()?.type === 'danger',
                'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25': dialogService.dialogOptions()?.type === 'warning',
                'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25': dialogService.dialogOptions()?.type === 'info'
              }"
            >
              {{ dialogService.dialogOptions()?.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  dialogService = inject(DialogService);

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.dialogService.isOpen()) {
      this.dialogService.onCancel();
    }
  }
}
