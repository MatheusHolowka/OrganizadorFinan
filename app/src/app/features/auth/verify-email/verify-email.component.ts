import { Component, OnInit, inject, signal, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      <!-- Background glows -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative w-full max-w-md p-8 rounded-3xl bg-surface-900/85 border border-surface-700/80 backdrop-blur-xl shadow-glass-dark animate-slide-up text-center">
        <!-- ESTADO: SUCESSO -->
        @if (isSuccess()) {
          <div class="py-8 space-y-4 animate-fade-in">
            <div class="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <h2 class="text-2xl font-bold text-white font-display">E-mail Confirmado com Sucesso!</h2>
            <p class="text-xs text-surface-300 leading-relaxed max-w-xs mx-auto">
              Sua conta foi ativada. Redirecionando você para o painel...
            </p>
            <div class="pt-3">
              <a
                routerLink="/dashboard"
                class="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all inline-block"
              >
                Ir para o Dashboard
              </a>
            </div>
          </div>
        }

        <!-- ESTADO: FORMULÁRIO DE CÓDIGO DE 6 DÍGITOS -->
        @else {
          <div>
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/20 text-2xl mb-4 shadow-lg shadow-brand-500/10">
              ✉️
            </div>
            <h1 class="text-2xl font-bold text-white font-display">Confirme seu E-mail</h1>
            <p class="text-xs text-surface-400 mt-1">
              Enviamos um código de 6 dígitos para o seu e-mail:
            </p>
            <div class="mt-1 px-3 py-1 bg-surface-950/80 rounded-full border border-surface-800 inline-block text-xs font-semibold text-brand-300">
              {{ email || 'seu e-mail' }}
            </div>

            @if (errorMessage()) {
              <div class="mt-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- 6 INPUTS DE OTP -->
            <div class="my-6">
              <label class="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">
                Digite o Código de 6 Dígitos
              </label>
              <div class="flex justify-center items-center gap-2 sm:gap-3" (paste)="onPaste($event)">
                @for (digit of digits; track $index) {
                  <input
                    #digitInput
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    [value]="digits[$index]"
                    (input)="onInput($event, $index)"
                    (keydown)="onKeyDown($event, $index)"
                    (focus)="onFocus($index)"
                    class="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-2xl bg-surface-950 border text-white transition-all focus:outline-none focus:scale-105"
                    [ngClass]="digits[$index] ? 'border-brand-500 text-brand-400 bg-brand-500/5 shadow-md shadow-brand-500/10' : 'border-surface-700 text-white focus:border-brand-500'"
                  />
                }
              </div>
            </div>

            <!-- BOTÃO CONFIRMAR -->
            <button
              type="button"
              (click)="submitCode()"
              [disabled]="isCodeIncomplete || loading()"
              class="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold shadow-lg shadow-brand-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Validando Código...</span>
              } @else {
                <span>Confirmar e Ativar Conta</span>
              }
            </button>

            <!-- REENVIAR CÓDIGO COM CONTADOR -->
            <div class="mt-6 pt-4 border-t border-surface-800/80 text-xs text-surface-400 space-y-2">
              <p>Não recebeu o código no e-mail?</p>
              @if (resendCooldown() > 0) {
                <span class="text-surface-500 font-medium">
                  Aguarde <strong class="text-surface-300">{{ resendCooldown() }}s</strong> para reenviar
                </span>
              } @else {
                <button
                  type="button"
                  (click)="resendCode()"
                  [disabled]="resendLoading()"
                  class="font-bold text-brand-400 hover:text-brand-300 underline transition-colors"
                >
                  {{ resendLoading() ? 'Reenviando...' : 'Reenviar Novo Código' }}
                </button>
              }
            </div>

            <div class="mt-4 text-center">
              <a routerLink="/login" class="text-xs text-surface-500 hover:text-surface-300">
                ← Voltar para a tela de Login
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit, AfterViewInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email = '';
  digits: string[] = ['', '', '', '', '', ''];
  loading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  resendCooldown = signal(0);
  resendLoading = signal(false);
  private timer: any;

  get fullCode(): string {
    return this.digits.join('');
  }

  get isCodeIncomplete(): boolean {
    return this.fullCode.length < 6;
  }

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    const codeParam = this.route.snapshot.queryParams['code'] || this.route.snapshot.queryParams['token'];

    if (codeParam && codeParam.length === 6) {
      this.digits = codeParam.split('');
      this.submitCode();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusInput(0);
    }, 100);
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // apenas números

    if (value) {
      this.digits[index] = value.slice(-1); // pega o último caractere digitado
      input.value = this.digits[index];
      this.errorMessage.set(null);

      // Avança para o próximo campo
      if (index < 5) {
        this.focusInput(index + 1);
      } else if (!this.isCodeIncomplete) {
        this.submitCode();
      }
    } else {
      this.digits[index] = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (!this.digits[index] && index > 0) {
        this.digits[index - 1] = '';
        this.focusInput(index - 1);
      } else {
        this.digits[index] = '';
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    } else if (event.key === 'Enter' && !this.isCodeIncomplete) {
      this.submitCode();
    }
  }

  onFocus(index: number) {
    const inputs = this.digitInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.select();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    const cleanNumbers = clipboardData.replace(/\D/g, '').slice(0, 6);

    if (cleanNumbers) {
      const chars = cleanNumbers.split('');
      for (let i = 0; i < 6; i++) {
        this.digits[i] = chars[i] || '';
      }

      const nextFocus = Math.min(cleanNumbers.length, 5);
      this.focusInput(nextFocus);

      if (cleanNumbers.length === 6) {
        this.submitCode();
      }
    }
  }

  focusInput(index: number) {
    const inputs = this.digitInputs?.toArray();
    if (inputs && inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  submitCode() {
    if (this.isCodeIncomplete) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const code = this.fullCode;

    this.authService.verifyEmail({ email: this.email || undefined, code }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.isSuccess.set(true);
        this.toastService.success(res.message, 'Conta Ativada!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Código incorreto ou expirado. Tente novamente.');
        this.digits = ['', '', '', '', '', ''];
        this.focusInput(0);
      },
    });
  }

  resendCode() {
    if (!this.email) {
      this.toastService.error('E-mail não identificado. Volte ao login.');
      return;
    }

    this.resendLoading.set(true);
    this.authService.resendVerification(this.email).subscribe({
      next: (res: any) => {
        this.resendLoading.set(false);
        this.toastService.success(res.message, 'Novo Código Enviado');
        this.startCooldown(60);
      },
      error: (err) => {
        this.resendLoading.set(false);
        this.toastService.error(err.error?.message || 'Erro ao reenviar código.');
      },
    });
  }

  private startCooldown(seconds: number) {
    this.resendCooldown.set(seconds);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      const current = this.resendCooldown();
      if (current > 1) {
        this.resendCooldown.set(current - 1);
      } else {
        this.resendCooldown.set(0);
        clearInterval(this.timer);
      }
    }, 1000);
  }
}
