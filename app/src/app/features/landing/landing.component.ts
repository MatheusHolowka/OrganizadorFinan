import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyBrlPipe],
  template: `
    <div class="min-h-screen bg-[#030712] text-white selection:bg-brand-500 selection:text-white relative overflow-hidden font-sans">
      <!-- Tech Grid & Background Glows -->
      <div class="absolute inset-0 tech-grid pointer-events-none z-0"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-500/20 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none z-0"></div>
      <div class="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-vault-DEFAULT/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div class="absolute top-[70%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <!-- Navigation Bar -->
      <header class="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030712]/75 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-300 flex items-center justify-center font-bold text-white shadow-neon-emerald">
              OF
            </div>
            <div class="flex flex-col">
              <span class="font-display font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                Finan<span class="text-brand-400">Organizador</span>
                <span class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">v2.0 PRO</span>
              </span>
            </div>
          </div>

          <nav class="hidden md:flex items-center gap-8 text-sm text-surface-300 font-medium">
            <a href="#features" class="hover:text-white transition-colors">Recursos</a>
            <a href="#simulator" class="hover:text-white transition-colors">Simulador de Metas</a>
            <a href="#vault-system" class="hover:text-white transition-colors">Sistema de Cofres</a>
            <a href="#cards" class="hover:text-white transition-colors">Inteligência de Cartões</a>
            <a href="#stack" class="hover:text-white transition-colors">Tecnologia</a>
          </nav>

          <div class="flex items-center gap-3">
            <a
              routerLink="/login"
              class="px-4 py-2 rounded-xl text-sm font-medium text-surface-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Entrar
            </a>
            <a
              routerLink="/register"
              class="px-5 py-2.5 rounded-xl btn-glow-emerald text-white text-sm font-bold shadow-neon-emerald flex items-center gap-2"
            >
              <span>Criar Conta</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative z-10 pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <!-- Floating Announcement Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-900/90 border border-brand-500/30 glow-pill mb-8 animate-slide-up">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span class="text-xs font-semibold text-surface-200">
            Nova Versão: <strong class="text-brand-400">Motor OFX Nativo & Blindagem de Cofres</strong>
          </span>
          <svg class="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white max-w-5xl mx-auto leading-[1.1] animate-slide-up">
          Controle financeiro inteligente com <span class="text-gradient-emerald">isolamento de patrimônio</span>
        </h1>

        <!-- Subtitle -->
        <p class="mt-6 text-base sm:text-xl text-surface-300 max-w-3xl mx-auto font-normal leading-relaxed animate-slide-up">
          O primeiro organizador pessoal com <strong>blindagem virtual de cofres</strong> para suas metas (ex: Polo TSI R$ 70.000), cálculo inteligente de corte e faturas de cartões e importação ultrarrápida de extratos .OFX e .CSV.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <a
            routerLink="/register"
            class="w-full sm:w-auto px-8 py-4 rounded-2xl btn-glow-emerald text-white font-bold text-base shadow-neon-emerald flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <span>Experimentar Gratuitamente</span>
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          <a
            href="#live-demo"
            class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-900/80 hover:bg-surface-800 text-surface-200 hover:text-white font-semibold text-base border border-surface-700/80 backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ver Demonstração Interativa</span>
          </a>
        </div>

        <!-- Social Proof Stats -->
        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-white/[0.08]">
          <div>
            <div class="text-3xl font-black text-white font-display">100%</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Dockerizado & Multi-repo</div>
          </div>
          <div>
            <div class="text-3xl font-black text-brand-400 font-display">0.02s</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Parse OFX & CSV</div>
          </div>
          <div>
            <div class="text-3xl font-black text-vault-DEFAULT font-display">Blindado</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Isolamento de Cofres</div>
          </div>
          <div>
            <div class="text-3xl font-black text-indigo-400 font-display">Até 24x</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Projeção de Faturas</div>
          </div>
        </div>
      </section>

      <!-- LIVE INTERACTIVE SHOWCASE (Hero Interactive Terminal / Dashboard Preview) -->
      <section id="live-demo" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div class="rounded-3xl p-1 bg-gradient-to-b from-brand-500/40 via-surface-800/40 to-transparent shadow-2xl shadow-brand-500/10">
          <div class="rounded-[22px] bg-surface-950/90 border border-surface-800 p-6 md:p-8 backdrop-blur-2xl">
            <!-- Terminal Header / Tab Controls -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-800/80 gap-4">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span class="ml-2 text-xs font-mono text-surface-400">organizador-finan-v2 // live-interactive-engine</span>
              </div>

              <!-- Interactive Tabs -->
              <div class="flex items-center gap-2 p-1 rounded-2xl bg-surface-900 border border-surface-800 text-xs">
                <button
                  (click)="activeTab.set('vault')"
                  [ngClass]="activeTab() === 'vault' ? 'bg-vault-DEFAULT/20 text-vault-DEFAULT border-vault-DEFAULT/40' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5"
                >
                  <span>🛡️</span>
                  <span>Isolamento do Polo TSI</span>
                </button>
                <button
                  (click)="activeTab.set('cards')"
                  [ngClass]="activeTab() === 'cards' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5"
                >
                  <span>💳</span>
                  <span>Projeção de Faturas</span>
                </button>
                <button
                  (click)="activeTab.set('ofx')"
                  [ngClass]="activeTab() === 'ofx' ? 'bg-brand-500/20 text-brand-400 border-brand-500/40' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Motor de Parse OFX</span>
                </button>
              </div>
            </div>

            <!-- Tab Content 1: Vault Isolation Simulator -->
            @if (activeTab() === 'vault') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div class="lg:col-span-6 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-vault-DEFAULT/10 text-vault-DEFAULT text-xs font-bold border border-vault-DEFAULT/20">
                    Regra de Negócio Exclusiva
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Seu dinheiro de metas fica <span class="text-vault-DEFAULT">blindado e isolado</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Ao definir uma meta (como reservar <strong>R$ 70.000 para a compra do Polo Comfortline 2019 200 TSI</strong>), o sistema desconta esse valor do cálculo do seu <strong>Saldo Livre Diário</strong>. Você nunca gastará por engano o dinheiro da sua meta!
                  </p>

                  <!-- Interactive Slider -->
                  <div class="pt-4 p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
                    <div class="flex justify-between text-xs">
                      <span class="text-surface-400 font-semibold uppercase">Simular Aporte no Polo TSI:</span>
                      <span class="text-vault-DEFAULT font-bold text-sm">{{ simulatedVaultAmount() | currencyBrl }}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70000"
                      step="2500"
                      [value]="simulatedVaultAmount()"
                      (input)="onVaultSliderChange($event)"
                      class="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div class="flex justify-between text-[11px] text-surface-400">
                      <span>R$ 0</span>
                      <span>Meta: R$ 70.000 (Polo TSI)</span>
                    </div>
                  </div>
                </div>

                <!-- Live Result Card -->
                <div class="lg:col-span-6 space-y-4">
                  <div class="p-6 rounded-3xl bg-surface-900/90 border border-surface-700/80 shadow-vault-glow relative overflow-hidden">
                    <div class="flex justify-between items-center pb-4 border-b border-surface-800">
                      <div>
                        <span class="text-[10px] uppercase font-bold text-surface-400">Cofre Ativo</span>
                        <div class="text-base font-bold text-white">Polo Comfortline 2019 200 TSI</div>
                      </div>
                      <span class="px-3 py-1 rounded-full bg-vault-DEFAULT/20 text-vault-DEFAULT border border-vault-DEFAULT/30 text-xs font-bold">
                        {{ ((simulatedVaultAmount() / 70000) * 100).toFixed(0) }}% Concluído
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4 my-4">
                      <div class="p-3.5 rounded-2xl bg-surface-950/80 border border-surface-800">
                        <span class="text-[10px] text-surface-400 uppercase font-bold">Saldo Bruto Total</span>
                        <div class="text-lg font-black text-white">R$ 85.000,00</div>
                      </div>
                      <div class="p-3.5 rounded-2xl bg-surface-950/80 border border-brand-500/40 shadow-neon-emerald">
                        <span class="text-[10px] text-brand-400 uppercase font-bold">Saldo Livre de Gastos</span>
                        <div class="text-lg font-black text-brand-400">
                          {{ (85000 - simulatedVaultAmount()) | currencyBrl }}
                        </div>
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-surface-950 h-3 rounded-full overflow-hidden p-0.5 border border-surface-800">
                      <div
                        class="h-full bg-gradient-to-r from-vault-DEFAULT to-indigo-400 rounded-full transition-all duration-300"
                        [style.width.%]="(simulatedVaultAmount() / 70000) * 100"
                      ></div>
                    </div>
                    <div class="flex justify-between text-[11px] text-surface-400 mt-2">
                      <span>Guardado: {{ simulatedVaultAmount() | currencyBrl }}</span>
                      <span>Falta: {{ (70000 - simulatedVaultAmount()) | currencyBrl }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Tab Content 2: Smart Credit Card Projections -->
            @if (activeTab() === 'cards') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div class="lg:col-span-6 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                    Algoritmo de Faturas Inteligentes
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Projeção de parcelas em <span class="text-indigo-400">meses futuros</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Comprou um item parcelado? O motor calcula a data de corte do seu cartão e distribui automaticamente as parcelas nas faturas corretas pelos próximos meses.
                  </p>

                  <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
                    <div class="flex justify-between text-xs">
                      <span class="text-surface-400 font-semibold uppercase">Valor da Compra:</span>
                      <span class="text-white font-bold">R$ 3.600,00</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-surface-400">Parcelar em:</span>
                      @for (n of [3, 6, 10, 12]; track n) {
                        <button
                          (click)="simulatedInstallments.set(n)"
                          [ngClass]="simulatedInstallments() === n ? 'bg-indigo-500 text-white font-bold' : 'bg-surface-800 text-surface-300'"
                          class="px-3 py-1 rounded-lg text-xs transition-colors"
                        >
                          {{ n }}x
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <div class="lg:col-span-6 space-y-3">
                  <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800">
                    <span class="text-[10px] text-surface-400 uppercase font-bold">Timeline de Faturas Futuras Geradas:</span>
                    <div class="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                      @for (i of getInstallmentList(); track i) {
                        <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800/80 text-xs">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                            <span class="font-semibold text-surface-200">Fatura Mês {{ i }}</span>
                            <span class="text-surface-500">Parcela {{ i }}/{{ simulatedInstallments() }}</span>
                          </div>
                          <span class="font-bold text-white">
                            {{ (3600 / simulatedInstallments()) | currencyBrl }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Tab Content 3: OFX Parser Engine -->
            @if (activeTab() === 'ofx') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div class="lg:col-span-6 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20">
                    Motor Nativamente Integrado
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Extração direta de extratos <span class="text-brand-400">.OFX e .CSV</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Baixe o extrato de qualquer banco (Nubank, Itaú, Bradesco, Inter) e importe instantaneamente com validação anti-duplicidade via hash SHA-256 e IDs únicos FITID.
                  </p>

                  <div class="p-3.5 rounded-xl bg-surface-900 border border-surface-800 text-xs font-mono text-emerald-400/90 space-y-1">
                    <div>&gt; OFX Parser Engine v2.0 initialized</div>
                    <div>&gt; Reading &lt;STMTTRN&gt; blocks... OK</div>
                    <div>&gt; FITID Anti-duplicate Check: 0 conflicts found</div>
                    <div>&gt; Automatic Reconciliation: 100% Ready</div>
                  </div>
                </div>

                <div class="lg:col-span-6">
                  <div class="p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-2 font-mono text-xs">
                    <div class="flex items-center justify-between text-surface-400 pb-2 border-b border-surface-800 text-[10px] uppercase">
                      <span>Data</span>
                      <span>Extrato Original</span>
                      <span>Valor</span>
                    </div>
                    <div class="flex items-center justify-between text-surface-200 py-1">
                      <span>25/08/2026</span>
                      <span>POSTO SHELL COMBUSTIVEL</span>
                      <span class="text-rose-400 font-bold">-R$ 250,00</span>
                    </div>
                    <div class="flex items-center justify-between text-surface-200 py-1">
                      <span>24/08/2026</span>
                      <span>SUPERMERCADOS PAO DE ACUCAR</span>
                      <span class="text-rose-400 font-bold">-R$ 489,30</span>
                    </div>
                    <div class="flex items-center justify-between text-surface-200 py-1">
                      <span>20/08/2026</span>
                      <span>SALARIO MENSAL TED</span>
                      <span class="text-emerald-400 font-bold">+R$ 9.850,00</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- BENTO GRID FEATURES -->
      <section id="features" class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Arquitetura de Alta Performance</h2>
          <h3 class="text-3xl sm:text-4xl font-extrabold text-white font-display">Tudo o que você precisa para dominar suas finanças</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Bento 1: Cofres -->
          <div class="md:col-span-2 glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-vault-DEFAULT/20 text-vault-DEFAULT flex items-center justify-center mb-6 shadow-vault-glow">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-white font-display">Sistema de Cofres & Metas Blindadas</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Isole virtualmente fundos para objetivos de médio e longo prazo (como juntar R$ 70.000 para comprar um carro à vista). O montante guardado é protegido e não conta como saldo disponível no seu dia a dia.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-vault-DEFAULT font-semibold">
              <span>✓ Proteção contra impulsos de consumo</span>
              <span>✓ Histórico de aportes e resgates</span>
            </div>
          </div>

          <!-- Bento 2: Cartões -->
          <div class="glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 shadow-neon-indigo">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-white font-display">Inteligência de Cartões</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Cálculo automático do melhor dia de compra, fechamento e vencimento de faturas, com projeção em cascata de parcelas futuras.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 text-xs text-indigo-400 font-semibold">
              ✓ Suporte a compras parceladas em até 24x
            </div>
          </div>

          <!-- Bento 3: Motor OFX/CSV -->
          <div class="glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-6 shadow-neon-emerald">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-white font-display">Motor OFX & CSV Ultrarrápido</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Importe seus extratos em milissegundos com detecção inteligente de duplicidades por checksum SHA-256 e categorização automática.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 text-xs text-brand-400 font-semibold">
              ✓ Compatível com todos os bancos brasileiros
            </div>
          </div>

          <!-- Bento 4: Arquitetura Dockerizada -->
          <div class="md:col-span-2 glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-white font-display">Stack Moderna & 100% Dockerizada</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Construído em arquitetura Multi-Repo estrita com <strong>NestJS 11</strong>, <strong>Angular 21 SSR</strong>, <strong>Prisma ORM</strong> e <strong>MySQL 8.4</strong>. Totalmente conteinerizado e pronto para produção.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-blue-400 font-semibold">
              <span>✓ Tipagem ponta a ponta</span>
              <span>✓ Reatividade com Angular Signals</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SIMULADOR DE METAS (FINANCIAL GOAL CALCULATOR) -->
      <section id="simulator" class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
        <div class="p-8 sm:p-12 rounded-3xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-2xl shadow-glass-dark">
          <div class="text-center max-w-2xl mx-auto mb-10">
            <span class="text-xs font-bold uppercase tracking-widest text-brand-400">Simulador Interativo de Liberdade Financeira</span>
            <h3 class="text-3xl font-bold text-white font-display mt-1">Quanto tempo para conquistar sua meta?</h3>
            <p class="text-xs sm:text-sm text-surface-400 mt-2">
              Veja em quantos meses você alcança a compra do seu carro ou reserva financeira isolando uma parcela dos seus rendimentos.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Valor Alvo da Meta (R$)</label>
                <input
                  type="number"
                  [(ngModel)]="simTarget"
                  class="w-full px-4 py-3 rounded-2xl bg-surface-950 border border-surface-700 text-white font-bold text-base focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Aporte Mensal Reservado (R$)</label>
                <input
                  type="number"
                  [(ngModel)]="simMonthly"
                  class="w-full px-4 py-3 rounded-2xl bg-surface-950 border border-surface-700 text-white font-bold text-base focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-surface-950 border border-surface-800 text-center space-y-3">
              <span class="text-xs uppercase font-bold text-surface-400">Tempo Estimado para Conquista</span>
              <div class="text-4xl sm:text-5xl font-black text-brand-400 font-display">
                {{ calculatedMonths() }} <span class="text-lg font-bold text-surface-300">meses</span>
              </div>
              <p class="text-xs text-surface-400 leading-relaxed">
                Guardando <strong>{{ simMonthly | currencyBrl }}/mês</strong> de forma blindada, você atinge os <strong>{{ simTarget | currencyBrl }}</strong> em aproximadamente <strong>{{ (calculatedMonths() / 12).toFixed(1) }} anos</strong> sem tocar nos seus gastos essenciais.
              </p>
              <a
                routerLink="/register"
                class="inline-block mt-2 px-6 py-2.5 rounded-xl btn-glow-emerald text-white text-xs font-bold shadow-neon-emerald"
              >
                Criar Este Cofre Agora
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- TECH STACK SECTION -->
      <section id="stack" class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/[0.08] text-center">
        <span class="text-xs font-bold uppercase tracking-widest text-surface-400">Engenharia de Software de Classe Mundial</span>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-80">
          <span class="text-sm font-bold text-surface-300 tracking-wider">⚡ NESTJS 11</span>
          <span class="text-sm font-bold text-surface-300 tracking-wider">🅰️ ANGULAR 21 SSR</span>
          <span class="text-sm font-bold text-surface-300 tracking-wider">💎 PRISMA ORM</span>
          <span class="text-sm font-bold text-surface-300 tracking-wider">🐬 MYSQL 8.4 LTS</span>
          <span class="text-sm font-bold text-surface-300 tracking-wider">🎨 TAILWIND CSS</span>
          <span class="text-sm font-bold text-surface-300 tracking-wider">🐳 100% DOCKER</span>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div class="p-10 sm:p-16 rounded-3xl bg-gradient-to-tr from-brand-600/20 via-surface-900 to-vault-DEFAULT/20 border border-brand-500/30 backdrop-blur-2xl shadow-glass-dark">
          <h2 class="text-3xl sm:text-5xl font-black text-white font-display">Pronto para blindar seu futuro financeiro?</h2>
          <p class="mt-4 text-surface-300 text-sm sm:text-base max-w-2xl mx-auto">
            Junte-se à nova geração de organização financeira inteligente. Sem planilhas confusas, sem monorepos engessados.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              routerLink="/register"
              class="w-full sm:w-auto px-8 py-4 rounded-2xl btn-glow-emerald text-white font-bold text-base shadow-neon-emerald"
            >
              Criar Minha Conta Gratuita
            </a>
            <a
              routerLink="/login"
              class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface-900 hover:bg-surface-800 text-surface-200 font-semibold text-base border border-surface-700"
            >
              Acessar Sistema
            </a>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="relative z-10 border-t border-white/[0.08] bg-surface-950 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-surface-500">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-xs">OF</div>
            <span class="text-surface-300 font-bold">FinanOrganizador v2.0</span>
          </div>
          <div>© 2026 Organizador Financeiro Pessoal. Todos os direitos reservados.</div>
          <div class="flex items-center gap-4 text-surface-400">
            <a routerLink="/login" class="hover:text-white transition-colors">Entrar</a>
            <a routerLink="/register" class="hover:text-white transition-colors">Cadastro</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  activeTab = signal<'vault' | 'cards' | 'ofx'>('vault');
  simulatedVaultAmount = signal<number>(25000);
  simulatedInstallments = signal<number>(6);

  simTarget: number = 70000;
  simMonthly: number = 2500;

  calculatedMonths = computed(() => {
    if (this.simMonthly <= 0) return 0;
    return Math.ceil(this.simTarget / this.simMonthly);
  });

  onVaultSliderChange(event: any) {
    this.simulatedVaultAmount.set(Number(event.target.value));
  }

  getInstallmentList(): number[] {
    const list: number[] = [];
    for (let i = 1; i <= this.simulatedInstallments(); i++) {
      list.push(i);
    }
    return list;
  }
}
