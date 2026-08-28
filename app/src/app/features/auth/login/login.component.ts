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
    <div class="min-h-screen flex items-center justify-center p-4 bg-black text-[#ededed] relative overflow-hidden font-sans">
      <div class="relative w-full max-w-[400px] p-8 rounded-2xl bg-[#0c0c0e] border border-neutral-800 shadow-2xl animate-slide-up z-10">
        <!-- Logo & Header -->
        <div class="text-center mb-7">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
            ▲
          </div>
          <h1 class="text-xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
          <p class="text-xs text-neutral-400 mt-1">Acesse sua conta no FINAN</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-5 p-3 rounded-xl bg-rose-950/20 border border-rose-900/50 text-rose-300 text-xs flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="leading-tight">{{ errorMessage() }}</span>
            </div>
            @if (isAccountLocked()) {
              <button
                type="button"
                (click)="openForgotPasswordModal()"
                class="text-left text-xs font-semibold text-white underline hover:text-neutral-300 mt-1 cursor-pointer"
              >
                Reenviar e-mail de desbloqueio e senha
              </button>
            } @else if (isUnverifiedEmail()) {
              <a
                [routerLink]="['/verify-email']"
                [queryParams]="{ email: form.value.email }"
                class="text-left text-xs font-semibold text-white underline hover:text-neutral-300 mt-1 cursor-pointer"
              >
                Confirmar ativação de e-mail →
              </a>
            }
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">E-mail</label>
            <input
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all text-xs"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-medium text-neutral-300">Senha</label>
              <button
                type="button"
                (click)="openForgotPasswordModal()"
                class="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Esqueci a senha
              </button>
            </div>
            <input
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all text-xs"
            />
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full mt-2 py-3 px-4 btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            @if (loading()) {
              <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>Entrando...</span>
            } @else {
              <span>Entrar</span>
            }
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
          <span>Não tem uma conta?</span>
          <a routerLink="/register" class="text-white font-semibold hover:underline">Criar conta</a>
        </div>
      </div>

      <!-- Modal Esqueci Minha Senha -->
      <app-modal
        [isOpen]="isForgotModalOpen()"
        title="Recuperar Senha"
        (close)="isForgotModalOpen.set(false)"
        (closeModal)="isForgotModalOpen.set(false)"
      >
        <div class="space-y-4">
          <p class="text-xs text-neutral-400 leading-relaxed">
            Informe o e-mail cadastrado. Enviaremos um link seguro para você redefinir sua senha.
          </p>

          <div>
            <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">E-mail Cadastrado</label>
            <input
              type="email"
              [(ngModel)]="forgotEmail"
              placeholder="seu@email.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all"
            />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              (click)="isForgotModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="sendForgotLink()"
              [disabled]="!forgotEmail || forgotLoading()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              @if (forgotLoading()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Enviando...</span>
              } @else {
                <span>Enviar Link</span>
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
