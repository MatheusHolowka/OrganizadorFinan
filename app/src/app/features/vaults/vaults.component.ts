import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultsService } from '../../core/services/vaults.service';
import { AccountsService } from '../../core/services/accounts.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Account, Vault } from '../../core/models';

@Component({
  selector: 'app-vaults',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyBrlPipe,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
    ModalComponent,
  ],
  template: `
    <div class="h-screen flex flex-col overflow-hidden bg-surface-950">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-surface-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white font-display">Sistema de Cofres & Metas</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-vault-DEFAULT/20 text-vault-DEFAULT border border-vault-DEFAULT/30 text-xs font-semibold">
                  Fundos Blindados
                </span>
              </div>
              <p class="text-xs md:text-sm text-surface-400 mt-0.5">
                Isolamento virtual de capital para metas de médio e longo prazo (ex: R$ 70.000 para Polo Comfortline 2019 200 TSI)
              </p>
            </div>

            <button
              (click)="openNewVaultModal()"
              class="px-4 py-2.5 rounded-2xl bg-vault-DEFAULT hover:bg-vault-dark text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-vault-DEFAULT/25 transition-all"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Criar Novo Cofre / Meta</span>
            </button>
          </div>

          <!-- Banner Informativo de Isolamento Virtual -->
          <div class="p-4 rounded-3xl bg-gradient-to-r from-vault-DEFAULT/15 via-surface-900 to-surface-900 border border-vault-DEFAULT/30 flex items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="p-3 rounded-2xl bg-vault-DEFAULT/20 text-vault-DEFAULT shrink-0">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Regra de Isolamento Virtual de Fundos</h3>
                <p class="text-xs text-surface-300">
                  Todo valor depositado nos cofres é virtualmente isolado das suas contas, impedindo que você gaste esse montante no dia a dia.
                </p>
              </div>
            </div>

            @if (vaultsService.data(); as data) {
              <div class="text-right shrink-0 hidden sm:block">
                <span class="text-[10px] uppercase font-bold text-surface-400">Total Blindado</span>
                <div class="text-lg font-black text-vault-DEFAULT font-display">
                  {{ data.summary.totalIsolated | currencyBrl }}
                </div>
              </div>
            }
          </div>

          <!-- Cards de Metas e Cofres -->
          @if (vaultsService.loading()) {
            <div class="flex items-center justify-center py-20">
              <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vault-DEFAULT"></div>
            </div>
          } @else if (vaultsService.data(); as data) {
            @if (data.vaults.length === 0) {
              <div class="p-12 text-center rounded-3xl bg-surface-900/60 border border-surface-800">
                <div class="w-16 h-16 rounded-full bg-vault-DEFAULT/10 text-vault-DEFAULT mx-auto flex items-center justify-center mb-3">
                  <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-white">Nenhum cofre configurado</h3>
                <p class="text-xs text-surface-400 max-w-sm mx-auto mt-1 mb-4">
                  Crie seu primeiro cofre (como a compra do Polo TSI R$ 70.000 ou Reserva de Emergência) para começar a blindar seu patrimônio.
                </p>
                <button
                  (click)="openNewVaultModal()"
                  class="px-4 py-2 rounded-xl bg-vault-DEFAULT hover:bg-vault-dark text-white text-xs font-semibold"
                >
                  Criar Primeiro Cofre
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (vault of data.vaults; track vault.id) {
                  <div class="p-6 rounded-3xl bg-surface-900/80 border border-surface-800 backdrop-blur-md relative overflow-hidden flex flex-col justify-between shadow-glass">
                    <div>
                      <div class="flex items-start justify-between mb-4">
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <span class="w-2.5 h-2.5 rounded-full" [style.backgroundColor]="vault.color || '#8B5CF6'"></span>
                            <span class="text-[10px] uppercase tracking-wider text-surface-400 font-bold">{{ vault.category }}</span>
                          </div>
                          <h3 class="text-lg font-bold text-white font-display">{{ vault.title }}</h3>
                        </div>

                        @if (vault.isolatedFromDailyBalance) {
                          <span class="px-2 py-0.5 rounded-md bg-vault-DEFAULT/15 text-vault-DEFAULT border border-vault-DEFAULT/30 text-[10px] font-bold">
                            Blindado
                          </span>
                        }
                      </div>

                      @if (vault.description) {
                        <p class="text-xs text-surface-400 mb-4 line-clamp-2">{{ vault.description }}</p>
                      }

                      <!-- Montante Acumulado vs Alvo -->
                      <div class="mt-2 space-y-2">
                        <div class="flex justify-between items-baseline">
                          <div>
                            <span class="text-[10px] uppercase font-bold text-surface-400">Acumulado</span>
                            <div class="text-xl font-black text-white font-display">
                              {{ vault.currentAmount | currencyBrl }}
                            </div>
                          </div>
                          <div class="text-right">
                            <span class="text-[10px] uppercase font-bold text-surface-400">Meta</span>
                            <div class="text-sm font-bold text-surface-300 font-display">
                              {{ vault.targetAmount | currencyBrl }}
                            </div>
                          </div>
                        </div>

                        <!-- Barra de Progresso com Glow -->
                        <div class="w-full bg-surface-950 h-3 rounded-full overflow-hidden p-0.5 border border-surface-800">
                          <div
                            class="h-full rounded-full transition-all duration-700"
                            [style.width.%]="vault.progress"
                            [style.backgroundColor]="vault.color || '#8B5CF6'"
                          ></div>
                        </div>

                        <div class="flex justify-between text-[11px] text-surface-400 pt-1">
                          <span>{{ vault.progress }}% alcançado</span>
                          <span>Falta {{ vault.remaining | currencyBrl }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Ações: Aporte e Resgate -->
                    <div class="mt-6 pt-4 border-t border-surface-800 flex items-center gap-2">
                      <button
                        (click)="openMovementModal(vault, 'DEPOSIT')"
                        class="flex-1 py-2.5 rounded-xl bg-vault-DEFAULT hover:bg-vault-dark text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-vault-DEFAULT/20"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Aportar</span>
                      </button>

                      <button
                        (click)="openMovementModal(vault, 'WITHDRAWAL')"
                        [disabled]="vault.currentAmount <= 0"
                        class="flex-1 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 disabled:opacity-40 text-surface-200 font-semibold text-xs transition-colors border border-surface-700"
                      >
                        Resgatar
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </main>
      </div>

      <!-- Modal Novo Cofre / Meta -->
      <app-modal
        [isOpen]="isNewVaultModalOpen()"
        title="Criar Novo Cofre ou Meta Financeira"
        (close)="isNewVaultModalOpen.set(false)"
      >
        <form [formGroup]="vaultForm" (ngSubmit)="submitNewVault()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Título da Meta</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Ex: Polo Comfortline 2019 200 TSI"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Descrição (Opcional)</label>
            <textarea
              formControlName="description"
              rows="2"
              placeholder="Ex: Reserva isolada para compra à vista do veículo sem afetar saldo de gastos diários."
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Valor da Meta (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="targetAmount"
                placeholder="70000.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Categoria</label>
              <select
                formControlName="category"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="VEHICLE">Veículo / Carro</option>
                <option value="EMERGENCY_FUND">Reserva de Emergência</option>
                <option value="REAL_ESTATE">Imóvel / Casa Própria</option>
                <option value="TRAVEL">Viagem</option>
                <option value="INVESTMENT">Investimento</option>
                <option value="EDUCATION">Educação</option>
                <option value="RETIREMENT">Aposentadoria</option>
                <option value="OTHER">Outros</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Prazo Estimado</label>
              <input
                type="date"
                formControlName="deadline"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Cor de Destaque</label>
              <input
                type="color"
                formControlName="color"
                class="w-full h-10 px-2 py-1 rounded-xl bg-surface-950 border border-surface-700 cursor-pointer"
              />
            </div>
          </div>

          <div class="p-3 rounded-xl bg-vault-DEFAULT/10 border border-vault-DEFAULT/20 flex items-center gap-3">
            <input
              type="checkbox"
              id="isolatedCheck"
              formControlName="isolatedFromDailyBalance"
              class="w-4 h-4 rounded text-vault-DEFAULT focus:ring-vault-DEFAULT"
            />
            <label for="isolatedCheck" class="text-xs text-vault-DEFAULT cursor-pointer select-none">
              <strong>Isolar Fundos:</strong> O valor guardado não será contado como disponível para gastos diários.
            </label>
          </div>

          <button
            type="submit"
            [disabled]="vaultForm.invalid"
            class="w-full mt-2 py-3 rounded-xl bg-vault-DEFAULT hover:bg-vault-dark disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-vault-DEFAULT/20 transition-all"
          >
            Criar Cofre / Meta
          </button>
        </form>
      </app-modal>

      <!-- Modal Aporte / Resgate -->
      <app-modal
        [isOpen]="isMovementModalOpen()"
        [title]="movementType() === 'DEPOSIT' ? 'Aporte no Cofre' : 'Resgate do Cofre'"
        (close)="isMovementModalOpen.set(false)"
      >
        <form [formGroup]="movementForm" (ngSubmit)="submitMovement()" class="space-y-4">
          @if (selectedVault(); as vault) {
            <div class="p-3.5 rounded-2xl bg-surface-950 border border-surface-800 text-xs space-y-1">
              <div class="flex justify-between">
                <span class="text-surface-400">Meta:</span>
                <span class="text-white font-bold">{{ vault.title }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-surface-400">Saldo Atual Guardado:</span>
                <span class="text-vault-DEFAULT font-bold">{{ vault.currentAmount | currencyBrl }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Valor do Movimento (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="amount"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">
                {{ movementType() === 'DEPOSIT' ? 'Debitar da Conta Bancária' : 'Creditar na Conta Bancária' }}
              </label>
              <select
                formControlName="accountId"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="">Nenhuma (movimento virtual isolado)</option>
                @for (acc of accounts(); track acc.id) {
                  <option [value]="acc.id">{{ acc.name }} (Saldo: {{ acc.currentBalance | currencyBrl }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Descrição / Motivo</label>
              <input
                type="text"
                formControlName="description"
                placeholder="Ex: Aporte mensal economia"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              [disabled]="movementForm.invalid"
              class="w-full mt-2 py-3 rounded-xl bg-vault-DEFAULT hover:bg-vault-dark disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-vault-DEFAULT/20 transition-all"
            >
              Confirmar {{ movementType() === 'DEPOSIT' ? 'Aporte' : 'Resgate' }}
            </button>
          }
        </form>
      </app-modal>

      <app-bottom-nav />
    </div>
  `,
})
export class VaultsComponent implements OnInit {
  vaultsService = inject(VaultsService);
  accountsService = inject(AccountsService);
  fb = inject(FormBuilder);

