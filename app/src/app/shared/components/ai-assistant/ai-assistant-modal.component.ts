import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService, ChatMessage, PromptSuggestion } from '../../../core/services/assistant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-ai-assistant-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Action Trigger Button -->
    <div class="fixed bottom-20 md:bottom-6 right-6 z-40">
      <button
        (click)="toggleAssistant()"
        class="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-neutral-950 hover:bg-neutral-900 border border-emerald-500/40 hover:border-emerald-400 text-white shadow-[0_0_25px_rgba(0,229,153,0.25)] hover:shadow-[0_0_35px_rgba(0,229,153,0.4)] transition-all cursor-pointer"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute left-3"></span>
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="text-xs font-bold font-mono tracking-tight text-white pl-1">FINAN AI</span>
        <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
          PRO
        </span>
      </button>
    </div>

    <!-- Sliding Assistant Drawer -->
    @if (assistantService.isOpen()) {
      <div class="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
        <div 
          (click)="$event.stopPropagation()"
          class="w-full max-w-lg h-full bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col justify-between animate-slide-left"
        >
          
          <!-- Top Title Bar -->
          <div class="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-black/50">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-neutral-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-base font-bold shadow-[0_0_12px_rgba(0,229,153,0.2)]">
                ▲
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-white">Assistente FINAN</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                    ONLINE
                  </span>
                </div>
                <div class="text-[10px] font-mono text-neutral-400">Engenharia Financeira & WhatsApp Bot</div>
              </div>
            </div>

            <!-- Tab Switcher & Close -->
            <div class="flex items-center gap-2">
              <div class="flex items-center p-1 rounded-xl bg-black border border-neutral-800 text-xs font-medium">
                <button
                  (click)="activeTab.set('chat')"
                  [ngClass]="activeTab() === 'chat' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'"
                  class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                >
                  Chat
                </button>
                <button
                  (click)="activeTab.set('whatsapp')"
                  [ngClass]="activeTab() === 'whatsapp' ? 'bg-emerald-500 text-black font-bold' : 'text-neutral-400 hover:text-white'"
                  class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>WhatsApp</span>
                </button>
              </div>

              <button
                (click)="assistantService.close()"
                class="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- TAB 1: CHAT INTERACTION -->
          @if (activeTab() === 'chat') {
            <!-- Chat Messages Scrollable Area -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans text-xs">
              
              @for (msg of assistantService.messages(); track msg.timestamp) {
                <div 
                  class="flex flex-col"
                  [ngClass]="msg.role === 'user' ? 'items-end' : 'items-start'"
                >
                  <div class="text-[10px] font-mono text-neutral-500 mb-1 px-1">
                    {{ msg.role === 'user' ? 'Você' : 'FINAN AI' }}
                  </div>

                  <div
                    class="max-w-[85%] p-3.5 rounded-2xl border text-xs leading-relaxed whitespace-pre-wrap"
                    [ngClass]="msg.role === 'user' 
                      ? 'bg-neutral-900 border-neutral-700 text-white shadow-sm rounded-tr-sm' 
                      : 'bg-black border-neutral-800 text-neutral-200 shadow-md rounded-tl-sm font-mono'"
                  >
                    {{ msg.content }}
                  </div>
                </div>
              }

              @if (assistantService.isThinking()) {
                <div class="flex items-center gap-2 text-neutral-400 text-xs font-mono p-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>FINAN está calculando seu patrimônio...</span>
                </div>
              }

            </div>

            <!-- Suggestion Quick Chips -->
            <div class="p-3 border-t border-neutral-900 bg-black/40">
              <div class="text-[10px] font-mono text-neutral-500 uppercase mb-2 px-1">Perguntas Rápidas:</div>
              <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                @for (s of suggestions(); track s.label) {
                  <button
                    (click)="sendQuickPrompt(s.prompt)"
                    class="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {{ s.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Input Bar -->
            <div class="p-4 border-t border-neutral-800 bg-neutral-950">
              <form (ngSubmit)="submitMessage()" class="flex items-center gap-2">
                <input
                  type="text"
                  [(ngModel)]="userInput"
                  name="userInput"
                  placeholder="Pergunte sobre teto diário, faturas, assinaturas..."
                  class="flex-1 px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                  [disabled]="assistantService.isThinking()"
                />
                <button
                  type="submit"
                  [disabled]="!userInput.trim() || assistantService.isThinking()"
                  class="px-4 py-3 btn-vercel-primary text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Enviar
                </button>
              </form>
            </div>
          }

          <!-- TAB 2: WHATSAPP BOT INTEGRATION -->
          @if (activeTab() === 'whatsapp') {
            <div class="flex-1 overflow-y-auto p-6 space-y-6 text-left font-sans text-xs">
              <div class="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div class="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                  <span>📱</span>
                  <span>Conecte o FINAN no seu WhatsApp</span>
                </div>
                <p class="text-neutral-300 leading-relaxed">
                  Envie mensagens ou áudios no WhatsApp para consultar seu saldo seguro, faturas e lançamentos em tempo real sem precisar abrir o app!
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-black border border-neutral-800 space-y-4">
                <div class="text-xs font-mono uppercase font-bold text-white">Vincular Número de Telefone:</div>
                
                <div>
                  <label class="block text-neutral-400 font-mono mb-1">Seu WhatsApp (com DDD):</label>
                  <input
                    type="text"
                    [(ngModel)]="whatsappPhone"
                    placeholder="11999998888"
                    class="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <button
                  (click)="saveWhatsAppNumber()"
                  [disabled]="isConnectingPhone()"
                  class="w-full py-2.5 btn-vercel-primary text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {{ isConnectingPhone() ? 'Vinculando...' : 'Ativar WhatsApp Bot' }}
                </button>

                @if (pairingCode()) {
                  <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 font-mono text-center space-y-1 animate-fade-in">
                    <div class="text-[10px] text-emerald-400 uppercase font-bold">Número Vinculado com Sucesso!</div>
                    <div class="text-xs text-white">Código de Pareamento: <strong class="text-emerald-400">{{ pairingCode() }}</strong></div>
                    <div class="text-[10px] text-neutral-400 mt-1">Envie qualquer mensagem para o bot do FINAN para começar.</div>
                  </div>
                }
              </div>

              <!-- Comparison Note with Pierre -->
              <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-neutral-400 space-y-1.5">
                <div class="text-white font-bold">Por que o bot do FINAN é superior ao Pierre?</div>
                <div>✓ Entende Quarentena de Cofres e nunca gera falsa sensação de saldo livre.</div>
                <div>✓ Projeta parcelas e cortes de fatura em até 24 meses.</div>
                <div>✓ 100% integrado ao Open Finance e arquivos OFX/CSV.</div>
              </div>
            </div>
          }

        </div>
      </div>
    }
  `,
})
export class AiAssistantModalComponent implements OnInit {
  assistantService = inject(AssistantService);
  toast = inject(ToastService);

  activeTab = signal<'chat' | 'whatsapp'>('chat');
  userInput = '';
  whatsappPhone = '';
  pairingCode = signal<string>('');
  isConnectingPhone = signal<boolean>(false);

  platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  suggestions = signal<PromptSuggestion[]>([
    { label: '🛡️ Teto Seguro/Dia', prompt: 'Quanto posso gastar hoje sem furar a meta?' },
    { label: '💳 Faturas de Cartão', prompt: 'Qual o total das faturas do mês que vem?' },
    { label: '📡 Assinaturas Ativas', prompt: 'Quais assinaturas ativas eu tenho?' },
    { label: '🧭 Simulador FIRE', prompt: 'Qual meu runway e meta de liberdade financeira?' },
    { label: '📊 Resumo do Mês', prompt: 'Qual o resumo de despesas e receitas deste mês?' },
  ]);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
      this.assistantService.getSuggestions().subscribe({
        next: (res) => {
          if (res.suggestions?.length) this.suggestions.set(res.suggestions);
        },
      });
    }
  }

  toggleAssistant() {
    this.assistantService.toggle();
  }

  submitMessage() {
    const text = this.userInput.trim();
    if (!text) return;
    this.userInput = '';
    this.assistantService.sendMessage(text).subscribe();
  }

  sendQuickPrompt(prompt: string) {
    this.assistantService.sendMessage(prompt).subscribe();
  }

  saveWhatsAppNumber() {
    const phone = this.whatsappPhone.trim();
    if (!phone) {
      this.toast.warning('Informe seu número de WhatsApp com DDD');
      return;
    }

    this.isConnectingPhone.set(true);
    this.assistantService.connectWhatsApp(phone).subscribe({
      next: (res) => {
        this.isConnectingPhone.set(false);
        this.pairingCode.set(res.pairingCode);
        this.toast.success('WhatsApp vinculado com sucesso!');
      },
      error: () => {
        this.isConnectingPhone.set(false);
        this.toast.error('Erro ao vincular WhatsApp.');
      },
    });
  }
}
