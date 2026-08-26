import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

interface SimulatedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  fitid: string;
  isDuplicate?: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyBrlPipe],
  template: `
    <div 
      (mousemove)="onContainerMouseMove($event)"
      class="min-h-screen bg-black text-[#ededed] selection:bg-white selection:text-black relative overflow-hidden font-sans"
    >
      <!-- Vercel Subtle Mouse Spotlight -->
      <div class="mouse-spotlight"></div>

      <!-- ========================================================================= -->
      <!-- 1. FLOATING ISLAND NAVBAR (CLERK / VERCEL STYLE)                          -->
      <!-- ========================================================================= -->
      <nav class="fixed top-4 sm:top-6 inset-x-0 z-50 max-w-6xl mx-auto px-4 pointer-events-auto">
        <div class="floating-island-nav rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300">
          
          <!-- Brand Logo -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              ▲
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm tracking-tight text-white">Organizador<span class="text-neutral-400">Finan</span></span>
              <span class="hidden sm:inline-block px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400">
                v2.4
              </span>
            </div>
          </div>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <button (click)="scrollTo('console')" class="hover:text-white transition-colors cursor-pointer">Console</button>
            <button (click)="scrollTo('features')" class="hover:text-white transition-colors cursor-pointer">Engenharia</button>
            <button (click)="scrollTo('waterfall')" class="hover:text-white transition-colors cursor-pointer">Faturas 24x</button>
            <button (click)="scrollTo('matrix')" class="hover:text-white transition-colors cursor-pointer">Comparativo</button>
            <button (click)="scrollTo('calculator')" class="hover:text-white transition-colors cursor-pointer">Simulador</button>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2.5">
            <a
              routerLink="/login"
              class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Entrar
            </a>
            <a
              routerLink="/register"
              class="px-4 py-1.5 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Começar</span>
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

        </div>
      </nav>

      <!-- ========================================================================= -->
      <!-- 2. HERO SECTION: EDITORIAL HEADLINE + CLEAN AMBIENCE                     -->
      <!-- ========================================================================= -->
      <section class="relative z-10 pt-36 sm:pt-44 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        
        <!-- Refined Release Tag (No noisy ping dot) -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 mb-8 hover:border-neutral-700 transition-all cursor-pointer shadow-sm">
          <span class="text-neutral-400 font-mono text-[11px]">v2.4</span>
          <span class="text-neutral-600">/</span>
          <span class="font-medium text-neutral-300">Quarentena de Metas & Projeção 24x</span>
          <span class="text-neutral-500">→</span>
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-white max-w-4xl mx-auto leading-[1.05]">
          O sistema operacional das suas <span class="bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">finanças pessoais.</span>
        </h1>

        <!-- Subtitle -->
        <p class="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Quarentena matemática de liquidez para seus objetivos, projeção inteligente de faturas futuras de cartão e conciliação instantânea de extratos OFX sem duplicatas.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            routerLink="/register"
            class="w-full sm:w-auto px-7 py-3.5 btn-vercel-primary text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>Iniciar Gratuitamente</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          <button
            (click)="scrollTo('console')"
            class="w-full sm:w-auto px-6 py-3.5 btn-vercel-secondary text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span class="text-neutral-400 font-mono text-xs">⌘K</span>
            <span>Explorar Console Interativo</span>
          </button>
        </div>

        <!-- Social Proof Metrics Strip (Clean & Crisp) -->
        <div class="mt-14 pt-8 border-t border-neutral-900 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-left">
          <div>
            <div class="text-2xl font-bold text-white tracking-tight font-display">100%</div>
            <div class="text-xs text-neutral-400 mt-0.5">Isolamento de Metas</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white tracking-tight font-display">&lt; 180ms</div>
            <div class="text-xs text-neutral-400 mt-0.5">Leitura de Extratos OFX</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white tracking-tight font-display">24 Meses</div>
            <div class="text-xs text-neutral-400 mt-0.5">Cascata de Faturas</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white tracking-tight font-display">Zero Venda</div>
            <div class="text-xs text-neutral-400 mt-0.5">Privacidade Absoluta</div>
          </div>
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 3. LIVE INTERACTIVE TREASURY SOFTWARE CONSOLE (THE CLERK/VERCEL SHOWCASE) -->
      <!-- ========================================================================= -->
      <section id="console" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        
        <!-- Border-Beam Container -->
        <div class="border-beam-card p-0.5 shadow-2xl">
          <div class="vercel-panel rounded-[1.15rem] p-5 sm:p-8">
            
            <!-- Window Titlebar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800/80 gap-4">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#282828] border border-[#383838]"></div>
                  <div class="w-3 h-3 rounded-full bg-[#282828] border border-[#383838]"></div>
                  <div class="w-3 h-3 rounded-full bg-[#282828] border border-[#383838]"></div>
                </div>
                <div class="text-xs font-mono text-neutral-400 pl-2">
                  organizadorfinan.app / <span class="text-white">treasury-core</span>
                </div>
              </div>

              <!-- Interactive Tabs -->
              <div class="flex items-center p-1 rounded-xl bg-black/60 border border-neutral-800 text-xs font-medium">
                <button
                  (click)="activeTab.set('liquidity')"
                  [ngClass]="activeTab() === 'liquidity' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeTab() === 'liquidity' ? 'bg-emerald-400' : 'bg-transparent'"></span>
                  <span>Quarentena de Liquidez</span>
                </button>
                <button
                  (click)="activeTab.set('waterfall')"
                  [ngClass]="activeTab() === 'waterfall' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeTab() === 'waterfall' ? 'bg-cyan-400' : 'bg-transparent'"></span>
                  <span>Cascata de Faturas 24x</span>
                </button>
                <button
                  (click)="activeTab.set('ofx')"
                  [ngClass]="activeTab() === 'ofx' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeTab() === 'ofx' ? 'bg-indigo-400' : 'bg-transparent'"></span>
                  <span>Deduplicação OFX</span>
                </button>
              </div>
            </div>

            <!-- TAB 1: LIQUIDITY QUARANTINE SIMULATOR -->
            @if (activeTab() === 'liquidity') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <!-- Left Controls -->
                <div class="lg:col-span-6 space-y-5 text-left">
                  <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                    SISTEMA DE COFRES BLINDADOS
                  </div>

                  <h3 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Seu saldo diário livre <span class="text-emerald-400">livre de autoengano</span>
                  </h3>

                  <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Quando você guarda dinheiro para metas (casa própria, reserva ou viagens), o OrganizadorFinan deduz esse valor do seu saldo disponível, calculando exatamente quanto você pode gastar por dia.
                  </p>

                  <!-- Salary Slider -->
                  <div class="p-4 rounded-xl bg-black/50 border border-neutral-800/80 space-y-3">
                    <div class="flex justify-between text-xs font-mono">
                      <span class="text-neutral-400">Renda Mensal Líquida:</span>
                      <span class="text-white font-bold">{{ income() | currencyBrl }}</span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="35000"
                      step="500"
                      [value]="income()"
                      (input)="onIncomeChange($event)"
                      class="vercel-slider"
                    />
                    <div class="flex justify-between text-[10px] font-mono text-neutral-600">
                      <span>R$ 3.000,00</span>
                      <span>Arraste para calibrar</span>
                      <span>R$ 35.000,00</span>
                    </div>
                  </div>

                  <!-- Shield Toggle -->
                  <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-neutral-800">
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">🛡️</span>
                      <div class="text-xs">
                        <div class="font-bold text-white">Modo Quarentena Ativa</div>
                        <div class="text-[10px] text-neutral-400">Bloqueia fundos de reserva da conta corrente</div>
                      </div>
                    </div>

                    <button
                      (click)="toggleShield()"
                      [ngClass]="shieldActive() ? 'bg-emerald-500 text-black font-bold' : 'bg-neutral-800 text-neutral-400'"
                      class="px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
                    >
                      {{ shieldActive() ? 'ATIVADO' : 'DESATIVADO' }}
                    </button>
                  </div>
                </div>

                <!-- Right Live Card Preview -->
                <div class="lg:col-span-6 space-y-3">
                  
                  <!-- Main Result Box -->
                  <div 
                    class="p-6 rounded-2xl border transition-all duration-300"
                    [ngClass]="shieldActive() ? 'bg-neutral-950 border-neutral-800 shadow-[0_0_30px_rgba(0,229,153,0.08)]' : 'bg-neutral-950 border-rose-900/40'"
                  >
                    <div class="flex justify-between items-start pb-4 border-b border-neutral-800/80">
                      <div>
                        <div class="text-[11px] font-mono text-neutral-400 uppercase">
                          {{ shieldActive() ? 'Saldo Livre Seguro' : 'Saldo Ilusório na Conta' }}
                        </div>
                        <div class="text-3xl sm:text-4xl font-mono font-bold text-white mt-1">
                          {{ safeBalance() | currencyBrl }}
                        </div>
                      </div>

                      <div class="text-right">
                        <div class="text-[10px] font-mono text-neutral-500 uppercase">Teto Seguro/Dia:</div>
                        <div class="text-lg font-mono font-bold" [ngClass]="shieldActive() ? 'text-emerald-400' : 'text-rose-400'">
                          {{ (safeBalance() / 30) | currencyBrl }}<span class="text-xs text-neutral-500">/dia</span>
                        </div>
                      </div>
                    </div>

                    <!-- Quarantined Breakdown -->
                    <div class="grid grid-cols-2 gap-3 my-4 font-mono text-xs">
                      <div class="p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                        <div class="text-[10px] text-neutral-500 uppercase">Cofres Blindados</div>
                        <div class="text-sm font-bold text-amber-400 mt-0.5">
                          {{ (shieldActive() ? vaultAllocation() : 0) | currencyBrl }}
                        </div>
                      </div>
                      <div class="p-3 rounded-xl bg-black/60 border border-neutral-800/80">
                        <div class="text-[10px] text-neutral-500 uppercase">Despesas Fixas</div>
                        <div class="text-sm font-bold text-neutral-200 mt-0.5">
                          {{ fixedExpenses() | currencyBrl }}
                        </div>
                      </div>
                    </div>

                    <!-- Status Banner -->
                    <div class="pt-3 border-t border-neutral-800/80 text-[11px] flex items-center gap-2">
                      @if (shieldActive()) {
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span class="text-neutral-300">Reserva de emergência e entrada da casa 100% preservadas.</span>
                      } @else {
                        <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                        <span class="text-rose-300">Alerta: Você parece ter mais saldo do que tem na realidade.</span>
                      }
                    </div>
                  </div>

                </div>

              </div>
            }

            <!-- TAB 2: WATERFALL INVOICE TIMELINE -->
            @if (activeTab() === 'waterfall') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-5 space-y-4 text-left">
                  <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-400">
                    MOTOR DE PARCELAMENTO PREDITIVO
                  </div>
                  <h3 class="text-2xl font-bold tracking-tight text-white">
                    Elimine a surpresa da fatura do mês que vem
                  </h3>
                  <p class="text-xs text-neutral-400 leading-relaxed">
                    Comprou parcelado? O sistema mapeia o cruzamento exato entre a data de corte e o vencimento em cada cartão.
                  </p>

                  <div class="p-4 rounded-xl bg-black/50 border border-neutral-800/80 space-y-3">
                    <div class="flex justify-between text-xs font-mono">
                      <span class="text-neutral-400">Valor da Compra:</span>
                      <span class="text-white font-bold">{{ simPurchaseValue() | currencyBrl }}</span>
                    </div>
                    <input
                      type="range"
                      min="600"
                      max="12000"
                      step="300"
                      [value]="simPurchaseValue()"
                      (input)="onPurchaseValueChange($event)"
                      class="vercel-slider"
                    />

                    <div class="pt-2">
                      <div class="text-[11px] font-mono text-neutral-400 mb-1.5">Parcelar em:</div>
                      <div class="grid grid-cols-6 gap-1.5">
                        @for (n of [2, 3, 6, 10, 12, 24]; track n) {
                          <button
                            (click)="simInstallmentCount.set(n)"
                            [ngClass]="simInstallmentCount() === n ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'"
                            class="py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
                          >
                            {{ n }}x
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Waterfall Deck List -->
                <div class="lg:col-span-7 space-y-2">
                  <div class="flex justify-between items-center text-xs font-mono text-neutral-400 pb-2 border-b border-neutral-800">
                    <span>Cronograma de Faturas ({{ simInstallmentCount() }} Meses)</span>
                    <span class="text-white font-bold">{{ simInstallmentCount() }}x de {{ (simPurchaseValue() / simInstallmentCount()) | currencyBrl }}</span>
                  </div>

                  <div class="space-y-2 max-h-[280px] overflow-y-auto pr-1 font-mono text-xs">
                    @for (m of getMonthProjections(); track m.monthIndex) {
                      <div class="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="w-6 h-6 rounded-lg bg-neutral-900 text-neutral-300 flex items-center justify-center text-[10px] font-bold">
                            {{ m.monthIndex }}
                          </span>
                          <div>
                            <div class="text-neutral-200 font-bold">{{ m.monthName }}</div>
                            <div class="text-[10px] text-neutral-500">Parcela {{ m.monthIndex }}/{{ simInstallmentCount() }} • Fechamento Dia 25</div>
                          </div>
                        </div>
                        <div class="font-bold text-white">
                          {{ (simPurchaseValue() / simInstallmentCount()) | currencyBrl }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- TAB 3: OFX DEDUPLICATION TERMINAL -->
            @if (activeTab() === 'ofx') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-5 space-y-4 text-left">
                  <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-400">
                    TRAVA FITID ANTI-DUPLICATAS
                  </div>
                  <h3 class="text-2xl font-bold tracking-tight text-white">
                    Importe extratos bancários com precisão cirúrgica
                  </h3>
                  <p class="text-xs text-neutral-400 leading-relaxed">
                    Baixe seu extrato .OFX ou .CSV de qualquer banco brasileiro (Nubank, Itaú, Inter, Bradesco). O motor detecta lançamentos repetidos por hash e bloqueia duplicidades.
                  </p>

                  <div class="p-4 rounded-xl bg-black/60 border border-neutral-800 font-mono text-xs text-neutral-400 space-y-1.5">
                    <div>&gt; Leitura de arquivo OFX: <span class="text-emerald-400">180ms</span></div>
                    <div>&gt; Hash FITID verificado: <span class="text-emerald-400">SHA-256</span></div>
                    <div>&gt; Duplicatas rejeitadas: <span class="text-rose-400">1 detectada</span></div>
                  </div>
                </div>

                <!-- Terminal Table -->
                <div class="lg:col-span-7 p-4 rounded-xl bg-black border border-neutral-800 font-mono text-xs space-y-2">
                  <div class="flex justify-between text-neutral-500 text-[10px] pb-2 border-b border-neutral-800 uppercase">
                    <span>Transação</span>
                    <span>FITID</span>
                    <span>Valor</span>
                  </div>

                  @for (t of sampleTransactions; track t.fitid) {
                    <div 
                      class="p-2.5 rounded-lg border flex items-center justify-between"
                      [ngClass]="t.isDuplicate ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-neutral-950 border-neutral-900 text-neutral-200'"
                    >
                      <div>
                        <div class="font-bold flex items-center gap-2">
                          <span>{{ t.description }}</span>
                          @if (t.isDuplicate) {
                            <span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] border border-rose-500/40 font-bold">
                              DUPLICATA BLOQUEADA
                            </span>
                          }
                        </div>
                        <div class="text-[10px] text-neutral-500">{{ t.date }} • {{ t.category }}</div>
                      </div>

                      <div class="text-right">
                        <div class="font-bold" [ngClass]="t.amount > 0 ? 'text-emerald-400' : (t.isDuplicate ? 'text-rose-400 line-through' : 'text-white')">
                          {{ (t.amount > 0 ? '+' : '') }}{{ t.amount | currencyBrl }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

          </div>
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 4. BENTO GRID OF CORE ENGINEERING CAPABILITIES                           -->
      <!-- ========================================================================= -->
      <section id="features" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900 text-left">
        
        <div class="max-w-2xl mb-14">
          <span class="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">ARQUITETURA DE DADOS</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Construído para quem exige controle absoluto
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Bento 1 -->
          <div class="md:col-span-2 p-8 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div>
              <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6">
                🔒
              </div>
              <h3 class="text-xl font-bold text-white tracking-tight">Cofres com Quarentena Automática</h3>
              <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
                Dinheiro de metas não é dinheiro livre. Crie cofres para a entrada da casa própria, reserva de emergência e viagens com aportes recorrentes e blindagem contra impulsos de consumo.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-neutral-900 flex items-center gap-4 text-xs font-mono text-emerald-400">
              <span>✓ Proteção contra compras impulsivas</span>
              <span>✓ Histórico de aportes e rendimento</span>
            </div>
          </div>

          <!-- Bento 2 -->
          <div class="p-8 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div>
              <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6">
                ⚡
              </div>
              <h3 class="text-xl font-bold text-white tracking-tight">Conciliação OFX/CSV</h3>
              <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
                Importe faturas e extratos em segundos. O algoritmo deduplica cobranças repetidas e categoriza lançamentos automaticamente.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-neutral-900 text-xs font-mono text-neutral-500">
              Compatível com todos os bancos brasileiros
            </div>
          </div>

          <!-- Bento 3 -->
          <div class="p-8 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div>
              <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6">
                💳
              </div>
              <h3 class="text-xl font-bold text-white tracking-tight">Projeção em Cascata</h3>
              <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
                Visualização antecipada de faturas futuras parceladas em até 24x com data de corte de ciclo calculada automaticamente.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-neutral-900 text-xs font-mono text-neutral-500">
              Zero dívidas surpresa no cartão
            </div>
          </div>

          <!-- Bento 4 -->
          <div class="md:col-span-2 p-8 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-all">
            <div>
              <div class="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-6">
                👥
              </div>
              <h3 class="text-xl font-bold text-white tracking-tight">Planejamento Familiar & Contas Compartilhadas</h3>
              <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
                Organize despesas da casa em conjunto com seu parceiro(a) mantendo a total privacidade e autonomia sobre suas contas individuais.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-neutral-900 flex items-center gap-4 text-xs font-mono text-neutral-400">
              <span>✓ Visão consolidada da residência</span>
              <span>✓ Acesso individual privado</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 5. REALITY COMPARISON MATRIX (CLERK / VERCEL STYLE)                      -->
      <!-- ========================================================================= -->
      <section id="matrix" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900 text-left">
        
        <div class="max-w-2xl mb-12">
          <span class="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">MATRIZ COMPARATIVA</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Por que planilhas e apps de banco não funcionam
          </h2>
        </div>

        <div class="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="bg-black border-b border-neutral-800 text-neutral-500 uppercase text-[10px]">
                  <th class="p-4 sm:p-5">Critério</th>
                  <th class="p-4 sm:p-5 text-neutral-500">Planilhas Excel/Sheets</th>
                  <th class="p-4 sm:p-5 text-neutral-500">App do Banco Convencional</th>
                  <th class="p-4 sm:p-5 text-white font-bold bg-neutral-900/60">OrganizadorFinan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/80 text-neutral-300">
                <tr>
                  <td class="p-4 sm:p-5 font-bold text-white">Quarentena de Metas (Cofres Blindados)</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Quebra facilmente</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Mistura com saldo corrente</td>
                  <td class="p-4 sm:p-5 text-emerald-400 font-bold bg-neutral-900/40">✓ Quarentena matemática 100%</td>
                </tr>
                <tr>
                  <td class="p-4 sm:p-5 font-bold text-white">Cascata de Faturas Parceladas</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Complexidade extrema</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Mostra só fatura atual</td>
                  <td class="p-4 sm:p-5 text-emerald-400 font-bold bg-neutral-900/40">✓ Projeção até 24 meses</td>
                </tr>
                <tr>
                  <td class="p-4 sm:p-5 font-bold text-white">Deduplicação OFX sem Erros</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Digitação manual</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Preso ao banco dele</td>
                  <td class="p-4 sm:p-5 text-emerald-400 font-bold bg-neutral-900/40">✓ Hash FITID instantâneo</td>
                </tr>
                <tr>
                  <td class="p-4 sm:p-5 font-bold text-white">Privacidade & Soberania</td>
                  <td class="p-4 sm:p-5 text-neutral-400">✓ Privado</td>
                  <td class="p-4 sm:p-5 text-neutral-600">❌ Vende crédito e limite</td>
                  <td class="p-4 sm:p-5 text-emerald-400 font-bold bg-neutral-900/40">✓ Criptografado & Zero Venda</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 6. GOALS & COMPOUND RUNWAY CALCULATOR                                    -->
      <!-- ========================================================================= -->
      <section id="calculator" class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900 text-center">
        <div class="p-8 sm:p-12 rounded-3xl bg-neutral-950 border border-neutral-800/80 shadow-2xl">
          
          <span class="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold">SIMULADOR DE CONQUISTAS</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Em quantos meses você atinge sua meta?
          </h2>
          <p class="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
            Com aportes blindados e isolados do seu saldo livre diário, você alcança seus sonhos sem desvios.
          </p>

          <!-- Quick Presets -->
          <div class="flex flex-wrap items-center justify-center gap-2 my-8">
            @for (g of goalPresets; track g.id) {
              <button
                (click)="applyGoalPreset(g)"
                [ngClass]="activeGoalPreset().id === g.id ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'"
                class="px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{{ g.icon }}</span>
                <span>{{ g.name }}</span>
              </button>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left font-mono">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Alvo da Meta (R$)</label>
                <input
                  type="number"
                  [(ngModel)]="simGoalTarget"
                  class="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-base focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-neutral-400 uppercase mb-1.5">Aporte Mensal Reservado (R$)</label>
                <input
                  type="number"
                  [(ngModel)]="simGoalMonthly"
                  class="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-base focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-black border border-neutral-800 text-center space-y-2">
              <span class="text-[11px] uppercase font-bold text-neutral-500">Tempo de Conquista com Quarentena:</span>
              <div class="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {{ calculatedMonthsToGoal() }} <span class="text-base font-bold text-neutral-500">meses</span>
              </div>
              <p class="text-xs text-neutral-400 font-sans leading-relaxed pt-1">
                Guardando <strong>{{ simGoalMonthly | currencyBrl }}/mês</strong> de forma blindada, você atinge os <strong>{{ simGoalTarget | currencyBrl }}</strong> em aproximadamente <strong>{{ (calculatedMonthsToGoal() / 12).toFixed(1) }} anos</strong>.
              </p>
              <a
                routerLink="/register"
                class="inline-block mt-3 px-6 py-2.5 btn-vercel-primary text-xs font-bold"
              >
                Abrir Este Cofre Agora
              </a>
            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 7. HIGH-CONVERSION CTA FOOTER (VERCEL STYLE)                              -->
      <!-- ========================================================================= -->
      <section class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center border-t border-neutral-900">
        <div class="max-w-2xl mx-auto space-y-6">
          <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Assuma o controle total do seu dinheiro hoje.
          </h2>
          <p class="text-sm text-neutral-400">
            Comece em menos de 1 minuto. Sem cartão de crédito obrigatório.
          </p>

          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              routerLink="/register"
              class="w-full sm:w-auto px-8 py-4 btn-vercel-primary text-sm font-bold shadow-2xl"
            >
              Criar Conta Gratuita
            </a>
            <a
              routerLink="/login"
              class="w-full sm:w-auto px-8 py-4 btn-vercel-secondary text-sm font-medium"
            >
              Acessar Minha Conta
            </a>
          </div>
        </div>
      </section>

      <!-- Minimal Footer -->
      <footer class="relative z-10 border-t border-neutral-900 bg-black py-10 px-4 text-xs font-mono text-neutral-500">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-neutral-400">
            <span>▲</span>
            <span class="font-bold text-white">OrganizadorFinan</span>
            <span>—</span>
            <span>Finanças com Engenharia & Soberania</span>
          </div>

          <div>© 2026 OrganizadorFinan. Todos os direitos reservados.</div>

          <div class="flex items-center gap-4 text-neutral-400">
            <a routerLink="/login" class="hover:text-white transition-colors">Entrar</a>
            <a routerLink="/register" class="hover:text-white transition-colors">Cadastro</a>
          </div>
        </div>
      </footer>

    </div>
  `,
})
export class LandingComponent {
  // Tabs Signal
  activeTab = signal<'liquidity' | 'waterfall' | 'ofx'>('liquidity');

