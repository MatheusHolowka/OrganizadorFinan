import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 4500;
    const newToast: ToastMessage = { ...toast, id, duration };

    this.toasts.update((list) => [...list, newToast]);
  }

  success(message: string, title: string = 'Sucesso!') {
    this.show({ type: 'success', title, message, duration: 4500 });
  }

  error(message: string, title: string = 'Erro!') {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(message: string, title: string = 'Atenção!') {
    this.show({ type: 'warning', title, message, duration: 5000 });
  }

  info(message: string, title: string = 'Informação') {
    this.show({ type: 'info', title, message, duration: 4500 });
  }

  remove(id: string) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
