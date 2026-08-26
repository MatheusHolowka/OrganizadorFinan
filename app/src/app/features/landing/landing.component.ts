import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

interface GoalPreset {
  id: string;
  name: string;
  target: number;
  icon: string;
  defaultSaved: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyBrlPipe],
  template: `
    <div class="min-h-screen bg-[#030712] text-white selection:bg-brand-500 selection:text-white relative overflow-hidden font-sans">
      <!-- Background Tech Grids & Glow Accents -->
      <div class="absolute inset-0 tech-grid pointer-events-none z-0"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-brand-500/20 via-emerald-500/10 to-transparent blur-[140px] pointer-events-none z-0"></div>
      <div class="absolute top-[35%] right-[-10%] w-[650px] h-[650px] bg-purple-500/10 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div class="absolute top-[65%] left-[-10%] w-[550px] h-[550px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <!-- Navigation Bar -->
      <header class="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030712]/80 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-300 flex items-center justify-center font-black text-white shadow-neon-emerald">
              OF
            </div>
            <div class="flex flex-col">
              <span class="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Organizador<span class="text-brand-400">Finan</span>
              </span>
            </div>
          </div>

          <nav class="hidden md:flex items-center gap-8 text-sm text-surface-300 font-medium">
            <a href="#features" class="hover:text-white transition-colors">Recursos</a>
            <a href="#live-demo" class="hover:text-white transition-colors">Demonstração</a>
            <a href="#simulator" class="hover:text-white transition-colors">Simulador de Metas</a>
            <a href="#security" class="hover:text-white transition-colors">Segurança & Privacidade</a>
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
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-900/90 border border-brand-500/30 glow-pill mb-8 animate-slide-up">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span class="text-xs font-semibold text-surface-200">
            Nova Experiência: <strong class="text-brand-400">Blindagem de Metas & Inteligência de Faturas</strong>
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
          O primeiro organizador financeiro pessoal com <strong>cofres blindados</strong> para suas metas (casa própria, reserva de emergência e viagens), cálculo inteligente de faturas de cartão e conciliação instantânea de extratos bancários.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <a
            routerLink="/register"
            class="w-full sm:w-auto px-8 py-4 rounded-2xl btn-glow-emerald text-white font-bold text-base shadow-neon-emerald flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <span>Começar Gratuitamente</span>
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

        <!-- Social Proof Stats (User-Centric) -->
        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-white/[0.08]">
          <div class="p-3 rounded-2xl bg-surface-900/30 border border-white/[0.04]">
            <div class="text-3xl font-black text-white font-display">100%</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Blindagem de Metas</div>
          </div>
          <div class="p-3 rounded-2xl bg-surface-900/30 border border-white/[0.04]">
            <div class="text-3xl font-black text-brand-400 font-display">&lt; 1s</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Leitura de Extratos</div>
          </div>
          <div class="p-3 rounded-2xl bg-surface-900/30 border border-white/[0.04]">
            <div class="text-3xl font-black text-purple-400 font-display">Zero</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Planilhas Manuais</div>
          </div>
          <div class="p-3 rounded-2xl bg-surface-900/30 border border-white/[0.04]">
            <div class="text-3xl font-black text-indigo-400 font-display">Até 24x</div>
            <div class="text-xs text-surface-400 mt-1 uppercase font-semibold">Previsão de Faturas</div>
          </div>
        </div>
      </section>

      <!-- LIVE INTERACTIVE SHOWCASE (Hero Interactive Terminal / Dashboard Preview) -->
      <section id="live-demo" class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div class="rounded-3xl p-1 bg-gradient-to-b from-brand-500/30 via-surface-800/40 to-transparent shadow-2xl shadow-brand-500/10">
          <div class="rounded-[22px] bg-surface-950/95 border border-surface-800 p-6 md:p-8 backdrop-blur-2xl">
            <!-- Terminal Header / Tab Controls -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-surface-800/80 gap-4">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span class="ml-2 text-xs font-mono text-surface-400">organizadorfinan // live-preview</span>
              </div>

              <!-- Interactive Tabs -->
              <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface-900 border border-surface-800 text-xs">
                <button
                  (click)="activeTab.set('vault')"
                  [ngClass]="activeTab() === 'vault' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🛡️</span>
                  <span>Cofres & Metas</span>
                </button>
                <button
                  (click)="activeTab.set('cards')"
                  [ngClass]="activeTab() === 'cards' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5 cursor-pointer"
                >
                  <span>💳</span>
                  <span>Projeção de Cartões</span>
                </button>
                <button
                  (click)="activeTab.set('ofx')"
                  [ngClass]="activeTab() === 'ofx' ? 'bg-brand-500/20 text-brand-400 border-brand-500/40 shadow-sm' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>Extratos & Conciliação</span>
                </button>
                <button
                  (click)="activeTab.set('family')"
                  [ngClass]="activeTab() === 'family' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'text-surface-400 hover:text-white'"
                  class="px-3.5 py-1.5 rounded-xl font-bold transition-all border border-transparent flex items-center gap-1.5 cursor-pointer"
                >
                  <span>👥</span>
                  <span>Gestão Familiar</span>
                </button>
              </div>
            </div>

            <!-- Tab Content 1: Vault Isolation Simulator -->
            @if (activeTab() === 'vault') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div class="lg:col-span-6 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">
                    Blindagem Patrimonial
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Seu dinheiro de metas fica <span class="text-purple-400">100% blindado</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Ao guardar dinheiro para uma meta (ex: <strong>{{ selectedGoal().name }}</strong>), o sistema desconta esse valor do cálculo do seu <strong>Saldo Livre Diário</strong>. Você nunca gasta sua reserva por engano!
                  </p>

                  <!-- Goal Presets Selector -->
                  <div class="space-y-2">
                    <span class="text-xs text-surface-400 font-semibold uppercase">Escolha um objetivo de exemplo:</span>
                    <div class="grid grid-cols-2 gap-2">
                      @for (g of goalPresets; track g.id) {
                        <button
                          (click)="selectGoal(g)"
                          [ngClass]="selectedGoal().id === g.id ? 'bg-purple-500/20 border-purple-500/50 text-white font-bold' : 'bg-surface-900 border-surface-800 text-surface-300 hover:text-white'"
                          class="p-2.5 rounded-xl border text-xs text-left transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span class="text-base">{{ g.icon }}</span>
                          <div class="truncate">
                            <div class="truncate font-semibold">{{ g.name }}</div>
                            <div class="text-[10px] text-surface-400">{{ g.target | currencyBrl }}</div>
                          </div>
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Interactive Slider -->
                  <div class="pt-2 p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
                    <div class="flex justify-between text-xs">
                      <span class="text-surface-400 font-semibold uppercase">Simular Guardado no Cofre:</span>
                      <span class="text-purple-400 font-bold text-sm">{{ simulatedVaultAmount() | currencyBrl }}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      [max]="selectedGoal().target"
                      [step]="selectedGoal().target / 20"
                      [value]="simulatedVaultAmount()"
                      (input)="onVaultSliderChange($event)"
                      class="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div class="flex justify-between text-[11px] text-surface-400">
                      <span>R$ 0</span>
                      <span>Alvo: {{ selectedGoal().target | currencyBrl }}</span>
                    </div>
                  </div>
                </div>

                <!-- Live Result Card -->
                <div class="lg:col-span-6 space-y-4">
                  <div class="p-6 rounded-3xl bg-surface-900/90 border border-purple-500/20 shadow-xl shadow-purple-500/5 relative overflow-hidden">
                    <div class="flex justify-between items-center pb-4 border-b border-surface-800">
                      <div class="flex items-center gap-2.5">
                        <span class="text-2xl">{{ selectedGoal().icon }}</span>
                        <div>
                          <span class="text-[10px] uppercase font-bold text-surface-400">Cofre Ativo</span>
                          <div class="text-base font-bold text-white">{{ selectedGoal().name }}</div>
                        </div>
                      </div>
                      <span class="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                        {{ ((simulatedVaultAmount() / selectedGoal().target) * 100).toFixed(0) }}% Concluído
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4 my-4">
                      <div class="p-3.5 rounded-2xl bg-surface-950/80 border border-surface-800">
                        <span class="text-[10px] text-surface-400 uppercase font-bold">Saldo Bruto em Conta</span>
                        <div class="text-lg font-black text-white">R$ 50.000,00</div>
                      </div>
                      <div class="p-3.5 rounded-2xl bg-surface-950/80 border border-brand-500/40 shadow-neon-emerald">
                        <span class="text-[10px] text-brand-400 uppercase font-bold">Saldo Livre Real</span>
                        <div class="text-lg font-black text-brand-400">
                          {{ (50000 - simulatedVaultAmount() > 0 ? 50000 - simulatedVaultAmount() : 0) | currencyBrl }}
                        </div>
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-surface-950 h-3 rounded-full overflow-hidden p-0.5 border border-surface-800">
                      <div
                        class="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                        [style.width.%]="(simulatedVaultAmount() / selectedGoal().target) * 100"
                      ></div>
                    </div>
                    <div class="flex justify-between text-[11px] text-surface-400 mt-2">
                      <span>Guardado: {{ simulatedVaultAmount() | currencyBrl }}</span>
                      <span>Falta: {{ (selectedGoal().target - simulatedVaultAmount() > 0 ? selectedGoal().target - simulatedVaultAmount() : 0) | currencyBrl }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Tab Content 2: Smart Credit Card Projections -->
            @if (activeTab() === 'cards') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div class="lg:col-span-6 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/20">
                    Cálculo Inteligente de Ciclo
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Projeção de parcelas em <span class="text-indigo-400">faturas futuras</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Comprou um item parcelado? O sistema projeta a melhor data de compra, data de corte e calcula o impacto exato nas suas faturas pelos próximos meses.
                  </p>

                  <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
                    <div class="flex justify-between text-xs">
                      <span class="text-surface-400 font-semibold uppercase">Valor da Compra:</span>
                      <span class="text-white font-bold">R$ 3.600,00</span>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs text-surface-400">Parcelar em:</span>
                      @for (n of [1, 3, 6, 10, 12, 24]; track n) {
                        <button
                          (click)="simulatedInstallments.set(n)"
                          [ngClass]="simulatedInstallments() === n ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30' : 'bg-surface-800 text-surface-300 hover:text-white'"
                          class="px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {{ n }}x
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <div class="lg:col-span-6 space-y-3">
                  <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800">
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-[10px] text-surface-400 uppercase font-bold">Linha do Tempo de Faturas Futuras:</span>
                      <span class="text-xs font-bold text-indigo-400">
                        {{ simulatedInstallments() }}x de {{ (3600 / simulatedInstallments()) | currencyBrl }}
                      </span>
                    </div>
                    <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                      @for (i of getInstallmentList(); track i) {
                        <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800/80 text-xs">
                          <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" [ngClass]="i === 1 ? 'bg-emerald-400' : 'bg-indigo-400'"></span>
                            <span class="font-semibold text-surface-200">Fatura Mês {{ i }}</span>
                            <span class="text-[10px] text-surface-500">Parcela {{ i }}/{{ simulatedInstallments() }}</span>
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
                    Importação Inteligente
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Conciliação com <span class="text-brand-400">bloqueio de duplicatas</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Importe extratos bancários (.OFX e .CSV) de qualquer banco com detecção automática de lançamentos repetidos e categorização instantânea.
                  </p>

                  <div class="p-3.5 rounded-xl bg-surface-900 border border-surface-800 text-xs font-mono text-emerald-400/90 space-y-1">
                    <div>&gt; Extrato bancário processado com sucesso</div>
                    <div>&gt; 28 lançamentos importados</div>
                    <div>&gt; 0 duplicatas confirmadas via FITID</div>
                    <div>&gt; Categorização automática: 100%</div>
                  </div>
                </div>

                <div class="lg:col-span-6">
                  <div class="p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-2 font-mono text-xs">
                    <div class="flex items-center justify-between text-surface-400 pb-2 border-b border-surface-800 text-[10px] uppercase">
                      <span>Data</span>
                      <span>Lançamento</span>
                      <span>Valor</span>
                    </div>
                    <div class="flex items-center justify-between text-surface-200 py-1">
                      <span>25/08</span>
                      <span>SUPERMERCADO CENTRAL</span>
                      <span class="text-rose-400 font-bold">-R$ 342,00</span>
                    </div>
                    <div class="flex items-center justify-between text-surface-200 py-1">
                      <span>24/08</span>
                      <span>POSTO DE COMBUSTÍVEL</span>
                      <span class="text-rose-400 font-bold">-R$ 210,00</span>
                    </div>
                    <div class="flex items-center justify-between text-surface-200 py-1">
                      <span>20/08</span>
                      <span>RENDIMENTO SALARIAL</span>
                      <span class="text-emerald-400 font-bold">+R$ 6.500,00</span>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Tab Content 4: Family Budget Mode -->
            @if (activeTab() === 'family') {
              <div class="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div class="lg:col-span-6 space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
                    Modo Família Compartilhado
                  </div>
                  <h3 class="text-2xl font-bold text-white font-display">
                    Organize as contas da casa em <span class="text-emerald-400">conjunto</span>
                  </h3>
                  <p class="text-sm text-surface-300 leading-relaxed">
                    Convide membros da sua família, defina orçamentos compartilhados para o lar e mantenha a privacidade das contas pessoais quando necessário.
                  </p>

                  <div class="flex items-center gap-3">
                    <button
                      (click)="familyMode.set('family')"
                      [ngClass]="familyMode() === 'family' ? 'bg-emerald-500/20 border-emerald-500/50 text-white font-bold' : 'bg-surface-900 border-surface-800 text-surface-400'"
                      class="px-4 py-2 rounded-xl border text-xs cursor-pointer transition-all"
                    >
                      🏠 Visão Familiar (Consolidada)
                    </button>
                    <button
                      (click)="familyMode.set('personal')"
                      [ngClass]="familyMode() === 'personal' ? 'bg-emerald-500/20 border-emerald-500/50 text-white font-bold' : 'bg-surface-900 border-surface-800 text-surface-400'"
                      class="px-4 py-2 rounded-xl border text-xs cursor-pointer transition-all"
                    >
                      👤 Visão Individual
                    </button>
                  </div>
                </div>

                <div class="lg:col-span-6 space-y-3">
                  <div class="p-5 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
                    <div class="flex justify-between items-center pb-2 border-b border-surface-800">
                      <span class="text-xs font-bold text-white">
                        {{ familyMode() === 'family' ? 'Orçamento Consolidado da Casa' : 'Minhas Contas Individuais' }}
                      </span>
                      <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {{ familyMode() === 'family' ? '3 Membros Ativos' : 'Acesso Privado' }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800">
                        <span class="text-[10px] text-surface-400 uppercase font-bold">Entradas Totais</span>
                        <div class="text-base font-bold text-emerald-400">
                          {{ familyMode() === 'family' ? 'R$ 14.800,00' : 'R$ 7.200,00' }}
                        </div>
                      </div>
                      <div class="p-3 rounded-xl bg-surface-950 border border-surface-800">
                        <span class="text-[10px] text-surface-400 uppercase font-bold">Despesas da Casa</span>
                        <div class="text-base font-bold text-rose-400">
                          {{ familyMode() === 'family' ? 'R$ 6.950,00' : 'R$ 3.100,00' }}
                        </div>
                      </div>
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
          <h2 class="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Simplicidade & Controle Absoluto</h2>
          <h3 class="text-3xl sm:text-4xl font-extrabold text-white font-display">Tudo o que você precisa para dominar suas finanças</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Bento 1: Cofres -->
          <div class="md:col-span-2 glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-6 shadow-sm">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-white font-display">Sistema de Cofres & Metas Blindadas</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Isole fundos para objetivos importantes (casa própria, reserva de emergência, viagens ou carro novo). O dinheiro guardado nos cofres não entra no cálculo de saldo livre, impedindo gastos por impulso.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-purple-300 font-semibold">
              <span>✓ Proteção contra compras impulsivas</span>
              <span>✓ Histórico de aportes e resgates</span>
            </div>
          </div>

          <!-- Bento 2: Cartões -->
          <div class="glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
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
              <h4 class="text-xl font-bold text-white font-display">Importação Ultrarrápida</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Importe seus extratos em segundos com detecção inteligente de duplicidades por checksum SHA-256 e categorização automática.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 text-xs text-brand-400 font-semibold">
              ✓ Compatível com todos os bancos brasileiros
            </div>
          </div>

          <!-- Bento 4: Gestão Familiar -->
          <div class="md:col-span-2 glass-card-pro p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-white font-display">Planejamento Familiar & Contas Conjuntas</h4>
              <p class="text-sm text-surface-300 mt-2 leading-relaxed">
                Compartilhe o planejamento financeiro com seu parceiro(a) ou família. Visualize gastos consolidados da casa mantendo a clareza e autonomia individual.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-emerald-400 font-semibold">
              <span>✓ Múltiplos membros na mesma conta</span>
              <span>✓ Relatórios consolidados mensais</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SIMULADOR DE METAS (FINANCIAL GOAL CALCULATOR) -->
      <section id="simulator" class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
        <div class="p-8 sm:p-12 rounded-3xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-2xl shadow-glass-dark">
          <div class="text-center max-w-2xl mx-auto mb-10">
            <span class="text-xs font-bold uppercase tracking-widest text-brand-400">Simulador de Metas & Sonhos</span>
            <h3 class="text-3xl font-bold text-white font-display mt-1">Em quanto tempo você conquista sua meta?</h3>
            <p class="text-xs sm:text-sm text-surface-400 mt-2">
              Descubra em quantos meses você alcança a entrada da casa própria ou sua reserva financeira guardando um valor mensal no cofre.
            </p>
          </div>

          <!-- Quick presets buttons -->
          <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              (click)="setCalculatorGoal('Reserva de Emergência', 30000, 1500)"
              class="px-3.5 py-1.5 rounded-full bg-surface-800 hover:bg-surface-700 text-xs text-surface-200 border border-surface-700 transition-colors cursor-pointer"
            >
              🛡️ Reserva (R$ 30.000)
            </button>
            <button
              (click)="setCalculatorGoal('Viagem dos Sonhos', 18000, 1000)"
              class="px-3.5 py-1.5 rounded-full bg-surface-800 hover:bg-surface-700 text-xs text-surface-200 border border-surface-700 transition-colors cursor-pointer"
            >
              ✈️ Viagem (R$ 18.000)
            </button>
            <button
              (click)="setCalculatorGoal('Carro Novo', 65000, 2500)"
              class="px-3.5 py-1.5 rounded-full bg-surface-800 hover:bg-surface-700 text-xs text-surface-200 border border-surface-700 transition-colors cursor-pointer"
            >
              🚗 Carro (R$ 65.000)
            </button>
            <button
              (click)="setCalculatorGoal('Casa Própria', 120000, 3000)"
              class="px-3.5 py-1.5 rounded-full bg-surface-800 hover:bg-surface-700 text-xs text-surface-200 border border-surface-700 transition-colors cursor-pointer"
            >
              🏠 Casa Própria (R$ 120.000)
            </button>
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
                Guardando <strong>{{ simMonthly | currencyBrl }}/mês</strong> de forma blindada, você atinge os <strong>{{ simTarget | currencyBrl }}</strong> em aproximadamente <strong>{{ (calculatedMonths() / 12).toFixed(1) }} anos</strong> sem comprometer seus gastos essenciais.
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

      <!-- SECURITY & PRIVACY SECTION -->
      <section id="security" class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/[0.08]">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Privacidade & Segurança</h2>
          <h3 class="text-3xl font-extrabold text-white font-display">Seus dados financeiros sob sua guarda</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div class="text-2xl mb-3">🔒</div>
            <h4 class="text-base font-bold text-white mb-1">Criptografia de Ponta</h4>
            <p class="text-xs text-surface-400 leading-relaxed">
              Senhas criptografadas com bcrypt e sessões seguras com tokens JWT e cabeçalhos HTTPS estritos.
            </p>
          </div>
          <div class="p-6 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div class="text-2xl mb-3">🛡️</div>
            <h4 class="text-base font-bold text-white mb-1">Privacidade Absoluta</h4>
            <p class="text-xs text-surface-400 leading-relaxed">
              Seus dados nunca são comercializados para terceiros. O controle do seu extrato e saldo pertence apenas a você.
            </p>
          </div>
          <div class="p-6 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div class="text-2xl mb-3">⚡</div>
            <h4 class="text-base font-bold text-white mb-1">Sincronização em Tempo Real</h4>
            <p class="text-xs text-surface-400 leading-relaxed">
              Acesse pelo computador ou celular com interface responsiva e cálculo reativo imediato.
            </p>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div class="p-10 sm:p-16 rounded-3xl bg-gradient-to-tr from-brand-600/20 via-surface-900 to-purple-600/20 border border-brand-500/30 backdrop-blur-2xl shadow-glass-dark">
          <h2 class="text-3xl sm:text-5xl font-black text-white font-display">Pronto para transformar sua vida financeira?</h2>
          <p class="mt-4 text-surface-300 text-sm sm:text-base max-w-2xl mx-auto">
            Abandone as planilhas complexas e controle seu dinheiro com a clareza e previsibilidade que você sempre quis.
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
            <div class="w-6 h-6 rounded-lg bg-brand-500 text-white font-black flex items-center justify-center text-[10px]">OF</div>
            <span class="text-surface-300 font-bold">OrganizadorFinan</span>
          </div>
          <div>© 2026 OrganizadorFinan. Todos os direitos reservados.</div>
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
  activeTab = signal<'vault' | 'cards' | 'ofx' | 'family'>('vault');
  familyMode = signal<'family' | 'personal'>('family');

  goalPresets: GoalPreset[] = [
    { id: 'reserva', name: 'Reserva de Emergência', target: 35000, icon: '🛡️', defaultSaved: 20000 },
    { id: 'casa', name: 'Entrada da Casa Própria', target: 120000, icon: '🏠', defaultSaved: 45000 },
    { id: 'viagem', name: 'Viagem em Família', target: 15000, icon: '✈️', defaultSaved: 10500 },
    { id: 'carro', name: 'Carro Novo', target: 60000, icon: '🚗', defaultSaved: 28000 },
  ];

  selectedGoal = signal<GoalPreset>(this.goalPresets[0]);
  simulatedVaultAmount = signal<number>(20000);
  simulatedInstallments = signal<number>(6);

  simTarget: number = 35000;
  simMonthly: number = 1500;

  calculatedMonths = computed(() => {
    if (this.simMonthly <= 0) return 0;
    return Math.ceil(this.simTarget / this.simMonthly);
  });

  selectGoal(goal: GoalPreset) {
    this.selectedGoal.set(goal);
    this.simulatedVaultAmount.set(goal.defaultSaved);
  }

  setCalculatorGoal(name: string, target: number, monthly: number) {
    this.simTarget = target;
    this.simMonthly = monthly;
  }

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
