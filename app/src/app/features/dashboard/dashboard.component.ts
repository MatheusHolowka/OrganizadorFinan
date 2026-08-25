import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { FamilyService } from '../../core/services/family.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CurrencyBrlPipe,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
  ],
  template: `
    <div class="h-screen flex flex-col overflow-hidden bg-surface-950">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-surface-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Top Bar com Período e Ações Rápidas -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white font-display">Visão Geral Financeira</h1>
                @if (familyService.activeScope() === 'family') {
                  <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                    👨‍👩‍👧‍👦 Família Consolidada
                  </span>
                }
              </div>
              <p class="text-xs md:text-sm text-surface-400 mt-0.5">Balanço consolidado e acompanhamento de metas em tempo real</p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <!-- Filtro de Período no Dashboard -->
              <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-900/80 border border-surface-800">
                <div class="relative">
                  <select
                    [(ngModel)]="selectedMonth"
                    (change)="changePeriod()"
                    class="appearance-none pl-3 pr-7 py-1.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    @for (m of months; track m.value) {
                      <option [value]="m.value" class="bg-surface-900 text-white">{{ m.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-surface-400">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div class="relative">
                  <select
                    [(ngModel)]="selectedYear"
                    (change)="changePeriod()"
                    class="appearance-none pl-3 pr-7 py-1.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    @for (y of years; track y) {
                      <option [value]="y" class="bg-surface-900 text-white">{{ y }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-surface-400">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <a
                routerLink="/import"
                class="px-4 py-2 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 font-semibold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <span>📥</span>
                <span>Importar Extrato</span>
              </a>

              <a
                routerLink="/transactions"
                class="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Transação</span>
              </a>
            </div>
          </div>

          @if (dashboardService.loading()) {
            <div class="flex items-center justify-center py-20">
              <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          } @else if (dashboardService.summary(); as summary) {
            <!-- GRID DE INDICADORES PRINCIPAIS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Card 1: Saldo Disponível Real (com Isolamento Virtual) -->
              <div class="p-5 rounded-3xl bg-surface-900/70 border border-surface-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-brand-500/30 transition-all shadow-glass">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-surface-400">Saldo Livre para Gastar</span>
                    <div class="text-2xl font-black text-white mt-1 font-display">
                      {{ summary.summary.dailyAvailableBalance | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="mt-3 flex items-center justify-between text-[11px] text-surface-400 pt-2 border-t border-surface-800/60">
                  <span>Saldo Bruto em Contas:</span>
                  <span class="font-medium text-surface-300">{{ summary.summary.totalRawBalance | currencyBrl }}</span>
                </div>
              </div>

              <!-- Card 2: Receitas do Mês -->
              <div class="p-5 rounded-3xl bg-surface-900/70 border border-surface-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-glass">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-surface-400">Receitas do Mês</span>
                    <div class="text-2xl font-black text-emerald-400 mt-1 font-display">
                      +{{ summary.summary.monthlyIncome | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div class="mt-3 text-[11px] text-emerald-400/80 pt-2 border-t border-surface-800/60 flex items-center gap-1">
                  <span>↑ Entradas confirmadas no período</span>
                </div>
              </div>

              <!-- Card 3: Despesas do Mês -->
              <div class="p-5 rounded-3xl bg-surface-900/70 border border-surface-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-rose-500/30 transition-all shadow-glass">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-surface-400">Despesas do Mês</span>
                    <div class="text-2xl font-black text-rose-400 mt-1 font-display">
                      -{{ summary.summary.monthlyExpense | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
                <div class="mt-3 text-[11px] text-rose-400/80 pt-2 border-t border-surface-800/60 flex items-center gap-1">
                  <span>↓ Gastos e faturas computados</span>
                </div>
              </div>

              <!-- Card 4: Fundos Blindados em Cofres -->
              <div class="p-5 rounded-3xl bg-surface-900/70 border border-surface-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-vault-DEFAULT/30 transition-all shadow-glass">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-surface-400">Total Blindado em Cofres</span>
                    <div class="text-2xl font-black text-vault-DEFAULT mt-1 font-display">
                      {{ summary.summary.isolatedFunds | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-2xl bg-vault-DEFAULT/10 text-vault-DEFAULT flex items-center justify-center font-bold">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div class="mt-3 text-[11px] text-vault-DEFAULT/80 pt-2 border-t border-surface-800/60 flex items-center gap-1">
                  <span>🛡️ Fundos protegidos contra gastos</span>
                </div>
              </div>
            </div>

            <!-- SEÇÃO DE COFRES & METAS (COM BARRA DE PROGRESSO) -->
            <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm">
              <div class="flex justify-between items-center mb-5">
                <div>
                  <h3 class="text-base font-bold text-white font-display">Cofres & Metas em Andamento</h3>
                  <p class="text-xs text-surface-400">Isolamento virtual ativo para aquisições de médio e longo prazo</p>
                </div>
                <a routerLink="/vaults" class="text-xs text-brand-400 font-semibold hover:underline flex items-center gap-1">
                  <span>Ver Todos</span>
                  <span>→</span>
                </a>
              </div>

              @if (summary.vaults.length === 0) {
                <div class="text-center py-8 text-surface-400 text-xs">
                  Nenhum cofre cadastrado. <a routerLink="/vaults" class="text-vault-DEFAULT underline">Crie seu primeiro cofre</a>.
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (vault of summary.vaults; track vault.id) {
                    <div class="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-3">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="text-sm font-bold text-white font-display">{{ vault.title }}</h4>
                          <span class="text-[10px] uppercase font-bold text-vault-DEFAULT tracking-wider">Fundo Blindado</span>
                        </div>
                        <span class="text-xs font-black text-brand-400">{{ vault.progress }}%</span>
                      </div>

                      <div class="w-full bg-surface-800 h-2 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-vault-DEFAULT to-brand-400 rounded-full transition-all duration-500"
                          [style.width.%]="vault.progress"
                        ></div>
                      </div>

                      <div class="flex justify-between text-xs text-surface-400">
                        <span>Atual: <strong class="text-white">{{ vault.currentAmount | currencyBrl }}</strong></span>
                        <span>Meta: <strong class="text-surface-300">{{ vault.targetAmount | currencyBrl }}</strong></span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- TABELA DE TRANSAÇÕES RECENTES -->
            <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-base font-bold text-white font-display">Últimos Lançamentos</h3>
                <a routerLink="/transactions" class="text-xs text-brand-400 font-semibold hover:underline">Ver Extrato Completo</a>
              </div>

              @if (summary.recentTransactions.length === 0) {
                <div class="text-center py-8 text-surface-400 text-xs">
                  Nenhuma transação lançada ainda.
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-surface-400 border-b border-surface-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th class="pb-3 font-semibold">Descrição</th>
                        <th class="pb-3 font-semibold">Categoria</th>
                        <th class="pb-3 font-semibold">Conta</th>
                        <th class="pb-3 font-semibold">Data</th>
                        <th class="pb-3 font-semibold text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-800/60">
                      @for (tx of summary.recentTransactions; track tx.id) {
                        <tr class="hover:bg-surface-800/30 transition-colors">
                          <td class="py-3.5 font-medium text-white flex items-center gap-2">
                            <span
                              class="w-2 h-2 rounded-full shrink-0"
                              [ngClass]="tx.type === 'INCOME' ? 'bg-emerald-400' : (tx.type === 'EXPENSE' ? 'bg-rose-400' : 'bg-indigo-400')"
                            ></span>
                            <span class="truncate max-w-xs">{{ tx.description }}</span>
                          </td>
                          <td class="py-3.5 text-surface-300">{{ tx.category?.name || 'Geral' }}</td>
                          <td class="py-3.5 text-surface-300">{{ tx.account?.name || 'Conta' }}</td>
                          <td class="py-3.5 text-surface-400">{{ tx.date | date:'dd/MM/yyyy' }}</td>
                          <td
                            class="py-3.5 text-right font-bold"
                            [ngClass]="tx.type === 'INCOME' ? 'text-emerald-400' : (tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-indigo-400')"
                          >
                            {{ tx.type === 'EXPENSE' ? '-' : '+' }}{{ tx.amount | currencyBrl }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
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
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  familyService = inject(FamilyService);

  now = new Date();
  selectedMonth = this.now.getMonth() + 1;
  selectedYear = this.now.getFullYear();

  months = [
    { value: 1, name: 'Janeiro' },
    { value: 2, name: 'Fevereiro' },
    { value: 3, name: 'Março' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Maio' },
    { value: 6, name: 'Junho' },
    { value: 7, name: 'Julho' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Setembro' },
    { value: 10, name: 'Outubro' },
    { value: 11, name: 'Novembro' },
    { value: 12, name: 'Dezembro' },
  ];

  years = [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020];

  constructor() {
    // Recarrega automaticamente quando o usuário alternar entre Minhas Finanças e Família
    effect(() => {
      const scope = this.familyService.activeScope();
      this.loadSummary(scope);
    });
  }

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary(scope?: string) {
    const currentScope = scope || this.familyService.activeScope();
    this.dashboardService
      .getSummary(Number(this.selectedMonth), Number(this.selectedYear), currentScope)
      .subscribe();
  }

  changePeriod() {
    this.loadSummary();
  }
}