  // Hero Interactive Treasury Signals
  income = signal<number>(8500);
  shieldActive = signal<boolean>(true);

  // Computations for real-time treasury
  vaultAllocation = computed(() => {
    return Math.round(this.income() * 0.38);
  });

  fixedExpenses = computed(() => {
    return Math.round(this.income() * 0.42);
  });

  safeBalance = computed(() => {
    if (this.shieldActive()) {
      return this.income() - this.vaultAllocation() - this.fixedExpenses();
    } else {
      return this.income() - this.fixedExpenses();
    }
  });

  // Credit Card Waterfall Simulator Signals
  simPurchaseValue = signal<number>(3600);
  simInstallmentCount = signal<number>(6);

  // OFX Dedup Lab Sample Data
  sampleTransactions: SimulatedTransaction[] = [
    { date: '25/08', description: 'SUPERMERCADO CENTRAL', amount: -342.50, category: 'Alimentação', fitid: '20260825001' },
    { date: '25/08', description: 'SUPERMERCADO CENTRAL', amount: -342.50, category: 'Alimentação', fitid: '20260825001', isDuplicate: true },
    { date: '24/08', description: 'POSTO DE COMBUSTÍVEL IPIRANGA', amount: -210.00, category: 'Transporte', fitid: '20260824009' },
    { date: '22/08', description: 'FARMÁCIA SÃO PAULO', amount: -89.90, category: 'Saúde', fitid: '20260822014' },
    { date: '20/08', description: 'RENDIMENTO SALARIAL // TED', amount: 8500.00, category: 'Renda', fitid: '20260820088' },
  ];

