import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AccountsService } from '../../core/services/accounts.service';
import { FamilyService } from '../../core/services/family.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Account, AccountType, CategoryExpenseItem, CashFlowPoint } from '../../core/models';

@Component({
  selector: 'app-dashboard',
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
          <!-- Top Bar com Período e Ações Rápidas -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white tracking-tight">Painel Financeiro</h1>
                @if (familyService.activeScope() === 'family') {
                  <span class="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono">
                    Família Consolidada
                  </span>
                }
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">Balanço consolidado, controle de limites e fluxo de caixa em tempo real</p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <!-- Filtro de Período -->
              <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c0c0e] border border-neutral-800">
                <div class="relative">
                  <select
                    [(ngModel)]="selectedMonth"
                    (change)="changePeriod()"
                    class="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-black border border-neutral-800 text-white text-xs font-medium focus:outline-none focus:border-neutral-600 cursor-pointer"
                  >
                    @for (m of months; track m.value) {
                      <option [value]="m.value" class="bg-neutral-900 text-white">{{ m.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div class="relative">
                  <select
                    [(ngModel)]="selectedYear"
                    (change)="changePeriod()"
                    class="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-black border border-neutral-800 text-white text-xs font-mono font-medium focus:outline-none focus:border-neutral-600 cursor-pointer"
                  >
                    @for (y of years; track y) {
                      <option [value]="y" class="bg-neutral-900 text-white">{{ y }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                (click)="openNewAccountModal()"
                class="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Nova Conta</span>
              </button>

              <a
                routerLink="/cards"
                class="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <span>+ Compra Cartão</span>
              </a>

              <a
                routerLink="/transactions"
                class="px-4 py-1.5 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Transação</span>
              </a>
            </div>
          </div>

          @if (dashboardService.loading()) {
            <div class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
            </div>
          } @else if (dashboardService.summary(); as summary) {
            <!-- GRID DE INDICADORES PRINCIPAIS -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Card 1: Saldo Disponível Real -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[11px] font-mono uppercase text-neutral-400">Saldo Livre Diário</span>
                    <div class="text-2xl font-bold font-mono text-white mt-1">
                      {{ summary.summary.dailyAvailableBalance | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                </div>
                <div class="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-850">
                  <span>Bruto em Contas:</span>
                  <span class="text-neutral-300">{{ summary.summary.totalRawBalance | currencyBrl }}</span>
                </div>
              </div>

              <!-- Card 2: Receitas do Mês -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[11px] font-mono uppercase text-neutral-400">Receitas Confirmadas</span>
                    <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">
                      +{{ summary.summary.monthlyIncome | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ↑
                  </div>
                </div>
                <div class="mt-3 text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-850">
                  Entradas do período selecionado
                </div>
              </div>

              <!-- Card 3: Despesas e Faturas -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[11px] font-mono uppercase text-neutral-400">Despesas & Faturas</span>
                    <div class="text-2xl font-bold font-mono text-rose-400 mt-1">
                      -{{ summary.summary.monthlyExpense | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-400 flex items-center justify-center font-bold text-xs">
                    ↓
                  </div>
                </div>
                <div class="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-850">
                  <span>Faturas de Cartão:</span>
                  <span class="text-neutral-300">{{ summary.summary.totalOpenInvoices | currencyBrl }}</span>
                </div>
              </div>

              <!-- Card 4: Fundos Blindados em Cofres -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[11px] font-mono uppercase text-neutral-400">Cofres & Metas Blindadas</span>
                    <div class="text-2xl font-bold font-mono text-white mt-1">
                      {{ summary.summary.isolatedFunds | currencyBrl }}
                    </div>
                  </div>
                  <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs">
                    🛡️
                  </div>
                </div>
                <div class="mt-3 text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-850">
                  Total em quarentena financeira
                </div>
              </div>
            </div>

            <!-- ========================================================================= -->
            <!-- PAINEL VISUAL DE CONTROLE DE CARTÕES DE CRÉDITO & LIMITES                -->
            <!-- ========================================================================= -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-white tracking-tight">Controle & Limites de Cartões</h3>
                    <span class="px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px] font-mono">
                      {{ summary.cards.length }} Cartões
                    </span>
                  </div>
                  <p class="text-xs text-neutral-400">Visibilidade em tempo real de limites ocupados, faturas abertas e datas de corte</p>
                </div>

                <a
                  routerLink="/cards"
                  class="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto transition-all"
                >
                  <span>Gerenciar Faturas Detalhadas</span>
                  <span>→</span>
                </a>
              </div>

              <!-- Indicador Consolidado de Limite de Crédito -->
              <div class="p-4 rounded-xl bg-black border border-neutral-850 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <span class="text-[10px] text-neutral-500 uppercase">Limite Total Concedido</span>
                  <div class="text-lg font-bold text-white mt-0.5">
                    {{ summary.summary.totalCardLimit | currencyBrl }}
                  </div>
                </div>
                <div>
                  <span class="text-[10px] text-neutral-500 uppercase">Limite Ocupado (Comprometido)</span>
                  <div class="text-lg font-bold text-amber-400 mt-0.5">
                    {{ summary.summary.totalCardUsed | currencyBrl }}
                  </div>
                </div>
                <div>
                  <span class="text-[10px] text-neutral-500 uppercase">Limite Livre Disponível</span>
                  <div class="text-lg font-bold text-emerald-400 mt-0.5">
                    {{ summary.summary.totalCardAvailable | currencyBrl }}
                  </div>
                </div>
              </div>

              @if (summary.cards.length === 0) {
                <div class="text-center py-8 text-neutral-500 text-xs font-mono border border-dashed border-neutral-850 rounded-xl space-y-2">
                  <p>Nenhum cartão de crédito cadastrado.</p>
                  <a routerLink="/cards" class="text-white underline hover:text-neutral-300">
                    Cadastrar Cartão de Crédito
                  </a>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (card of summary.cards; track card.id) {
                    <div class="p-4 rounded-xl bg-black border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <div class="flex justify-between items-start mb-2">
                          <div>
                            <span class="text-[9px] uppercase font-mono tracking-wider text-neutral-500 font-bold">{{ card.brand }}</span>
                            <h4 class="text-sm font-bold text-white">{{ card.name }}</h4>
                          </div>
                          <span class="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold text-neutral-300">
                            {{ card.usedPercentage }}% Ocupado
                          </span>
                        </div>

                        <!-- Fatura Aberta -->
                        <div class="font-mono mt-2">
                          <span class="text-[10px] text-neutral-400 uppercase">Fatura Atual Aberta:</span>
                          <div class="text-lg font-bold text-white">
                            {{ card.currentInvoiceAmount | currencyBrl }}
                          </div>
                        </div>

                        <!-- Barra de Limite -->
                        <div class="mt-3 space-y-1 font-mono text-[10px]">
                          <div class="flex justify-between text-neutral-400">
                            <span>Disponível: <strong class="text-emerald-400">{{ card.availableLimit | currencyBrl }}</strong></span>
                            <span>Limite: {{ card.limit | currencyBrl }}</span>
                          </div>
                          <div class="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                            <div
                              class="h-full rounded-full transition-all duration-500"
                              [ngClass]="card.usedPercentage > 80 ? 'bg-rose-500' : (card.usedPercentage > 50 ? 'bg-amber-400' : 'bg-white')"
                              [style.width.%]="card.usedPercentage"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div class="pt-2 border-t border-neutral-900 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                        <span>Corte dia <strong>{{ card.closingDay }}</strong> • Venc. dia <strong>{{ card.dueDay }}</strong></span>
                        <a [routerLink]="['/cards']" class="text-white hover:underline flex items-center gap-0.5">
                          <span>Extrato</span>
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- ========================================================================= -->
            <!-- SEÇÃO DE GRÁFICOS VISUAIS: FLUXO DE CAIXA & CATEGORIAS                   -->
            <!-- ========================================================================= -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- GRÁFICO 1: FLUXO DE CAIXA 6 MESES (BAR CHART INTERATIVO) -->
              <div class="lg:col-span-2 p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 flex flex-col justify-between space-y-5">
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <h3 class="text-base font-bold text-white tracking-tight">Fluxo de Caixa Semestral</h3>
                    <span class="text-[10px] font-mono text-neutral-500 uppercase">Histórico & Projeção</span>
                  </div>
                  <p class="text-xs text-neutral-400">Comparativo de Receitas (verde) vs Despesas + Faturas (branco)</p>
                </div>

                <!-- Canvas / SVG Bar Chart -->
                <div class="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-neutral-850 font-mono text-xs">
                  @for (point of summary.cashFlowHistory; track point.monthLabel) {
                    <div class="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                      <!-- Tooltip Hover -->
                      <div class="absolute -top-12 bg-neutral-900 border border-neutral-700 text-[10px] rounded-lg px-2.5 py-1 text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                        <div class="text-emerald-400 font-bold">+{{ point.income | currencyBrl }}</div>
                        <div class="text-rose-400 font-bold">-{{ (point.expense + point.invoice) | currencyBrl }}</div>
                      </div>

                      <!-- Barras Lado a Lado -->
                      <div class="w-full flex items-end justify-center gap-1.5 h-full max-h-40">
                        <!-- Barra Receita -->
                        <div
                          class="w-3 sm:w-4 bg-emerald-400 rounded-t transition-all duration-500 hover:bg-emerald-300"
                          [style.height.%]="getBarHeight(point.income, summary.cashFlowHistory)"
                        ></div>

                        <!-- Barra Despesa Total -->
                        <div
                          class="w-3 sm:w-4 bg-neutral-300 rounded-t transition-all duration-500 hover:bg-white"
                          [style.height.%]="getBarHeight(point.expense + point.invoice, summary.cashFlowHistory)"
                        ></div>
                      </div>

                      <span class="text-[10px] text-neutral-400 mt-2 font-mono">{{ point.monthLabel }}</span>
                    </div>
                  }
                </div>

                <div class="flex items-center justify-center gap-6 text-xs font-mono text-neutral-400 pt-1">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                    <span>Receitas</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-sm bg-neutral-300"></span>
                    <span>Despesas & Faturas</span>
                  </div>
                </div>
              </div>

              <!-- GRÁFICO 2: COMPOSIÇÃO DE GASTOS POR CATEGORIA (DONUT CHART) -->
              <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 flex flex-col justify-between space-y-4">
                <div>
                  <h3 class="text-base font-bold text-white tracking-tight">Despesas por Categoria</h3>
                  <p class="text-xs text-neutral-400">Distribuição percentual dos gastos no mês</p>
                </div>

                @if (summary.categoryExpenses.length === 0) {
                  <div class="text-center py-12 text-neutral-500 text-xs font-mono">
                    Nenhum gasto registrado neste mês.
                  </div>
                } @else {
                  <!-- Donut SVG & Progress List -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-center relative py-2">
                      <svg class="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#18181b"
                          stroke-width="14"
                        />
                        @for (cat of getDonutSlices(summary.categoryExpenses); track cat.name) {
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            [attr.stroke]="cat.color"
                            stroke-width="14"
                            [attr.stroke-dasharray]="cat.dashArray"
                            [attr.stroke-dashoffset]="cat.dashOffset"
                            class="transition-all duration-700"
                          />
                        }
                      </svg>
                      <div class="absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none">
                        <span class="text-[10px] text-neutral-500 uppercase">Total</span>
                        <span class="text-xs font-bold text-white">{{ summary.summary.monthlyExpense | currencyBrl }}</span>
                      </div>
                    </div>

                    <!-- Lista de Categorias -->
                    <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      @for (cat of summary.categoryExpenses; track cat.name) {
                        <div class="space-y-1 font-mono text-xs">
                          <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                              <span class="w-2 h-2 rounded-full shrink-0" [style.backgroundColor]="cat.color"></span>
                              <span class="text-neutral-300 font-sans truncate max-w-[120px]">{{ cat.name }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                              <span class="text-white font-bold">{{ cat.amount | currencyBrl }}</span>
                              <span class="text-[10px] text-neutral-500">({{ cat.percentage }}%)</span>
                            </div>
                          </div>
                          <div class="w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
                            <div
                              class="h-full rounded-full transition-all duration-500"
                              [style.backgroundColor]="cat.color"
                              [style.width.%]="cat.percentage"
                            ></div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- SEÇÃO DE CONTAS BANCÁRIAS / CONTAS CORRENTES -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-white tracking-tight">Contas Bancárias & Carteiras</h3>
                  <p class="text-xs text-neutral-400">Gerencie múltiplas contas correntes, investimentos e saldos disponíveis</p>
                </div>
                <button
                  (click)="openNewAccountModal()"
                  class="px-3.5 py-1.5 rounded-xl btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Adicionar Conta Corrente</span>
                </button>
              </div>

              @if (summary.accounts.length === 0) {
                <div class="text-center py-8 text-neutral-500 text-xs font-mono border border-dashed border-neutral-800 rounded-xl space-y-2">
                  <p>Nenhuma conta cadastrada.</p>
                  <button
                    (click)="openNewAccountModal()"
                    class="text-white underline hover:text-neutral-300 cursor-pointer"
                  >
                    Cadastrar Primeira Conta
                  </button>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (acc of summary.accounts; track acc.id) {
                    <div class="p-4 rounded-xl bg-black border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3">
                      <div class="flex items-start justify-between">
                        <div class="flex items-center gap-2.5">
                          <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center font-bold text-xs">
                            {{ getAccountIcon(acc.type) }}
                          </div>
                          <div>
                            <h4 class="text-sm font-bold text-white">{{ acc.name }}</h4>
                            <span class="text-[10px] font-mono text-neutral-500 uppercase">{{ getAccountTypeLabel(acc.type) }}</span>
                          </div>
                        </div>

                        <div class="flex items-center gap-1">
                          <button
                            (click)="openEditAccountModal(acc)"
                            title="Editar Conta"
                            class="p-1 rounded text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            (click)="deleteAccount(acc)"
                            title="Excluir Conta"
                            class="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors cursor-pointer"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div class="pt-2 border-t border-neutral-900 flex justify-between items-baseline font-mono">
                        <span class="text-[11px] text-neutral-500 uppercase">Saldo Atual</span>
                        <span
                          class="text-lg font-bold"
                          [ngClass]="acc.currentBalance >= 0 ? 'text-white' : 'text-rose-400'"
                        >
                          {{ acc.currentBalance | currencyBrl }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- SEÇÃO DE COFRES & METAS -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800">
              <div class="flex justify-between items-center mb-5">
                <div>
                  <h3 class="text-base font-bold text-white tracking-tight">Cofres & Metas Blindadas</h3>
                  <p class="text-xs text-neutral-400">Isolamento virtual ativo para aquisições planejadas</p>
                </div>
                <a routerLink="/vaults" class="text-xs font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                  <span>Ver Todos</span>
                  <span>→</span>
                </a>
              </div>

              @if (summary.vaults.length === 0) {
                <div class="text-center py-8 text-neutral-500 text-xs font-mono">
                  Nenhum cofre ativo. <a routerLink="/vaults" class="text-white underline">Criar cofre</a>.
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
                  @for (vault of summary.vaults; track vault.id) {
                    <div class="p-4 rounded-xl bg-black border border-neutral-800 space-y-3">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="text-sm font-bold text-white font-sans">{{ vault.title }}</h4>
                          <span class="text-[10px] text-neutral-500 uppercase">Fundo Blindado</span>
                        </div>
                        <span class="text-xs font-bold text-white">{{ vault.progress }}%</span>
                      </div>

                      <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-white rounded-full transition-all duration-500"
                          [style.width.%]="vault.progress"
                        ></div>
                      </div>

                      <div class="flex justify-between text-[11px] text-neutral-400">
                        <span>Atual: <strong class="text-white">{{ vault.currentAmount | currencyBrl }}</strong></span>
                        <span>Meta: <strong class="text-neutral-500">{{ vault.targetAmount | currencyBrl }}</strong></span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- TABELA DE TRANSAÇÕES RECENTES -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-base font-bold text-white tracking-tight">Últimos Lançamentos</h3>
                <a routerLink="/transactions" class="text-xs font-mono text-neutral-400 hover:text-white transition-colors">Extrato Completo →</a>
              </div>

              @if (summary.recentTransactions.length === 0) {
                <div class="text-center py-8 text-neutral-500 text-xs font-mono">
                  Nenhuma transação lançada no período.
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs font-mono">
                    <thead class="text-neutral-500 border-b border-neutral-800 uppercase text-[10px]">
                      <tr>
                        <th class="pb-3 font-medium">Descrição</th>
                        <th class="pb-3 font-medium">Categoria</th>
                        <th class="pb-3 font-medium">Conta</th>
                        <th class="pb-3 font-medium">Data</th>
                        <th class="pb-3 font-medium text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-850 text-neutral-300">
                      @for (tx of summary.recentTransactions; track tx.id) {
                        <tr class="hover:bg-neutral-900/40 transition-colors">
                          <td class="py-3.5 font-sans font-medium text-white flex items-center gap-2">
                            <span
                              class="w-1.5 h-1.5 rounded-full shrink-0"
                              [ngClass]="tx.type === 'INCOME' ? 'bg-emerald-400' : (tx.type === 'EXPENSE' ? 'bg-rose-400' : 'bg-neutral-400')"
                            ></span>
                            <span class="truncate max-w-xs">{{ tx.description }}</span>
                          </td>
                          <td class="py-3.5 text-neutral-400">{{ tx.category?.name || 'Geral' }}</td>
                          <td class="py-3.5 text-neutral-400">{{ tx.account?.name || 'Conta' }}</td>
                          <td class="py-3.5 text-neutral-500">{{ tx.date | date:'dd/MM/yyyy' }}</td>
                          <td
                            class="py-3.5 text-right font-bold"
                            [ngClass]="tx.type === 'INCOME' ? 'text-emerald-400' : (tx.type === 'EXPENSE' ? 'text-white' : 'text-neutral-300')"
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

      <!-- Modal Criar / Editar Conta Bancária -->
      <app-modal
        [isOpen]="isAccountModalOpen()"
        [title]="editingAccount() ? 'Editar Conta Bancária' : 'Nova Conta Bancária'"
        (close)="isAccountModalOpen.set(false)"
      >
        <form [formGroup]="accountForm" (ngSubmit)="submitAccount()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Nome da Conta / Banco</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Nubank Conta Corrente, Itaú Salário, Inter PJ, Sicredi"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Tipo de Conta</label>
              <div class="relative">
                <select
                  formControlName="type"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  <option value="CHECKING" class="bg-neutral-900 text-white">Conta Corrente</option>
                  <option value="SAVINGS" class="bg-neutral-900 text-white">Conta Poupança</option>
                  <option value="INVESTMENT" class="bg-neutral-900 text-white">Investimentos</option>
                  <option value="CASH" class="bg-neutral-900 text-white">Carteira / Dinheiro</option>
                  <option value="DIGITAL_WALLET" class="bg-neutral-900 text-white">Carteira Digital</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Saldo Inicial (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="initialBalance"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              (click)="isAccountModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="accountForm.invalid || accountLoading()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (accountLoading()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              }
              <span>{{ editingAccount() ? 'Salvar Alterações' : 'Criar Conta' }}</span>
            </button>
          </div>
        </form>
      </app-modal>

      <app-bottom-nav />
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  accountsService = inject(AccountsService);
  familyService = inject(FamilyService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  fb = inject(FormBuilder);

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

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

  years = [2024, 2025, 2026, 2027, 2028];

  isAccountModalOpen = signal(false);
  editingAccount = signal<Account | null>(null);
  accountLoading = signal(false);

  accountForm = this.fb.group({
    name: ['', Validators.required],
    type: ['CHECKING' as AccountType, Validators.required],
    initialBalance: [0, Validators.required],
    color: ['#FFFFFF'],
  });

  constructor() {
    effect(() => {
      const scope = this.familyService.activeScope();
      this.dashboardService.getSummary(this.selectedMonth, this.selectedYear, scope).subscribe();
    });
  }

  ngOnInit() {
    this.changePeriod();
  }

  changePeriod() {
    const scope = this.familyService.activeScope();
    this.dashboardService.getSummary(this.selectedMonth, this.selectedYear, scope).subscribe();
  }

  getBarHeight(value: number, history: CashFlowPoint[]): number {
    if (!history || history.length === 0) return 0;
    const maxVal = Math.max(...history.map((h) => Math.max(h.income, h.expense + h.invoice)), 1);
    return Math.max(5, Math.round((value / maxVal) * 100));
  }

  getDonutSlices(categories: CategoryExpenseItem[]): { name: string; color: string; dashArray: string; dashOffset: number }[] {
    const circumference = 2 * Math.PI * 38; // ~238.76
    let accumulatedOffset = 0;

    return categories.map((cat) => {
      const sliceLength = (cat.percentage / 100) * circumference;
      const dashArray = `${sliceLength} ${circumference - sliceLength}`;
      const dashOffset = -accumulatedOffset;
      accumulatedOffset += sliceLength;

      return {
        name: cat.name,
        color: cat.color || '#A1A1AA',
        dashArray,
        dashOffset,
      };
    });
  }

  openNewAccountModal() {
    this.editingAccount.set(null);
    this.accountForm.reset({
      name: '',
      type: 'CHECKING',
      initialBalance: 0,
      color: '#FFFFFF',
    });
    this.isAccountModalOpen.set(true);
  }

  openEditAccountModal(account: Account) {
    this.editingAccount.set(account);
    this.accountForm.patchValue({
      name: account.name,
      type: account.type,
      initialBalance: account.initialBalance,
      color: account.color || '#FFFFFF',
    });
    this.isAccountModalOpen.set(true);
  }

  submitAccount() {
    if (this.accountForm.invalid) return;

    this.accountLoading.set(true);
    const formVal = this.accountForm.value;
    const current = this.editingAccount();

    if (current) {
      this.accountsService.update(current.id, formVal).subscribe({
        next: () => {
          this.accountLoading.set(false);
          this.isAccountModalOpen.set(false);
          this.toastService.success('Conta bancária atualizada com sucesso!');
          this.changePeriod();
        },
        error: (err) => {
          this.accountLoading.set(false);
          this.toastService.error(err.error?.message || 'Erro ao atualizar conta.');
        },
      });
    } else {
      this.accountsService.create(formVal).subscribe({
        next: () => {
          this.accountLoading.set(false);
          this.isAccountModalOpen.set(false);
          this.toastService.success('Conta bancária criada com sucesso!');
          this.changePeriod();
        },
        error: (err) => {
          this.accountLoading.set(false);
          this.toastService.error(err.error?.message || 'Erro ao criar conta.');
        },
      });
    }
  }

  async deleteAccount(account: Account) {
    const confirmed = await this.dialogService.confirm({
      title: 'Excluir Conta Bancária',
      message: `Deseja realmente excluir a conta "${account.name}"? Isso não apagará o histórico consolidado.`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.accountsService.remove(account.id).subscribe({
        next: () => {
          this.toastService.success(`Conta "${account.name}" excluída.`);
          this.changePeriod();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao excluir conta.');
        },
      });
    }
  }

  getAccountTypeLabel(type: AccountType): string {
    switch (type) {
      case 'CHECKING': return 'Conta Corrente';
      case 'SAVINGS': return 'Poupança';
      case 'INVESTMENT': return 'Investimentos';
      case 'CASH': return 'Dinheiro';
      case 'DIGITAL_WALLET': return 'Carteira Digital';
      default: return type;
    }
  }

  getAccountIcon(type: AccountType): string {
    switch (type) {
      case 'CHECKING': return '🏛️';
      case 'SAVINGS': return '💰';
      case 'INVESTMENT': return '📈';
      case 'CASH': return '💵';
      case 'DIGITAL_WALLET': return '📱';
      default: return '🏦';
    }
  }
}
