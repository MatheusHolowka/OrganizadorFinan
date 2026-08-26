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
    <div class="min-h-screen bg-black text-[#ededed] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm relative z-10 px-4">
        <div class="bg-[#0c0c0e] border border-neutral-800 py-7 px-6 shadow-2xl rounded-2xl sm:px-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
              ▲
            </div>
            <h2 class="text-xl font-extrabold text-white tracking-tight">
              Redefinir Senha
            </h2>
            <p class="mt-1 text-xs text-neutral-400">
              Crie uma nova senha forte para acessar sua conta
            </p>
          </div>

          @if (!token) {
            <div class="text-center py-4 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-rose-950/30 text-rose-400 border border-rose-900/50 mx-auto flex items-center justify-center text-lg font-bold">
                ⚠️
              </div>
              <h3 class="text-sm font-bold text-white">Link Inválido ou Incompleto</h3>
              <p class="text-xs text-neutral-400">
                O token de segurança não foi encontrado. Verifique o link recebido no e-mail.
              </p>
              <a
                routerLink="/login"
                class="inline-block px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium border border-neutral-800 transition-colors"
              >
                Voltar para o Login
              </a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Nova Senha</label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="newPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all pr-9"
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

              <div>
                <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all"
                />
                @if (form.value.newPassword && form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword) {
                  <span class="text-[10px] text-rose-400 mt-1 block">As senhas digitadas não coincidem.</span>
                }
              </div>

              <button
                type="submit"
                [disabled]="form.invalid || passwordStrengthScore < 4 || form.value.newPassword !== form.value.confirmPassword || loading()"
                class="w-full mt-2 py-3 px-4 btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                @if (loading()) {
                  <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Atualizando...</span>
                } @else {
                  <span>Salvar Nova Senha</span>
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
      case 4: return 'Forte';
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
