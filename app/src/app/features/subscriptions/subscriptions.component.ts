import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SubscriptionsService, SubscriptionItem, SavingsSimulation } from '../../core/services/subscriptions.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
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
          
          <!-- Top Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-bold text-white tracking-tight">Radar de Assinaturas & Recorrências</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-mono">
                  Auto-Detection
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Auditoria contínua de cobranças periódicas, streamings e contratos com simulador de economia por cancelamento
              </p>
            </div>

            <div class="flex items-center gap-2.5">
              <button
                (click)="scanFromTransactions()"
                [disabled]="isScanning()"
                class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg class="w-4 h-4 text-emerald-400" [ngClass]="isScanning() ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ isScanning() ? 'Escaneando...' : 'Escanear Extratos' }}</span>
              </button>

              <button
                (click)="openCreateModal()"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Nova Assinatura</span>
              </button>
            </div>
          </div>

          <!-- KPI Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div class="text-[11px] font-mono text-neutral-400 uppercase">Custo Mensal Recorrente</div>
              <div class="text-2xl font-bold text-white mt-1">
                {{ (subscriptionsService.data()?.metrics?.totalMonthly || 0) | currencyBrl }}
              </div>
              <div class="text-[10px] text-neutral-500 font-mono mt-0.5">Cobranças fixas por mês</div>
            </div>

            <div class="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div class="text-[11px] font-mono text-neutral-400 uppercase">Impacto Anual Consolidado</div>
              <div class="text-2xl font-bold text-amber-400 mt-1">
                {{ (subscriptionsService.data()?.metrics?.totalYearly || 0) | currencyBrl }}
              </div>
              <div class="text-[10px] text-neutral-500 font-mono mt-0.5">12 meses de recorrência</div>
            </div>

            <div class="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div class="text-[11px] font-mono text-neutral-400 uppercase">Serviços Ativos</div>
              <div class="text-2xl font-bold text-emerald-400 mt-1">
                {{ subscriptionsService.data()?.metrics?.activeCount || 0 }}
              </div>
              <div class="text-[10px] text-neutral-500 font-mono mt-0.5">Assinaturas monitoradas</div>
            </div>

            <div class="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div class="text-[11px] font-mono text-neutral-400 uppercase">Economia Selecionada</div>
              <div class="text-2xl font-bold text-cyan-400 mt-1">
                {{ selectedCutMonthly() | currencyBrl }}<span class="text-xs text-neutral-500">/mês</span>
              </div>
              <div class="text-[10px] text-neutral-500 font-mono mt-0.5">{{ selectedIds().size }} marcadas para corte</div>
            </div>
          </div>

          <!-- Compound Savings Simulator Box -->
          @if (selectedCutMonthly() > 0) {
            <div class="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-black to-neutral-950 border border-emerald-800/60 shadow-2xl space-y-4 animate-fade-in">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/40 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">📈</span>
                  <div>
                    <h3 class="text-sm font-bold text-white">Simulação de Riqueza: Se você cortar essas {{ selectedIds().size }} assinaturas</h3>
                    <p class="text-[11px] text-neutral-400 font-sans">Redirecionando R$ {{ selectedCutMonthly() | currencyBrl }}/mês para o Cofre de Investimentos (100% CDI):</p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-xs font-mono text-emerald-400 font-bold">R$ {{ (selectedCutMonthly() * 12) | currencyBrl }}/ano economizados</span>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                <div class="p-3 rounded-2xl bg-black/60 border border-neutral-800">
                  <div class="text-[10px] text-neutral-500 uppercase">Em 1 Ano</div>
                  <div class="text-base font-bold text-white mt-1">{{ simulation()?.futureValue1Year || (selectedCutMonthly() * 12) | currencyBrl }}</div>
                </div>
                <div class="p-3 rounded-2xl bg-black/60 border border-neutral-800">
                  <div class="text-[10px] text-neutral-500 uppercase">Em 3 Anos</div>
                  <div class="text-base font-bold text-emerald-300 mt-1">{{ simulation()?.futureValue3Years || (selectedCutMonthly() * 36) | currencyBrl }}</div>
                </div>
                <div class="p-3 rounded-2xl bg-black/60 border border-neutral-800">
                  <div class="text-[10px] text-neutral-500 uppercase">Em 5 Anos</div>
                  <div class="text-base font-bold text-emerald-400 mt-1">{{ simulation()?.futureValue5Years || (selectedCutMonthly() * 60) | currencyBrl }}</div>
                </div>
                <div class="p-3 rounded-2xl bg-black/60 border border-neutral-800">
                  <div class="text-[10px] text-neutral-500 uppercase">Em 10 Anos</div>
                  <div class="text-base font-bold text-cyan-400 mt-1">{{ simulation()?.futureValue10Years || (selectedCutMonthly() * 120) | currencyBrl }}</div>
                </div>
              </div>
            </div>
          }

          <!-- Subscriptions Table / List -->
          <div class="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div class="p-4 border-b border-neutral-800/80 flex items-center justify-between">
              <div class="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Assinaturas Cadastradas & Detectadas ({{ subscriptions().length }})
              </div>
              <div class="text-[11px] text-neutral-500 font-mono">
                Marque o checkbox para simular o corte e economia
              </div>
            </div>

            @if (subscriptionsService.loading() && subscriptions().length === 0) {
              <div class="p-12 text-center text-xs font-mono text-neutral-500">
                <div class="w-6 h-6 border-2 border-neutral-800 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2"></div>
                Carregando radar de assinaturas...
              </div>
            } @else if (subscriptions().length === 0) {
              <div class="p-12 text-center space-y-3">
                <div class="text-3xl">📡</div>
                <div class="text-sm font-bold text-white">Nenhuma assinatura detectada ainda</div>
                <p class="text-xs text-neutral-400 max-w-sm mx-auto">
                  Clique em "Escanear Extratos" para identificar automaticamente débitos do Netflix, Spotify, academias ou cadastre manualmente.
                </p>
                <button
                  (click)="scanFromTransactions()"
                  class="px-4 py-2 btn-vercel-primary text-xs font-semibold"
                >
                  Escanear Agora
                </button>
              </div>
            } @else {
              <div class="divide-y divide-neutral-800/80">
                @for (sub of subscriptions(); track sub.id) {
                  <div 
                    class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-900/40 transition-colors"
                    [ngClass]="sub.status === 'CANCELLED' ? 'opacity-50' : ''"
                  >
                    
                    <!-- Left: Checkbox + Icon + Info -->
                    <div class="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        [checked]="selectedIds().has(sub.id)"
                        (change)="toggleSelection(sub.id)"
                        class="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 cursor-pointer"
                      />

                      <div 
                        class="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white shadow-inner shrink-0"
                        [style.background-color]="sub.color || '#262626'"
                      >
                        {{ sub.name.charAt(0).toUpperCase() }}
                      </div>

                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold text-white">{{ sub.name }}</span>
                          @if (sub.autoDetected) {
                            <span class="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 text-[9px] font-mono">
                              AUTO
                            </span>
                          }
                          @if (sub.status === 'CANCELLED') {
                            <span class="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 text-[9px] font-mono">
                              CANCELADA
                            </span>
                          }
                        </div>
                        <div class="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {{ sub.category }} • {{ sub.frequency === 'YEARLY' ? 'Anual' : 'Mensal' }} • {{ sub.merchantName }}
                        </div>
                      </div>
                    </div>

                    <!-- Right: Values + Actions -->
                    <div class="flex items-center justify-between sm:justify-end gap-6">
                      <div class="text-left sm:text-right font-mono">
                        <div class="text-base font-bold text-white">
                          {{ sub.amount | currencyBrl }}<span class="text-xs text-neutral-500">/mês</span>
                        </div>
                        <div class="text-[10px] text-neutral-500">
                          {{ (sub.amount * 12) | currencyBrl }}/ano
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          (click)="toggleStatus(sub)"
                          [title]="sub.status === 'ACTIVE' ? 'Marcar como Cancelada' : 'Reativar Assinatura'"
                          class="px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer"
                          [ngClass]="sub.status === 'ACTIVE' ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800' : 'border-emerald-800 bg-emerald-950 text-emerald-400'"
                        >
                          {{ sub.status === 'ACTIVE' ? 'Desativar' : 'Reativar' }}
                        </button>

                        <button
                          (click)="deleteSub(sub)"
                          title="Excluir"
                          class="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                }
              </div>
            }
          </div>

        </main>
      </div>

      <app-bottom-nav class="md:hidden shrink-0 z-30" />

      <!-- Create / Edit Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        title="Nova Assinatura / Serviço Recorrente"
        (closed)="closeModal()"
      >
        <form [formGroup]="subForm" (ngSubmit)="saveSubscription()" class="space-y-4 font-mono text-xs">
          <div>
            <label class="block text-neutral-400 mb-1">Nome do Serviço (ex: Netflix, Spotify)</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-neutral-600"
              placeholder="Netflix Premium"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-neutral-400 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="amount"
                class="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-neutral-600"
                placeholder="55.90"
              />
            </div>

            <div>
              <label class="block text-neutral-400 mb-1">Periodicidade</label>
              <select
                formControlName="frequency"
                class="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-neutral-600"
              >
                <option value="MONTHLY">Mensal</option>
                <option value="YEARLY">Anual</option>
                <option value="WEEKLY">Semanal</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-neutral-400 mb-1">Categoria</label>
            <select
              formControlName="category"
              class="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="STREAMING">Streaming & Mídia</option>
              <option value="SOFTWARE">Software & Produtividade</option>
              <option value="HEALTH">Saúde & Fitness</option>
              <option value="UTILITIES">Contas & Telecom</option>
              <option value="EDUCATION">Educação</option>
              <option value="OTHER">Outros</option>
            </select>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="subForm.invalid || isSubmitting()"
              class="px-5 py-2 btn-vercel-primary font-bold disabled:opacity-50"
            >
              {{ isSubmitting() ? 'Salvando...' : 'Salvar Assinatura' }}
            </button>
          </div>
        </form>
      </app-modal>

    </div>
  `,
})
export class SubscriptionsComponent implements OnInit {
  subscriptionsService = inject(SubscriptionsService);
  toast = inject(ToastService);
  dialog = inject(DialogService);
  fb = inject(FormBuilder);

  isScanning = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedIds = signal<Set<string>>(new Set());
  simulation = signal<SavingsSimulation | null>(null);

  subForm = this.fb.group({
    name: ['', [Validators.required]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    frequency: ['MONTHLY', [Validators.required]],
    category: ['STREAMING', [Validators.required]],
  });

  subscriptions = computed(() => {
    return this.subscriptionsService.data()?.subscriptions || [];
  });

  selectedCutMonthly = computed(() => {
    const ids = this.selectedIds();
    const subs = this.subscriptions();
    return subs
      .filter((s) => ids.has(s.id))
      .reduce((sum, s) => {
        const val = Number(s.amount);
        return sum + (s.frequency === 'YEARLY' ? val / 12 : val);
      }, 0);
  });

  ngOnInit() {
    this.subscriptionsService.findAll().subscribe();
  }

  scanFromTransactions() {
    this.isScanning.set(true);
    this.subscriptionsService.scan().subscribe({
      next: (res) => {
        this.isScanning.set(false);
        const count = res.subscriptions?.length || 0;
        this.toast.success(`Varredura concluída! ${count} serviços identificados.`);
      },
      error: () => {
        this.isScanning.set(false);
        this.toast.error('Erro ao escanear extratos.');
      },
    });
  }

  toggleSelection(id: string) {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    // Update simulation
    const cut = this.selectedCutMonthly();
    if (cut > 0) {
      this.subscriptionsService.simulateSavings(cut).subscribe((res) => this.simulation.set(res));
    } else {
      this.simulation.set(null);
    }
  }

  toggleStatus(sub: SubscriptionItem) {
    this.subscriptionsService.toggleStatus(sub.id).subscribe({
      next: () => {
        this.subscriptionsService.findAll().subscribe();
        this.toast.success(`Assinatura ${sub.name} atualizada.`);
      },
      error: () => this.toast.error('Erro ao atualizar status.'),
    });
  }

  async deleteSub(sub: SubscriptionItem) {
    const confirmed = await this.dialog.confirm({
      title: 'Excluir Assinatura',
      message: `Tem certeza que deseja remover ${sub.name} do radar?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.subscriptionsService.delete(sub.id).subscribe({
        next: () => {
          this.subscriptionsService.findAll().subscribe();
          this.toast.success('Assinatura removida.');
        },
        error: () => this.toast.error('Erro ao remover.'),
      });
    }
  }

  openCreateModal() {
    this.subForm.reset({ frequency: 'MONTHLY', category: 'STREAMING' });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveSubscription() {
    if (this.subForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.subForm.value;

    this.subscriptionsService.create({
      name: val.name!,
      merchantName: val.name!,
      amount: Number(val.amount),
      frequency: val.frequency as any,
      category: val.category!,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.subscriptionsService.findAll().subscribe();
        this.toast.success('Assinatura salva com sucesso!');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('Erro ao salvar assinatura.');
      },
    });
  }
}
