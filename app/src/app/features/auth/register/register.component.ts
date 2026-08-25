import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative w-full max-w-md p-8 rounded-3xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-xl shadow-glass-dark animate-slide-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-bold text-xl shadow-lg shadow-emerald-500/20 mb-4">
            OF
          </div>
          <h1 class="text-2xl font-bold text-white font-display">Comece Agora</h1>
          <p class="text-sm text-surface-400 mt-1">Crie sua conta no Organizador Financeiro Inteligente</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">Nome Completo</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Seu nome"
              class="w-full px-4 py-3 rounded-2xl bg-surface-950/70 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">E-mail Válido</label>
            <input
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              class="w-full px-4 py-3 rounded-2xl bg-surface-950/70 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="text-[10px] text-rose-400 mt-1 block">Insira um endereço de e-mail válido (ex: nome&#64;dominio.com).</span>
            }
          </div>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">Senha Forte</label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-2xl bg-surface-950/70 border border-surface-700 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm pr-10"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-white text-xs"
              >
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Medidor de Força de Senha -->
          <div class="p-3 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-bold uppercase text-surface-400">Força da Senha:</span>
              <span
                class="font-bold uppercase"
                [ngClass]="{
                  'text-rose-400': passwordStrengthScore < 2,
                  'text-amber-400': passwordStrengthScore >= 2 && passwordStrengthScore < 4,
                  'text-emerald-400': passwordStrengthScore === 4
                }"
              >
                {{ passwordStrengthLabel }}
              </span>
            </div>

            <div class="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-surface-800">
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 1 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : (passwordStrengthScore >= 2 ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-surface-800'"
              ></div>
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 2 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-surface-800'"
              ></div>
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 3 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-surface-800'"
              ></div>
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 4 ? 'bg-emerald-400' : 'bg-surface-800'"
              ></div>
            </div>

            <div class="grid grid-cols-2 gap-1 pt-1 text-[10px]">
              <div class="flex items-center gap-1" [ngClass]="hasMinLength ? 'text-emerald-400' : 'text-surface-500'">
                <span>{{ hasMinLength ? '✓' : '○' }}</span>
                <span>Mín. 8 caracteres</span>
              </div>
              <div class="flex items-center gap-1" [ngClass]="hasUpperAndLower ? 'text-emerald-400' : 'text-surface-500'">
                <span>{{ hasUpperAndLower ? '✓' : '○' }}</span>
                <span>Maiúscula & Minúscula</span>
              </div>
              <div class="flex items-center gap-1" [ngClass]="hasNumber ? 'text-emerald-400' : 'text-surface-500'">
                <span>{{ hasNumber ? '✓' : '○' }}</span>
                <span>Pelo menos 1 número</span>
              </div>
              <div class="flex items-center gap-1" [ngClass]="hasSpecial ? 'text-emerald-400' : 'text-surface-500'">
                <span>{{ hasSpecial ? '✓' : '○' }}</span>
                <span>Caractere especial (@#$)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || passwordStrengthScore < 4 || loading()"
            class="w-full mt-2 py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all text-sm flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enviando confirmação...</span>
            } @else {
              <span>Criar Conta e Confirmar E-mail</span>
            }
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-surface-400">
          Já possui cadastro?
          <a routerLink="/login" class="text-brand-400 font-semibold hover:underline ml-1">Fazer login</a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get password(): string {
    return this.form.value.password || '';
  }

  get hasMinLength(): boolean {
    return this.password.length >= 8;
  }

  get hasUpperAndLower(): boolean {
    return /[a-z]/.test(this.password) && /[A-Z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  get hasSpecial(): boolean {
    return /[@$!%*?&#]/.test(this.password);
  }

  get passwordStrengthScore(): number {
    let score = 0;
    if (this.hasMinLength) score++;
    if (this.hasUpperAndLower) score++;
    if (this.hasNumber) score++;
    if (this.hasSpecial) score++;
    return score;
  }

  get passwordStrengthLabel(): string {
    switch (this.passwordStrengthScore) {
      case 4: return 'Forte & Segura';
      case 3: return 'Média';
      case 2: return 'Fraca';
      default: return 'Muito Fraca';
    }
  }

  onSubmit() {
    if (this.form.invalid || this.passwordStrengthScore < 4) {
      this.toastService.error('Crie uma senha forte e insira um e-mail válido.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.form.value;

    this.authService.register({ name: name!, email: email!, password: password! }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.toastService.success(res.message, 'Código Enviado!');
        this.router.navigate(['/verify-email'], {
          queryParams: { email },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao registrar usuário.');
      },
    });
  }
}
