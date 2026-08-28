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
    <div class="min-h-screen flex items-center justify-center p-4 bg-black text-[#ededed] relative overflow-hidden font-sans">
      <div class="relative w-full max-w-[400px] p-8 rounded-2xl bg-[#0c0c0e] border border-neutral-800 shadow-2xl animate-slide-up z-10">
        <!-- Logo & Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
            ▲
          </div>
          <h1 class="text-xl font-bold text-white tracking-tight">Criar sua conta</h1>
          <p class="text-xs text-neutral-400 mt-1">FINAN — Gestão financeira de alta precisão</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-5 p-3 rounded-xl bg-rose-950/20 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="leading-tight">{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-3.5">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Nome Completo</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Seu nome"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all text-xs"
            />
          </div>

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
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Senha</label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all text-xs pr-9"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Medidor de Força de Senha -->
          <div class="p-3 rounded-xl bg-black border border-neutral-800 space-y-2">
            <div class="flex justify-between items-center text-[10px] font-mono">
              <span class="text-neutral-500 uppercase">Segurança:</span>
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

            <div class="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-neutral-900">
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 1 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : (passwordStrengthScore >= 2 ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-neutral-900'"
              ></div>
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 2 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-neutral-900'"
              ></div>
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 3 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-neutral-900'"
              ></div>
              <div
                class="h-full rounded-full transition-all duration-300"
                [ngClass]="passwordStrengthScore >= 4 ? 'bg-emerald-400' : 'bg-neutral-900'"
              ></div>
            </div>

            <div class="grid grid-cols-2 gap-1 pt-1 text-[10px] font-mono">
              <div class="flex items-center gap-1" [ngClass]="hasMinLength ? 'text-emerald-400' : 'text-neutral-600'">
                <span>{{ hasMinLength ? '✓' : '○' }}</span>
                <span>Mín. 8 chars</span>
              </div>
              <div class="flex items-center gap-1" [ngClass]="hasUpperAndLower ? 'text-emerald-400' : 'text-neutral-600'">
                <span>{{ hasUpperAndLower ? '✓' : '○' }}</span>
                <span>Maiúsc. & Minúsc.</span>
              </div>
              <div class="flex items-center gap-1" [ngClass]="hasNumber ? 'text-emerald-400' : 'text-neutral-600'">
                <span>{{ hasNumber ? '✓' : '○' }}</span>
                <span>1 número</span>
              </div>
              <div class="flex items-center gap-1" [ngClass]="hasSpecial ? 'text-emerald-400' : 'text-neutral-600'">
                <span>{{ hasSpecial ? '✓' : '○' }}</span>
                <span>Símbolo (@#$)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || passwordStrengthScore < 4 || loading()"
            class="w-full mt-2 py-3 px-4 btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            @if (loading()) {
              <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>Enviando código...</span>
            } @else {
              <span>Criar Conta</span>
            }
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
          <span>Já possui cadastro?</span>
          <a routerLink="/login" class="text-white font-semibold hover:underline">Fazer login</a>
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
      case 4: return 'Forte';
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