  // Asset Goal Calculator Signals
  goalPresets = [
    { id: 'reserva', name: 'Reserva de Emergência', target: 30000, monthly: 1500, icon: '🛡️' },
    { id: 'casa', name: 'Entrada da Casa Própria', target: 120000, monthly: 2500, icon: '🏠' },
    { id: 'viagem', name: 'Viagem dos Sonhos', target: 18000, monthly: 1000, icon: '✈️' },
    { id: 'carro', name: 'Carro Novo', target: 60000, monthly: 2000, icon: '🚗' },
  ];

  activeGoalPreset = signal(this.goalPresets[0]);
  simGoalTarget = 30000;
  simGoalMonthly = 1500;

  calculatedMonthsToGoal = computed(() => {
    if (this.simGoalMonthly <= 0) return 0;
    return Math.ceil(this.simGoalTarget / this.simGoalMonthly);
  });

  // Event Handlers
  onIncomeChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.income.set(val);
  }

  toggleShield() {
    this.shieldActive.update((prev) => !prev);
  }

  onPurchaseValueChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.simPurchaseValue.set(val);
  }

  applyGoalPreset(g: typeof this.goalPresets[0]) {
    this.activeGoalPreset.set(g);
    this.simGoalTarget = g.target;
    this.simGoalMonthly = g.monthly;
  }

  getMonthProjections() {
    const months = [
      'Setembro 2026', 'Outubro 2026', 'Novembro 2026', 'Dezembro 2026',
      'Janeiro 2027', 'Fevereiro 2027', 'Março 2027', 'Abril 2027',
      'Maio 2027', 'Junho 2027', 'Julho 2027', 'Agosto 2027',
      'Setembro 2027', 'Outubro 2027', 'Novembro 2027', 'Dezembro 2027',
      'Janeiro 2028', 'Fevereiro 2028', 'Março 2028', 'Abril 2028',
      'Maio 2028', 'Junho 2028', 'Julho 2028', 'Agosto 2028'
    ];
    
    return Array.from({ length: this.simInstallmentCount() }, (_, i) => ({
      monthIndex: i + 1,
      monthName: months[i % months.length],
    }));
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onContainerMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  }
}
