import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ModalComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      <!-- Glow background circles -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative w-full max-w-md p-8 rounded-3xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-xl shadow-glass-dark animate-slide-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-bold text-xl shadow-lg shadow-emerald-500/20 mb-4">
            OF
          </div>
          <h1 class="text-2xl font-bold text-white font-display">Bem-vindo de volta</h1>
          <p class="text-sm text-surface-400 mt-1">Acesse seu Organizador Financeiro Inteligente</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium leading-relaxed">{{ errorMessage() }}</span>
            </div>
            @if (isAccountLocked()) {
              <button
                type="button"
                (click)="openForgotPasswordModal()"
                class="text-left text-xs font-bold text-white underline hover:text-brand-400 mt-1"
              >
                📧 Reenviar e-mail de troca de senha e desbloqueio
              </button>
            } @else if (isUnverifiedEmail()) {
              <a
                [routerLink]="['/verify-email']"
                [queryParams]="{ email: form.value.email }"
                class="text-left text-xs font-bold text-brand-400 underline hover:text-brand-300 mt-1"
              >
                ✉️ Clique aqui para abrir a tela de confirmação de e-mail
              </a>
            }
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">E-mail</label>
            <input
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              class="w-full px-4 py-3 rounded-2xl bg-surface-950/70 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-semibold text-surface-300 uppercase tracking-wider">Senha</label>
              <button
                type="button"
                (click)="openForgotPasswordModal()"
                class="text-xs text-brand-400 hover:underline font-medium"
              >
                Esqueci a senha
              </button>
            </div>
            <input
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-2xl bg-surface-950/70 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full mt-2 py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all text-sm flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Entrando...</span>
            } @else {
              <span>Entrar no Sistema</span>
            }
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-surface-400">
          Não tem uma conta?
          <a routerLink="/register" class="text-brand-400 font-semibold hover:underline ml-1">Criar conta gratuita</a>
        </div>
      </div>

      <!-- Modal Esqueci Minha Senha -->
      <app-modal
        [isOpen]="isForgotModalOpen()"
        title="Recuperar / Trocar Senha"
        (close)="isForgotModalOpen.set(false)"
        (closeModal)="isForgotModalOpen.set(false)"
      >
        <div class="space-y-4">
          <p class="text-xs text-surface-300 leading-relaxed">
            Informe o e-mail cadastrado. Enviaremos um <strong>link seguro por e-mail</strong> para você redefinir sua senha e desbloquear sua conta.
          </p>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Seu E-mail Cadastrado</label>
            <input
              type="email"
              [(ngModel)]="forgotEmail"
              placeholder="seu@email.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="isForgotModalOpen.set(false)"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="sendForgotLink()"
              [disabled]="!forgotEmail || forgotLoading()"
              class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              @if (forgotLoading()) {
                <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Enviando Link...</span>
              } @else {
                <span>Enviar Link por E-mail</span>
              }
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  isAccountLocked = signal(false);
  isUnverifiedEmail = signal(false);

  isForgotModalOpen = signal(false);
  forgotEmail = '';
  forgotLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.isAccountLocked.set(false);
    this.isUnverifiedEmail.set(false);

    const { email, password } = this.form.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Erro ao realizar login. Verifique seus dados.';
        this.errorMessage.set(msg);
        if (msg.includes('bloqueada') || msg.includes('bloqueio')) {
          this.isAccountLocked.set(true);
        } else if (msg.includes('confirmado') || msg.includes('confirmação') || msg.includes('ativação')) {
          this.isUnverifiedEmail.set(true);
        }
      },
    });
  }

  openForgotPasswordModal() {
    this.forgotEmail = this.form.value.email || '';
    this.isForgotModalOpen.set(true);
  }

  sendForgotLink() {
    if (!this.forgotEmail) return;

    this.forgotLoading.set(true);
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => {
        this.forgotLoading.set(false);
        this.isForgotModalOpen.set(false);
        this.toastService.success(res.message, 'Link Enviado!');
      },
      error: (err) => {
        this.forgotLoading.set(false);
        this.toastService.error(err.error?.message || 'Erro ao solicitar link de redefinição.');
      },
    });
  }
}
