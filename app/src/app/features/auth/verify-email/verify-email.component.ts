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
    <div class="min-h-screen flex items-center justify-center p-4 bg-black text-[#ededed] relative overflow-hidden font-sans">
      <div class="relative w-full max-w-[400px] p-8 rounded-2xl bg-[#0c0c0e] border border-neutral-800 shadow-2xl animate-slide-up text-center z-10">
        <!-- ESTADO: SUCESSO -->
        @if (isSuccess()) {
          <div class="py-6 space-y-4 animate-fade-in">
            <div class="w-12 h-12 rounded-xl bg-white text-black font-bold mx-auto flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              ✓
            </div>
            <h2 class="text-xl font-bold text-white tracking-tight">E-mail Confirmado!</h2>
            <p class="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              Sua conta foi ativada. Redirecionando para o dashboard...
            </p>
            <div class="pt-2">
              <a
                routerLink="/dashboard"
                class="w-full py-2.5 px-4 btn-vercel-primary text-xs font-semibold inline-block"
              >
                Ir para o Dashboard
              </a>
            </div>
          </div>
        }

        <!-- ESTADO: FORMULÁRIO DE CÓDIGO DE 6 DÍGITOS -->
        @else {
          <div>
            <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
              ▲
            </div>
            <h1 class="text-xl font-extrabold text-white tracking-tight">Confirme seu E-mail</h1>
            <p class="text-xs text-neutral-400 mt-1">
              Enviamos um código de 6 dígitos para:
            </p>
            <div class="mt-1.5 px-3 py-1 bg-black rounded-full border border-neutral-800 inline-block text-[11px] font-mono text-neutral-300">
              {{ email || 'seu e-mail' }}
            </div>

            @if (errorMessage()) {
              <div class="mt-4 p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/50 text-rose-300 text-xs flex items-center justify-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="leading-tight">{{ errorMessage() }}</span>
              </div>
            }

            <!-- 6 INPUTS DE OTP -->
            <div class="my-6">
              <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-3">
                Código de 6 Dígitos
              </label>
              <div class="flex justify-center items-center gap-2" (paste)="onPaste($event)">
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
                    class="w-10 h-12 text-center text-lg font-mono font-bold rounded-xl bg-black border text-white transition-all focus:outline-none"
                    [ngClass]="digits[$index] ? 'border-white text-white' : 'border-neutral-800 text-neutral-400 focus:border-neutral-500'"
                  />
                }
              </div>
            </div>

            <!-- BOTÃO CONFIRMAR -->
            <button
              type="button"
              (click)="submitCode()"
              [disabled]="isCodeIncomplete || loading()"
              class="w-full py-3 px-4 btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              @if (loading()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Validando Código...</span>
              } @else {
                <span>Confirmar e Ativar</span>
              }
            </button>

            <!-- REENVIAR CÓDIGO -->
            <div class="mt-5 pt-4 border-t border-neutral-800/80 text-xs text-neutral-500 space-y-1.5 font-sans">
              <p>Não recebeu o código?</p>
              @if (resendCooldown() > 0) {
                <span class="text-neutral-400 font-mono text-[11px]">
                  Aguarde <strong class="text-white">{{ resendCooldown() }}s</strong> para reenviar
                </span>
              } @else {
                <button
                  type="button"
                  (click)="resendCode()"
                  [disabled]="resendLoading()"
                  class="text-xs text-white underline hover:text-neutral-300 cursor-pointer"
                >
                  {{ resendLoading() ? 'Reenviando...' : 'Reenviar Código' }}
                </button>
              }
            </div>

            <div class="mt-4 text-center">
              <a routerLink="/login" class="text-xs text-neutral-500 hover:text-neutral-300">
                ← Voltar para o Login
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
    const value = input.value.replace(/\D/g, '');

    if (value) {
      this.digits[index] = value.slice(-1);
      input.value = this.digits[index];
      this.errorMessage.set(null);

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
