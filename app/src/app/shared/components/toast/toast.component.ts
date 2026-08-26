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
      class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-2xl border bg-[#0c0c0e]/95 backdrop-blur-xl transition-all duration-200 animate-slide-up relative overflow-hidden group cursor-pointer"
      [ngClass]="{
        'border-emerald-500/40 text-emerald-300': toast.type === 'success',
        'border-rose-500/40 text-rose-300': toast.type === 'error',
        'border-amber-500/40 text-amber-300': toast.type === 'warning',
        'border-neutral-700 text-neutral-200': toast.type === 'info'
      }"
    >
      <!-- Ícone com badge -->
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
        [ngClass]="{
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': toast.type === 'success',
          'bg-rose-500/10 text-rose-400 border border-rose-500/20': toast.type === 'error',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20': toast.type === 'warning',
          'bg-neutral-800 text-white border border-neutral-700': toast.type === 'info'
        }"
      >
        @if (toast.type === 'success') {
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        } @else if (toast.type === 'error') {
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        } @else if (toast.type === 'warning') {
          <span>⚠️</span>
        } @else {
          <span>ℹ️</span>
        }
      </div>

      <!-- Conteúdo da mensagem -->
      <div class="flex-1 pr-1">
        @if (toast.title) {
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-0.5">{{ toast.title }}</h4>
        }
        <p class="text-xs text-neutral-300 leading-relaxed font-normal">{{ toast.message }}</p>
      </div>

      <!-- Botão Fechar -->
      <button
        type="button"
        (click)="close()"
        class="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Barra de progresso -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 overflow-hidden">
        <div
          class="h-full transition-all"
          [style.animation]="'shrinkWidth ' + duration + 'ms linear forwards'"
          [style.animationPlayState]="isPaused() ? 'paused' : 'running'"
          [ngClass]="{
            'bg-emerald-400': toast.type === 'success',
            'bg-rose-400': toast.type === 'error',
            'bg-amber-400': toast.type === 'warning',
            'bg-white': toast.type === 'info'
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
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      @for (t of toastService.toasts(); track t.id) {
        <app-toast-item [toast]="t" />
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
