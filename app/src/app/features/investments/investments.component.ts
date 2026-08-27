import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvestmentsService } from '../../core/services/investments.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-investments',
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
                <h1 class="text-2xl font-bold text-white tracking-tight">Investimentos & Carteira</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-400 border border-purple-900/50 text-xs font-mono">
                  Ativos Financeiros
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Visão consolidada de renda fixa, fundos de investimento, ações e títulos sincronizados
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
          @if (investmentsService.loading() && !data()) {
            <div class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-neutral-800 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
          } @else if (!data() || data()!.items.length === 0) {
            <!-- Empty State -->
            <div class="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-5">
              <div class="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 text-purple-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
                📈
              </div>
              <div class="max-w-md mx-auto space-y-1.5">
                <h3 class="text-base font-bold text-white">Nenhum investimento sincronizado ainda</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  Conecte seu banco ou corretora através do Open Finance para importar seus CDBs, Fundos, Ações e Tesouro Direto automaticamente.
                </p>
              </div>
              <a
                routerLink="/open-finance"
                class="px-6 py-3 btn-vercel-primary text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Ir para Open Finance</span>
              </a>
            </div>
          } @else {
            <!-- 1. CARDS DE MÉTRICAS PRINCIPAIS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Total Investido -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2 relative overflow-hidden">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Patrimônio Investido</span>
                  <span class="p-1.5 rounded-lg bg-purple-950/60 border border-purple-900/50 text-purple-400">
                    💰
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-white tracking-tight">
                  {{ data()!.summary.totalInvested | currencyBrl }}
                </div>
                <p class="text-[11px] text-neutral-500 font-mono">
                  Distribuído em {{ data()!.summary.totalAssets }} ativo(s)
                </p>
              </div>

              <!-- Rentabilidade Média -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Taxa Média Ponderada</span>
                  <span class="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-900/50 text-emerald-400">
                    📊
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  {{ data()!.summary.averageRate ? (data()!.summary.averageRate + '% CDI') : 'Vários Índices' }}
                </div>
                <p class="text-[11px] text-neutral-500 font-mono">
                  Base ponderada por saldo
                </p>
              </div>

              <!-- Maior Classe -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Maior Alocação</span>
                  <span class="p-1.5 rounded-lg bg-blue-950/60 border border-blue-900/50 text-blue-400">
                    🎯
                  </span>
                </div>
                <div class="text-lg font-bold text-white truncate">
                  {{ topAllocation()?.category || 'Renda Fixa' }}
                </div>
                <p class="text-[11px] text-blue-400 font-mono">
                  {{ topAllocation()?.percentage || 0 }}% da carteira total
                </p>
              </div>

              <!-- Instituições Conectadas -->
              <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-2">
                <div class="flex items-center justify-between text-neutral-400 text-xs font-medium">
                  <span>Instituições</span>
                  <span class="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400">
                    🏦
                  </span>
                </div>
                <div class="text-2xl font-bold font-mono text-white tracking-tight">
                  {{ uniqueInstitutionsCount() }} banco(s)
                </div>
                <p class="text-[11px] text-neutral-500 font-mono">
                  Via Open Finance Oficial
                </p>
              </div>
            </div>

            <!-- 2. ALOCAÇÃO DA CARTEIRA POR CLASSE -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white">Alocação de Ativos por Classe</h3>
                <span class="text-xs font-mono text-neutral-400">100% Alocado</span>
              </div>

              <!-- Barra de Distribuição Multicor -->
              <div class="h-3.5 w-full bg-neutral-900 rounded-full overflow-hidden flex">
                @for (alloc of data()!.summary.allocation; track alloc.category) {
                  @if (alloc.percentage > 0) {
                    <div
                      class="h-full transition-all"
                      [style.width.%]="alloc.percentage"
                      [style.background-color]="alloc.color"
                      [title]="alloc.category + ': ' + alloc.percentage + '%'"
                    ></div>
                  }
                }
              </div>

              <!-- Legenda da Distribuição -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                @for (alloc of data()!.summary.allocation; track alloc.category) {
                  <div class="flex items-center gap-2 text-xs">
                    <span class="w-3 h-3 rounded-md shrink-0" [style.background-color]="alloc.color"></span>
                    <div class="min-w-0">
                      <p class="text-neutral-300 font-medium truncate">{{ alloc.category }}</p>
                      <p class="text-[11px] font-mono text-neutral-500">{{ alloc.amount | currencyBrl }} ({{ alloc.percentage }}%)</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- 3. FILTROS & LISTA COMPLETA DE ATIVOS -->
            <div class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <!-- Filtro por Categoria -->
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    (click)="selectedType.set('ALL')"
                    [class]="selectedType() === 'ALL' ? 'bg-white text-black font-semibold' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Todos ({{ data()!.items.length }})
                  </button>
                  <button
                    (click)="selectedType.set('FIXED_INCOME')"
                    [class]="selectedType() === 'FIXED_INCOME' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Renda Fixa
                  </button>
                  <button
                    (click)="selectedType.set('MUTUAL_FUND')"
                    [class]="selectedType() === 'MUTUAL_FUND' ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Fundos
                  </button>
                  <button
                    (click)="selectedType.set('EQUITY')"
                    [class]="selectedType() === 'EQUITY' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Ações / ETFs
                  </button>
                </div>

                <!-- Input de Busca -->
                <div class="relative w-full sm:w-64">
                  <input
                    type="text"
                    [value]="searchQuery()"
                    (input)="onSearchInput($event)"
                    placeholder="Buscar ativo por nome ou código..."
                    class="w-full px-3 py-2 pl-8 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-sans"
                  />
                  <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- Grid de Ativos -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (inv of filteredInvestments(); track inv.id) {
                  <div class="p-5 rounded-2xl bg-[#0c0c0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div class="flex items-start justify-between gap-2">
                        <div class="space-y-0.5 min-w-0">
                          <h4 class="text-sm font-bold text-white truncate" [title]="inv.name">{{ inv.name }}</h4>
                          @if (inv.code) {
                            <p class="text-[11px] font-mono text-neutral-500">{{ inv.code }}</p>
                          }
                        </div>

                        <!-- Badge da Instituição -->
                        @if (inv.openFinanceConnection) {
                          <span
                            class="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border shrink-0"
                            [style.background-color]="(inv.openFinanceConnection.connectorColor || '#27272a') + '22'"
                            [style.border-color]="(inv.openFinanceConnection.connectorColor || '#27272a') + '66'"
                            [style.color]="inv.openFinanceConnection.connectorColor || '#e4e4e7'"
                          >
                            {{ inv.openFinanceConnection.connectorName }}
                          </span>
                        }
                      </div>

                      <div class="mt-3 flex items-baseline justify-between">
                        <span class="text-xs text-neutral-400">Saldo Atual:</span>
                        <span class="text-base font-bold font-mono text-purple-400">{{ inv.balance | currencyBrl }}</span>
                      </div>
                    </div>

                    <div class="pt-3 border-t border-neutral-850 space-y-1 text-[11px] font-mono text-neutral-400">
                      <div class="flex items-center justify-between">
                        <span>Tipo:</span>
                        <span class="text-neutral-200 uppercase">{{ inv.subtype || inv.type || 'Ativo' }}</span>
                      </div>
                      @if (inv.rate) {
                        <div class="flex items-center justify-between">
                          <span>Rentabilidade:</span>
                          <span class="text-emerald-400 font-semibold">{{ inv.rate }}% {{ inv.rateType || 'CDI' }}</span>
                        </div>
                      }
                      @if (inv.dueDate) {
                        <div class="flex items-center justify-between">
                          <span>Vencimento:</span>
                          <span class="text-neutral-300">{{ inv.dueDate | date:'dd/MM/yyyy' }}</span>
                        </div>
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
export class InvestmentsComponent implements OnInit {
  investmentsService = inject(InvestmentsService);

  data = this.investmentsService.data;
  selectedType = signal<string>('ALL');
  searchQuery = signal<string>('');

  ngOnInit() {
    this.investmentsService.getInvestments().subscribe();
  }

  topAllocation = computed(() => {
    const list = this.data()?.summary.allocation || [];
    return list.length > 0 ? list[0] : null;
  });

  uniqueInstitutionsCount = computed(() => {
    const items = this.data()?.items || [];
    const set = new Set(items.map((i) => i.openFinanceConnection?.connectorName).filter(Boolean));
    return set.size || 1;
  });

  filteredInvestments = computed(() => {
    const items = this.data()?.items || [];
    const type = this.selectedType();
    const q = this.searchQuery().toLowerCase().trim();

    return items.filter((inv) => {
      // Filtro de Tipo
      if (type !== 'ALL') {
        const invType = (inv.type || '').toUpperCase();
        if (type === 'FIXED_INCOME' && !invType.includes('FIXED_INCOME') && !invType.includes('TREASURY')) return false;
        if (type === 'MUTUAL_FUND' && !invType.includes('MUTUAL_FUND') && !invType.includes('FUND')) return false;
        if (type === 'EQUITY' && !invType.includes('EQUITY') && !invType.includes('ETF') && !invType.includes('STOCK')) return false;
      }

      // Filtro de Busca
      if (q) {
        const nameMatch = inv.name.toLowerCase().includes(q);
        const codeMatch = inv.code ? inv.code.toLowerCase().includes(q) : false;
        return nameMatch || codeMatch;
      }

      return true;
    });
  });

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
}
