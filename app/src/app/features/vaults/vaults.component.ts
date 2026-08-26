import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultsService } from '../../core/services/vaults.service';
import { AccountsService } from '../../core/services/accounts.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
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
    <div class="h-screen flex flex-col overflow-hidden bg-black text-[#ededed] font-sans">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-neutral-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white tracking-tight">Cofres & Metas Blindadas</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono">
                  Quarentena Ativa
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Isolamento matemático de capital para metas de médio e longo prazo
              </p>
            </div>

            <button
              (click)="openNewVaultModal()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Cofre</span>
            </button>
          </div>

          <!-- Banner Informativo de Quarentena -->
          <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800 flex items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white shrink-0 text-base">
                🛡️
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Quarentena Matemática de Liquidez</h3>
                <p class="text-xs text-neutral-400 font-sans">
                  Todo valor depositado nos cofres é virtualmente deduzido das contas, blindando seu saldo diário contra compras por impulso.
                </p>
              </div>
            </div>

            @if (vaultsService.data(); as data) {
              <div class="text-right shrink-0 hidden sm:block font-mono">
                <span class="text-[10px] uppercase text-neutral-500">Total Blindado</span>
                <div class="text-lg font-bold text-white">
                  {{ data.summary.totalIsolated | currencyBrl }}
                </div>
              </div>
            }
          </div>

          <!-- Cards de Metas e Cofres -->
          @if (vaultsService.loading()) {
            <div class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
            </div>
          } @else if (vaultsService.data(); as data) {
            @if (data.vaults.length === 0) {
              <div class="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-3">
                <div class="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center text-lg">
                  🛡️
                </div>
                <h3 class="text-sm font-bold text-white">Nenhum cofre configurado</h3>
                <p class="text-xs text-neutral-500 max-w-sm mx-auto">
                  Crie seu primeiro cofre blindado (como Reserva de Emergência ou Carro Novo) para começar a planejar suas conquistas.
                </p>
                <button
                  (click)="openNewVaultModal()"
                  class="px-4 py-2 btn-vercel-primary text-xs font-semibold cursor-pointer"
                >
                  Criar Primeiro Cofre
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (vault of data.vaults; track vault.id) {
                  <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-5">
                    <div>
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">{{ vault.category }}</span>
                          </div>
                          <h3 class="text-base font-bold text-white">{{ vault.title }}</h3>
                        </div>

                        <div class="flex items-center gap-1.5">
                          @if (vault.isolatedFromDailyBalance) {
                            <span class="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold text-neutral-300">
                              Blindado
                            </span>
                          }
                          <button
                            (click)="deleteVault(vault)"
                            title="Excluir Cofre"
                            class="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors cursor-pointer"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      @if (vault.description) {
                        <p class="text-xs text-neutral-400 mb-4 line-clamp-2">{{ vault.description }}</p>
                      }

                      <!-- Montante Acumulado vs Alvo -->
                      <div class="mt-2 space-y-2 font-mono">
                        <div class="flex justify-between items-baseline">
                          <div>
                            <span class="text-[10px] uppercase text-neutral-500">Acumulado</span>
                            <div class="text-xl font-bold text-white">
                              {{ vault.currentAmount | currencyBrl }}
                            </div>
                          </div>
                          <div class="text-right">
                            <span class="text-[10px] uppercase text-neutral-500">Meta</span>
                            <div class="text-sm font-medium text-neutral-400">
                              {{ vault.targetAmount | currencyBrl }}
                            </div>
                          </div>
                        </div>

                        <!-- Barra de Progresso -->
                        <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-white rounded-full transition-all duration-500"
                            [style.width.%]="vault.progress"
                          ></div>
                        </div>

                        <div class="flex justify-between text-[11px] text-neutral-500 pt-1">
                          <span>{{ vault.progress }}% alcançado</span>
                          <span>Falta {{ vault.remaining | currencyBrl }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Ações: Aporte e Resgate -->
                    <div class="pt-4 border-t border-neutral-850 flex items-center gap-2 font-mono text-xs">
                      <button
                        (click)="openMovementModal(vault, 'DEPOSIT')"
                        class="flex-1 py-2 rounded-xl btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>+ Aportar</span>
                      </button>

                      <button
                        (click)="openMovementModal(vault, 'WITHDRAWAL')"
                        [disabled]="vault.currentAmount <= 0"
                        class="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 hover:text-white font-medium text-xs border border-neutral-800 transition-colors cursor-pointer"
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
        title="Criar Novo Cofre ou Meta"
        (close)="isNewVaultModalOpen.set(false)"
      >
        <form [formGroup]="vaultForm" (ngSubmit)="submitNewVault()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Título da Meta</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Ex: Reserva de Emergência, Carro Novo"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Descrição (Opcional)</label>
            <textarea
              formControlName="description"
              rows="2"
              placeholder="Ex: Fundo de segurança isolado para emergências."
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Valor da Meta (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="targetAmount"
                placeholder="30000.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Categoria</label>
              <select
                formControlName="category"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
              >
                <option value="EMERGENCY_FUND" class="bg-neutral-900 text-white">Reserva de Emergência</option>
                <option value="REAL_ESTATE" class="bg-neutral-900 text-white">Imóvel / Casa Própria</option>
                <option value="VEHICLE" class="bg-neutral-900 text-white">Veículo / Carro</option>
                <option value="TRAVEL" class="bg-neutral-900 text-white">Viagem</option>
                <option value="INVESTMENT" class="bg-neutral-900 text-white">Investimento</option>
                <option value="EDUCATION" class="bg-neutral-900 text-white">Educação</option>
                <option value="RETIREMENT" class="bg-neutral-900 text-white">Aposentadoria</option>
                <option value="OTHER" class="bg-neutral-900 text-white">Outros</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Prazo Estimado (Opcional)</label>
            <input
              type="date"
              formControlName="deadline"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div class="p-3 rounded-xl bg-black border border-neutral-800 flex items-center gap-3">
            <input
              type="checkbox"
              id="isolatedCheck"
              formControlName="isolatedFromDailyBalance"
              class="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-white cursor-pointer"
            />
            <label for="isolatedCheck" class="text-xs text-neutral-300 cursor-pointer select-none">
              <strong>Isolar Fundos:</strong> O valor guardado será bloqueado e deduzido do saldo diário.
            </label>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              (click)="isNewVaultModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="vaultForm.invalid || creatingVault()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (creatingVault()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              }
              <span>Criar Cofre</span>
            </button>
          </div>
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
            <div class="p-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono space-y-1">
              <div class="flex justify-between">
                <span class="text-neutral-500">Cofre:</span>
                <span class="text-white font-bold font-sans">{{ vault.title }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-500">Saldo Atual:</span>
                <span class="text-emerald-400 font-bold">{{ vault.currentAmount | currencyBrl }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Valor do Movimento (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="amount"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">
                {{ movementType() === 'DEPOSIT' ? 'Debitar da Conta Bancária' : 'Creditar na Conta Bancária' }}
              </label>
              <select
                formControlName="accountId"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
              >
                <option value="" class="bg-neutral-900 text-white">Nenhuma (movimento virtual isolado)</option>
                @for (acc of accounts(); track acc.id) {
                  <option [value]="acc.id" class="bg-neutral-900 text-white">{{ acc.name }} (Saldo: {{ acc.currentBalance | currencyBrl }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Descrição / Motivo</label>
              <input
                type="text"
                formControlName="description"
                placeholder="Ex: Aporte mensal"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                (click)="isMovementModalOpen.set(false)"
                class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="movementForm.invalid || movingVault()"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                @if (movingVault()) {
                  <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                }
                <span>Confirmar {{ movementType() === 'DEPOSIT' ? 'Aporte' : 'Resgate' }}</span>
              </button>
            </div>
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
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  fb = inject(FormBuilder);

  accounts = signal<Account[]>([]);
  isNewVaultModalOpen = signal(false);
  isMovementModalOpen = signal(false);
  selectedVault = signal<Vault | null>(null);
  movementType = signal<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  creatingVault = signal(false);
  movingVault = signal(false);

  vaultForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    targetAmount: [null as any, [Validators.required, Validators.min(0.01)]],
    category: ['EMERGENCY_FUND', [Validators.required]],
    deadline: [''],
    color: ['#FFFFFF'],
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

    this.creatingVault.set(true);
    const val = this.vaultForm.value;
    const payload = {
      title: val.title!,
      description: val.description || undefined,
      targetAmount: Number(val.targetAmount),
      category: val.category || 'EMERGENCY_FUND',
      deadline: val.deadline ? val.deadline : undefined,
      color: val.color || '#FFFFFF',
      isolatedFromDailyBalance: val.isolatedFromDailyBalance ?? true,
    };

    this.vaultsService.create(payload).subscribe({
      next: () => {
        this.creatingVault.set(false);
        this.isNewVaultModalOpen.set(false);
        this.vaultForm.reset({
          title: '',
          targetAmount: null as any,
          category: 'EMERGENCY_FUND',
          color: '#FFFFFF',
          isolatedFromDailyBalance: true,
        });
        this.toastService.success('Cofre criado com sucesso!');
        this.vaultsService.findAll().subscribe();
      },
      error: (err) => {
        this.creatingVault.set(false);
        const msg = err.error?.message || 'Erro ao criar cofre.';
        const formatted = Array.isArray(msg) ? msg.join(', ') : msg;
        this.toastService.error(formatted);
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

    this.movingVault.set(true);
    const val = this.movementForm.value;
    this.vaultsService
      .createMovement(vault.id, {
        type: this.movementType(),
        amount: Number(val.amount),
        accountId: val.accountId || undefined,
        description: val.description || undefined,
      })
      .subscribe({
        next: () => {
          this.movingVault.set(false);
          this.isMovementModalOpen.set(false);
          this.toastService.success(this.movementType() === 'DEPOSIT' ? 'Aporte realizado com sucesso!' : 'Resgate realizado com sucesso!');
          this.vaultsService.findAll().subscribe();
          this.accountsService.findAll().subscribe();
        },
        error: (err) => {
          this.movingVault.set(false);
          const msg = err.error?.message || 'Erro ao realizar movimentação.';
          const formatted = Array.isArray(msg) ? msg.join(', ') : msg;
          this.toastService.error(formatted);
        },
      });
  }

  async deleteVault(vault: Vault) {
    const confirmed = await this.dialogService.confirm({
      title: 'Excluir Cofre',
      message: `Deseja realmente excluir o cofre "${vault.title}"?`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.vaultsService.remove(vault.id).subscribe({
        next: () => {
          this.toastService.success(`Cofre "${vault.title}" excluído.`);
          this.vaultsService.findAll().subscribe();
        },
        error: (err) => {
          const msg = err.error?.message || 'Erro ao excluir cofre.';
          this.toastService.error(Array.isArray(msg) ? msg.join(', ') : msg);
        },
      });
    }
  }
}