  accounts = signal<Account[]>([]);
  isNewVaultModalOpen = signal(false);
  isMovementModalOpen = signal(false);
  selectedVault = signal<Vault | null>(null);
  movementType = signal<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');

  vaultForm = this.fb.group({
    title: ['Polo Comfortline 2019 200 TSI', [Validators.required]],
    description: ['Reserva financeira isolada para aquisição do veículo.'],
    targetAmount: [70000, [Validators.required, Validators.min(1)]],
    category: ['VEHICLE', [Validators.required]],
    deadline: [''],
    color: ['#8B5CF6'],
    isolatedFromDailyBalance: [true],
  });

  movementForm = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    accountId: [''],
    description: [''],
  });

  ngOnInit() {
    this.vaultsService.findAll().subscribe();
    this.accountsService.findAll().subscribe((res) => {
      this.accounts.set(res.accounts);
      if (res.accounts.length > 0) {
        this.movementForm.patchValue({ accountId: res.accounts[0].id });
      }
    });
  }

  openNewVaultModal() {
    this.isNewVaultModalOpen.set(true);
  }

  submitNewVault() {
    if (this.vaultForm.invalid) return;

    this.vaultsService.create(this.vaultForm.value).subscribe({
      next: () => {
        this.isNewVaultModalOpen.set(false);
        this.vaultForm.reset({
          title: '',
          targetAmount: null as any,
          category: 'VEHICLE',
          color: '#8B5CF6',
          isolatedFromDailyBalance: true,
        });
        this.vaultsService.findAll().subscribe();
      },
    });
  }

  openMovementModal(vault: Vault, type: 'DEPOSIT' | 'WITHDRAWAL') {
    this.selectedVault.set(vault);
    this.movementType.set(type);
    this.movementForm.patchValue({
      amount: null,
      description: type === 'DEPOSIT' ? `Aporte em ${vault.title}` : `Resgate de ${vault.title}`,
    });
    this.isMovementModalOpen.set(true);
  }

  submitMovement() {
    if (this.movementForm.invalid) return;

    const vault = this.selectedVault();
    if (!vault) return;

    this.vaultsService
      .createMovement(vault.id, {
        type: this.movementType(),
        amount: this.movementForm.value.amount!,
        accountId: this.movementForm.value.accountId || undefined,
        description: this.movementForm.value.description || undefined,
      })
      .subscribe({
        next: () => {
          this.isMovementModalOpen.set(false);
          this.vaultsService.findAll().subscribe();
        },
      });
  }
}
