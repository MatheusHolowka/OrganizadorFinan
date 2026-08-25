import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-surface-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Fundo decorativo com glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 class="mt-4 text-center text-2xl font-bold tracking-tight text-white font-display">
          Redefinir Senha Segura
        </h2>
        <p class="mt-1 text-center text-xs text-surface-400">
          Crie uma nova senha forte para desbloquear e acessar sua conta
        </p>
      </div>

      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div class="bg-surface-900/80 border border-surface-800 py-8 px-6 shadow-2xl rounded-3xl backdrop-blur-xl sm:px-10">
          @if (!token) {
            <div class="text-center py-6 space-y-4">
              <div class="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 mx-auto flex items-center justify-center text-xl font-bold">
                ⚠️
              </div>
              <h3 class="text-base font-bold text-white">Link Inválido ou Incompleto</h3>
              <p class="text-xs text-surface-400">
                O token de segurança não foi encontrado na URL. Verifique o link recebido no seu e-mail.
              </p>
              <a
                routerLink="/login"
                class="inline-block px-5 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold transition-colors"
              >
                Voltar para o Login
              </a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Nova Senha</label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="newPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all pr-10"
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

                <div class="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
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
                    <span>Caractere especial (!@#$)</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
                @if (form.value.newPassword && form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword) {
                  <span class="text-[10px] text-rose-400 mt-1 block">As senhas digitadas não coincidem.</span>
                }
              </div>

              <button
                type="submit"
                [disabled]="form.invalid || passwordStrengthScore < 4 || form.value.newPassword !== form.value.confirmPassword || loading()"
                class="w-full mt-2 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                @if (loading()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Atualizando Senha...</span>
                } @else {
                  <span>Salvar Nova Senha & Entrar</span>
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  token = '';
  loading = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  get password(): string {
    return this.form.value.newPassword || '';
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
    if (this.form.invalid || !this.token || this.passwordStrengthScore < 4) return;
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.toastService.error('As senhas não coincidem.');
      return;
    }

    this.loading.set(true);
    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.form.value.newPassword!,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.toastService.success(res.message, 'Senha Redefinida');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading.set(false);
          this.toastService.error(err.error?.message || 'Erro ao redefinir senha.');
        },
      });
  }
}
