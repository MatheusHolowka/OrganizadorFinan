import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoansService } from '../../core/services/loans.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
          <!-- Top Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-bold text-white tracking-tight">Empréstimos & Dívidas</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-900/50 text-xs font-mono">
                  Passivos Financeiros
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Gestão centralizada de saldo devedor, parcelas restantes, taxas de juros e estratégia de quitação
              </p>
            </div>

            <div class="flex items-center gap-2.5">
              <a
                routerLink="/open-finance"
                class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Conectar Mais Contas</span>
              </a>
            </div>
          </div>

          <!-- Loading State -->
          @if (loansService.loading() && !data()) {
            <div class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-neutral-800 border-t-amber-400 rounded-full animate-spin"></div>
            </div>
          } @else if (!data() || data()!.items.length === 0) {
            <!-- Empty State (Parabéns / Sem Dívidas) -->
            <div class="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-5">
              <div class="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-emerald-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
                🎉
              </div>
              <div class="max-w-md mx-auto space-y-1.5">
                <h3 class="text-base font-bold text-white">Nenhum empréstimo ou passivo ativo</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  Excelente! Você não possui empréstimos, financiamentos ou passivos bancários registrados ou sincronizados.
                </p>
              </div>
              <a
                routerLink="/dashboard"
                class="px-6 py-3 btn-vercel-primary text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Voltar ao Dashboard</span>
              </a>
            </div>
          } @else {
            <!-- 1. CARDS DE MÉTRICAS PRINCIPAIS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Saldo Devedor Total -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Passivo Devedor Total</span>
                  <span class="p-1.5 rounded-lg bg-rose-950/60 border border-rose-900/50 text-rose-400">
                    💳
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-rose-400 tracking-tight">
                  {{ data()!.summary.totalOutstandingBalance | currencyBrl }}
                </div>
                <p class="text-[11px] text-neutral-500 font-mono">
                  Contratado: {{ data()!.summary.totalContracted | currencyBrl }}
                </p>
              </div>

              <!-- Custo Efetivo Total (CET) -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>CET Médio Ponderado</span>
                  <span class="p-1.5 rounded-lg bg-amber-950/60 border border-amber-900/50 text-amber-400">
                    📉
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-amber-400 tracking-tight">
                  {{ data()!.summary.averageCet ? (data()!.summary.averageCet + '% a.a.') : 'Variável' }}
                </div>
                <p class="text-[11px] text-neutral-500 font-mono">
                  Taxa anual efetiva total
                </p>
              </div>

              <!-- Progresso Geral de Quitação -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Quitação Global</span>
                  <span class="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-900/50 text-emerald-400">
                    🏁
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-white tracking-tight">
                  {{ data()!.summary.overallProgress }}%
                </div>
                <p class="text-[11px] text-emerald-400 font-mono">
                  {{ data()!.summary.paidInstallmentsCount }} parcelas liquidadas
                </p>
              </div>

              <!-- Total de Contratos -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Contratos Ativos</span>
                  <span class="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400">
                    📑
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-white tracking-tight">
                  {{ data()!.summary.totalContracts }} contrato(s)
                </div>
                <p class="text-[11px] text-neutral-500 font-mono">
                  Sincronizados via Open Finance
                </p>
              </div>
            </div>

            <!-- 2. BARRA DE QUITAÇÃO GERAL -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span class="font-bold text-white">Progresso Consolidado de Amortização</span>
                </div>
                <span class="font-mono text-neutral-400">{{ data()!.summary.overallProgress }}% Quitado</span>
              </div>

              <div class="h-3 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all rounded-full"
                  [style.width.%]="data()!.summary.overallProgress"
                ></div>
              </div>

              <div class="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                <span>Já Pago: {{ (data()!.summary.totalContracted - data()!.summary.totalOutstandingBalance) | currencyBrl }}</span>
                <span>Restante a Pagar: {{ data()!.summary.totalOutstandingBalance | currencyBrl }}</span>
              </div>
            </div>

            <!-- 3. LISTA DE CONTRATOS DE EMPRÉSTIMOS -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white">Contratos & Financiamentos Detalhados</h3>
                <span class="text-xs font-mono text-neutral-400">{{ data()!.items.length }} contrato(s)</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (loan of data()!.items; track loan.id) {
                  <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all space-y-4">
                    <!-- Topo do Card -->
                    <div class="flex items-start justify-between gap-3">
                      <div class="space-y-0.5 min-w-0">
                        <h4 class="text-sm font-bold text-white truncate" [title]="loan.productName">{{ loan.productName }}</h4>
                        <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                          <span>Contrato: {{ loan.contractNumber || 'S/N' }}</span>
                          <span>•</span>
                          <span class="uppercase text-neutral-400">{{ loan.type }}</span>
                        </div>
                      </div>

                      @if (loan.openFinanceConnection) {
                        <span
                          class="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border shrink-0"
                          [style.background-color]="(loan.openFinanceConnection.connectorColor || '#27272a') + '22'"
                          [style.border-color]="(loan.openFinanceConnection.connectorColor || '#27272a') + '66'"
                          [style.color]="loan.openFinanceConnection.connectorColor || '#e4e4e7'"
                        >
                          {{ loan.openFinanceConnection.connectorName }}
                        </span>
                      }
                    </div>

                    <!-- Valores do Contrato -->
                    <div class="p-3 rounded-xl bg-black/60 border border-neutral-850 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span class="text-[10px] font-mono text-neutral-500 uppercase">Saldo Devedor:</span>
                        <p class="font-mono text-sm font-bold text-rose-400">{{ loan.outstandingBalance | currencyBrl }}</p>
                      </div>
                      <div>
                        <span class="text-[10px] font-mono text-neutral-500 uppercase">Valor Contratado:</span>
                        <p class="font-mono text-sm font-medium text-neutral-300">{{ loan.contractAmount | currencyBrl }}</p>
                      </div>
                    </div>

                    <!-- Barra de Progresso de Parcelas -->
                    @if (loan.totalInstallments) {
                      <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span>Parcelas: {{ loan.paidInstallments || 0 }} de {{ loan.totalInstallments }} pagas</span>
                          <span>{{ getLoanProgress(loan) }}%</span>
                        </div>
                        <div class="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-amber-500 rounded-full transition-all"
                            [style.width.%]="getLoanProgress(loan)"
                          ></div>
                        </div>
                      </div>
                    }

                    <!-- Detalhes Financeiros (Taxas e Vencimento) -->
                    <div class="pt-2 border-t border-neutral-850 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400 gap-2">
                      @if (loan.cet) {
                        <span>CET: <strong class="text-white">{{ loan.cet }}% a.a.</strong></span>
                      }
                      @if (loan.interestRate) {
                        <span>Taxa: <strong class="text-neutral-300">{{ loan.interestRate }}% a.a.</strong></span>
                      }
                      @if (loan.dueDate) {
                        <span>Término: <strong class="text-neutral-300">{{ loan.dueDate | date:'MM/yyyy' }}</strong></span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </main>
      </div>

      <app-bottom-nav />
    </div>
  `,
})
export class LoansComponent implements OnInit {
  loansService = inject(LoansService);

  data = this.loansService.data;

  ngOnInit() {
    this.loansService.getLoans().subscribe();
  }

  getLoanProgress(loan: any): number {
    if (!loan.totalInstallments || loan.totalInstallments === 0) return 0;
    const paid = loan.paidInstallments || 0;
    return Math.min(100, Math.round((paid / loan.totalInstallments) * 100));
  }
}
