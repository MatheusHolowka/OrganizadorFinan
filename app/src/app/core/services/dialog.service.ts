import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  isOpen = signal(false);
  dialogOptions = signal<ConfirmDialogOptions | null>(null);

  private resolvePromise?: (value: boolean) => void;

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    this.dialogOptions.set({
      title: options.title || 'Confirmação',
      message: options.message,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      type: options.type || 'danger',
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  onConfirm() {
    this.isOpen.set(false);
    if (this.resolvePromise) {
      this.resolvePromise(true);
      this.resolvePromise = undefined;
    }
  }

  onCancel() {
    this.isOpen.set(false);
    if (this.resolvePromise) {
      this.resolvePromise(false);
      this.resolvePromise = undefined;
    }
  }
}
