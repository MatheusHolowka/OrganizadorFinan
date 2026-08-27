import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenFinanceService } from '../../core/services/open-finance.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { OpenFinanceConnection } from '../../core/models';

@Component({
  selector: 'app-open-finance',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyBrlPipe,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
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
                <h1 class="text-2xl font-bold text-white tracking-tight">Open Finance</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 text-xs font-mono flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Pluggy Engine Ativa
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Conecte seus bancos e contas de forma segura via Open Finance oficial para sincronização automática
              </p>
            </div>

            <div class="flex items-center gap-2.5">
              <button
                (click)="connectNewBank()"
                [disabled]="isConnecting()"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                @if (isConnecting()) {
                  <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Iniciando Conexão...</span>
                } @else {
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Conectar Banco via Open Finance</span>
                }
              </button>
            </div>
          </div>

          <!-- Banner Informativo de Segurança -->
          <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="text-xs space-y-0.5">
                <h3 class="font-semibold text-white">Privacidade e Criptografia Bancária de Ponta a Ponta</h3>
                <p class="text-neutral-400">
                  O fluxo é realizado diretamente no ambiente seguro do seu banco. Nós nunca temos acesso às suas senhas bancárias ou tokens de transação.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                Modo Somente Leitura (Read-Only)
              </span>
            </div>
          </div>

          <!-- Loading State -->
          @if (openFinanceService.loading() && connections().length === 0) {
            <div class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
            </div>
          } @else if (connections().length === 0) {
            <!-- Empty State -->
            <div class="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-6">
              <div class="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
                🏦
              </div>

              <div class="max-w-md mx-auto space-y-2">
                <h3 class="text-base font-bold text-white">Nenhuma instituição bancária conectada</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  Conecte suas contas do <strong>Nubank, Itaú, Inter, Banco do Brasil, Bradesco, Santander, Caixa, C6 Bank, Sicredi</strong> e mais de 50 outras instituições financeiras.
                </p>
              </div>

              <!-- Lista de Logos Ilustrativos -->
              <div class="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto py-2">
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">💜 Nubank</span>
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">🧡 Itaú</span>
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">🧡 Inter</span>
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">💛 Banco do Brasil</span>
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">❤️ Bradesco</span>
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">🖤 C6 Bank</span>
                <span class="px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">💚 Sicredi</span>
              </div>

              <button
                (click)="connectNewBank()"
                [disabled]="isConnecting()"
                class="px-6 py-3 btn-vercel-primary text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                @if (isConnecting()) {
                  <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Iniciando...</span>
                } @else {
                  <span>Conectar Meu Primeiro Banco</span>
                }
              </button>
            </div>
          } @else {
            <!-- GRID DE CONEXÕES ATIVAS -->
            <div class="grid grid-cols-1 gap-6">
              @for (conn of connections(); track conn.id) {
                <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all space-y-5">
                  <!-- Header do Card da Instituição -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      @if (conn.connectorImageUrl) {
                        <img
                          [src]="conn.connectorImageUrl"
                          [alt]="conn.connectorName"
                          class="w-12 h-12 rounded-xl object-contain bg-neutral-900 border border-neutral-800 p-1.5"
                        />
                      } @else {
                        <div
                          class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white border border-neutral-800"
                          [style.background-color]="conn.connectorColor || '#27272a'"
                        >
                          {{ conn.connectorName.substring(0, 2).toUpperCase() }}
                        </div>
                      }

                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="text-base font-bold text-white">{{ conn.connectorName }}</h3>
                          <!-- Badge de Status -->
                          @if (conn.status === 'UPDATED') {
                            <span class="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 text-[10px] font-mono font-medium flex items-center gap-1">
                              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Sincronizado
                            </span>
                          } @else if (conn.status === 'UPDATING') {
                            <span class="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-900/50 text-[10px] font-mono font-medium flex items-center gap-1">
                              <div class="w-1.5 h-1.5 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                              Atualizando
                            </span>
                          } @else {
                            <span class="px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-900/50 text-[10px] font-mono font-medium">
                              Requer Ação
                            </span>
                          }
                        </div>
                        <p class="text-xs font-mono text-neutral-500 mt-0.5">
                          {{ conn.lastUpdatedAt ? ('Última atualização: ' + (conn.lastUpdatedAt | date:'dd/MM/yyyy HH:mm')) : 'Aguardando sincronização' }}
                        </p>
                      </div>
                    </div>

                    <!-- Ações Rápidas do Banco -->
                    <div class="flex items-center gap-2">
                      <button
                        (click)="syncBank(conn.itemId)"
                        [disabled]="syncingItemId() === conn.itemId"
                        class="py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        @if (syncingItemId() === conn.itemId) {
                          <div class="w-3.5 h-3.5 border-2 border-neutral-400 border-t-white rounded-full animate-spin"></div>
                          <span>Sincronizando...</span>
                        } @else {
                          <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Sincronizar Agora</span>
                        }
                      </button>

                      <button
                        (click)="disconnectBank(conn)"
                        class="py-2 px-3 rounded-xl bg-neutral-900/50 hover:bg-rose-950/30 text-neutral-500 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/50 text-xs transition-all cursor-pointer"
                        title="Desconectar Banco"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- GRID DE CATEGORIAS DE PRODUTOS -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- 1. CONTAS BANCÁRIAS -->
                    <div class="p-4 rounded-xl bg-black/60 border border-neutral-850 space-y-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-emerald-400 font-bold">🏦</span>
                          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Contas ({{ conn.accounts?.length || 0 }})</h4>
                        </div>
                      </div>

                      @if (conn.accounts && conn.accounts.length > 0) {
                        <div class="space-y-2 pt-1">
                          @for (acc of conn.accounts; track acc.id) {
                            <div class="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-between text-xs">
                              <div>
                                <p class="text-neutral-300 font-medium truncate max-w-[120px]">{{ acc.name }}</p>
                                <span class="text-[10px] font-mono text-neutral-500 uppercase">{{ acc.type }}</span>
                              </div>
                              <span class="font-mono text-emerald-400 font-bold">{{ acc.currentBalance | currencyBrl }}</span>
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-neutral-500 italic py-2">Nenhuma conta corrente encontrada.</p>
                      }
                    </div>

                    <!-- 2. CARTÕES DE CRÉDITO -->
                    <div class="p-4 rounded-xl bg-black/60 border border-neutral-850 space-y-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-indigo-400 font-bold">💳</span>
                          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Cartões ({{ conn.creditCards?.length || 0 }})</h4>
                        </div>
                      </div>

                      @if (conn.creditCards && conn.creditCards.length > 0) {
                        <div class="space-y-2 pt-1">
                          @for (card of conn.creditCards; track card.id) {
                            <div class="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80 space-y-1.5 text-xs">
                              <div class="flex items-center justify-between">
                                <span class="text-neutral-300 font-medium truncate max-w-[130px]">{{ card.name }}</span>
                                <span class="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400">{{ card.brand }}</span>
                              </div>
                              <div class="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                <span>Limite total:</span>
                                <span class="text-white font-semibold">{{ card.limit | currencyBrl }}</span>
                              </div>
                              <div class="flex items-center justify-between text-[10px] text-neutral-500">
                                <span>Corte: Dia {{ card.closingDay }}</span>
                                <span>Venc: Dia {{ card.dueDay }}</span>
                              </div>
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-neutral-500 italic py-2">Nenhum cartão vinculado.</p>
                      }
                    </div>

                    <!-- 3. INVESTIMENTOS -->
                    <div class="p-4 rounded-xl bg-black/60 border border-neutral-850 space-y-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-purple-400 font-bold">📈</span>
                          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Investimentos ({{ conn.investments?.length || 0 }})</h4>
                        </div>
                      </div>

                      @if (conn.investments && conn.investments.length > 0) {
                        <div class="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                          @for (inv of conn.investments; track inv.id) {
                            <div class="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80 space-y-1 text-xs">
                              <div class="flex items-center justify-between">
                                <span class="text-neutral-200 font-medium truncate max-w-[120px]" [title]="inv.name">{{ inv.name }}</span>
                                <span class="font-mono text-purple-400 font-bold">{{ inv.balance | currencyBrl }}</span>
                              </div>
                              <div class="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                                <span class="uppercase">{{ inv.type || 'Ativo' }}</span>
                                @if (inv.rate) {
                                  <span class="text-emerald-400">{{ inv.rate }}% {{ inv.rateType || 'CDI' }}</span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-neutral-500 italic py-2">Nenhum investimento disponível.</p>
                      }
                    </div>

                    <!-- 4. EMPRÉSTIMOS & FINANCIAMENTOS -->
                    <div class="p-4 rounded-xl bg-black/60 border border-neutral-850 space-y-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-amber-400 font-bold">🤝</span>
                          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Empréstimos ({{ conn.loans?.length || 0 }})</h4>
                        </div>
                      </div>

                      @if (conn.loans && conn.loans.length > 0) {
                        <div class="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                          @for (loan of conn.loans; track loan.id) {
                            <div class="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80 space-y-1.5 text-xs">
                              <div class="flex items-center justify-between">
                                <span class="text-neutral-200 font-medium truncate max-w-[130px]" [title]="loan.productName">{{ loan.productName }}</span>
                                <span class="font-mono text-rose-400 font-bold">{{ loan.outstandingBalance | currencyBrl }}</span>
                              </div>
                              <div class="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                                <span>Contrato: {{ loan.contractAmount | currencyBrl }}</span>
                                @if (loan.totalInstallments) {
                                  <span>{{ loan.paidInstallments || 0 }}/{{ loan.totalInstallments }} Parc.</span>
                                }
                              </div>
                              @if (loan.cet) {
                                <div class="text-[10px] font-mono text-neutral-500 flex items-center justify-between">
                                  <span>CET: {{ loan.cet }}% a.a.</span>
                                  @if (loan.dueDate) {
                                    <span>Venc: {{ loan.dueDate | date:'MM/yy' }}</span>
                                  }
                                </div>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-neutral-500 italic py-2">Nenhum empréstimo ativo.</p>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <app-bottom-nav />
    </div>
  `,
})
export class OpenFinanceComponent implements OnInit {
  openFinanceService = inject(OpenFinanceService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);

  connections = this.openFinanceService.connections;
  isConnecting = signal(false);
  syncingItemId = signal<string | null>(null);

  ngOnInit() {
    this.loadConnections();
  }

  loadConnections() {
    this.openFinanceService.getConnections().subscribe({
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao carregar conexões bancárias.');
      },
    });
  }

  connectNewBank() {
    this.isConnecting.set(true);

    this.openFinanceService.getConnectToken().subscribe({
      next: (res) => {
        try {
          this.openFinanceService.openPluggyConnect(res.accessToken, {
            onSuccess: (data) => {
              this.isConnecting.set(false);
              this.toastService.info('Conexão autorizada! Sincronizando contas e transações...', 'Open Finance');
              if (data.item?.id) {
                this.syncBank(data.item.id);
              } else {
                this.loadConnections();
              }
            },
            onError: (err) => {
              this.isConnecting.set(false);
              this.toastService.error(err?.message || 'Falha na conexão bancária.');
            },
            onClose: () => {
              this.isConnecting.set(false);
              this.loadConnections();
            },
          });
        } catch (err: any) {
          this.isConnecting.set(false);
          this.toastService.error(err.message || 'Não foi possível inicializar o widget de conexão.');
        }
      },
      error: (err) => {
        this.isConnecting.set(false);
        this.toastService.error(err.error?.message || 'Erro ao obter permissão para conectar banco.');
      },
    });
  }

  syncBank(itemId: string) {
    this.syncingItemId.set(itemId);
    this.openFinanceService.syncConnection(itemId).subscribe({
      next: (res) => {
        this.syncingItemId.set(null);
        this.toastService.success(
          `${res.message} (${res.totalSyncedTransactions} transações sincronizadas)`,
          'Open Finance Atualizado',
        );
        this.loadConnections();
      },
      error: (err) => {
        this.syncingItemId.set(null);
        this.toastService.error(err.error?.message || 'Erro ao sincronizar banco.');
      },
    });
  }

  async disconnectBank(conn: OpenFinanceConnection) {
    const confirmed = await this.dialogService.confirm({
      title: `Desconectar ${conn.connectorName}`,
      message: `Tem certeza que deseja revogar o consentimento do Open Finance para o ${conn.connectorName}? O histórico de transações já importado será mantido.`,
      confirmText: 'Desconectar Banco',
      type: 'danger',
    });

    if (confirmed) {
      this.openFinanceService.deleteConnection(conn.id).subscribe({
        next: () => {
          this.toastService.success('Instituição desconectada com sucesso.');
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao desconectar banco.');
        },
      });
    }
  }
}
