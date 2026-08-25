import { Component, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (mouseenter)="pauseTimer()"
      (mouseleave)="resumeTimer()"
      class="pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-up relative overflow-hidden group cursor-pointer"
      [ngClass]="{
        'bg-surface-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40': toast.type === 'success',
        'bg-surface-900/95 border-rose-500/40 text-rose-300 shadow-rose-950/40': toast.type === 'error',
        'bg-surface-900/95 border-amber-500/40 text-amber-300 shadow-amber-950/40': toast.type === 'warning',
        'bg-surface-900/95 border-sky-500/40 text-sky-300 shadow-sky-950/40': toast.type === 'info'
      }"
    >
      <!-- Barra lateral luminosa de destaque -->
      <div
        class="absolute top-0 left-0 bottom-1 w-1.5"
        [ngClass]="{
          'bg-emerald-400 shadow-[0_0_10px_#10b981]': toast.type === 'success',
          'bg-rose-400 shadow-[0_0_10px_#f43f5e]': toast.type === 'error',
          'bg-amber-400 shadow-[0_0_10px_#f59e0b]': toast.type === 'warning',
          'bg-sky-400 shadow-[0_0_10px_#38bdf8]': toast.type === 'info'
        }"
      ></div>

      <!-- Ícone com badge estilizado -->
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-inner"
        [ngClass]="{
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30': toast.type === 'success',
          'bg-rose-500/20 text-rose-400 border border-rose-500/30': toast.type === 'error',
          'bg-amber-500/20 text-amber-400 border border-amber-500/30': toast.type === 'warning',
          'bg-sky-500/20 text-sky-400 border border-sky-500/30': toast.type === 'info'
        }"
      >
        @if (toast.type === 'success') {
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        } @else if (toast.type === 'error') {
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        } @else if (toast.type === 'warning') {
          <span>⚠️</span>
        } @else {
          <span>ℹ️</span>
        }
      </div>

      <!-- Conteúdo da mensagem -->
      <div class="flex-1 pr-2">
        <div class="flex items-center justify-between">
          @if (toast.title) {
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-0.5">{{ toast.title }}</h4>
          }
          @if (isPaused()) {
            <span class="text-[10px] uppercase font-bold tracking-widest text-surface-400 px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">Pausado</span>
          }
        </div>
        <p class="text-xs text-surface-300 leading-relaxed font-medium mt-0.5">{{ toast.message }}</p>
      </div>

      <!-- Botão Fechar -->
      <button
        type="button"
        (click)="close()"
        class="text-surface-400 hover:text-white p-1 rounded-lg hover:bg-surface-800/80 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Barra de carregamento/progresso de fechamento -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-surface-950/80 overflow-hidden">
        <div
          class="h-full transition-all"
          [style.animation]="'shrinkWidth ' + duration + 'ms linear forwards'"
          [style.animationPlayState]="isPaused() ? 'paused' : 'running'"
          [ngClass]="{
            'bg-emerald-400 shadow-[0_0_8px_#10b981]': toast.type === 'success',
            'bg-rose-400 shadow-[0_0_8px_#f43f5e]': toast.type === 'error',
            'bg-amber-400 shadow-[0_0_8px_#f59e0b]': toast.type === 'warning',
            'bg-sky-400 shadow-[0_0_8px_#38bdf8]': toast.type === 'info'
          }"
        ></div>
      </div>
    </div>
  `,
})
export class ToastItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) toast!: ToastMessage;
  toastService = inject(ToastService);

  duration = 4500;
  remainingTime = 4500;
  startTime = 0;
  timerId: any = null;
  isPaused = signal(false);

  ngOnInit() {
    this.duration = this.toast.duration || 4500;
    this.remainingTime = this.duration;
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startTimer() {
    this.startTime = Date.now();
    this.timerId = setTimeout(() => {
      this.close();
    }, this.remainingTime);
  }

  pauseTimer() {
    if (this.timerId) {
      const elapsed = Date.now() - this.startTime;
      this.remainingTime = Math.max(300, this.remainingTime - elapsed);
      this.clearTimer();
      this.isPaused.set(true);
    }
  }

  resumeTimer() {
    if (this.isPaused()) {
      this.isPaused.set(false);
      this.startTimer();
    }
  }

  clearTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  close() {
    this.clearTimer();
    this.toastService.remove(this.toast.id);
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, ToastItemComponent],
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      @for (t of toastService.toasts(); track t.id) {
        <app-toast-item [toast]="t" />
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
