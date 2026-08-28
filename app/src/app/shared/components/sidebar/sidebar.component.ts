import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AssistantService } from '../../../core/services/assistant.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden md:flex flex-col w-64 border-r border-neutral-800 bg-black/95 p-4 shrink-0 h-full overflow-y-auto justify-between">
      <nav class="space-y-1">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </a>

        <a
          routerLink="/transactions"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>Transações</span>
        </a>

        <a
          routerLink="/cards"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Cartões & Faturas</span>
        </a>

        <a
          routerLink="/subscriptions"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div class="flex items-center justify-between flex-1">
            <span>Assinaturas</span>
            <span class="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[9px] font-mono">
              RADAR
            </span>
          </div>
        </a>

        <a
          routerLink="/vaults"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div class="flex items-center justify-between flex-1">
            <span>Cofres & Metas</span>
            <span class="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800/60 text-[9px] font-mono">
              ROUND-UP
            </span>
          </div>
        </a>

        <a
          routerLink="/investments"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Investimentos</span>
        </a>

        <a
          routerLink="/loans"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Empréstimos</span>
        </a>

        <a
          routerLink="/import"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Importar OFX/CSV</span>
        </a>

        <a
          routerLink="/open-finance"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <div class="flex items-center justify-between flex-1">
            <span>Open Finance</span>
            <span class="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[9px] font-mono">
              PLUGGY
            </span>
          </div>
        </a>

        <a
          routerLink="/profile"
          routerLinkActive="bg-white/10 text-white border-neutral-700 shadow-sm"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all font-medium text-sm border border-transparent"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Minha Conta & Família</span>
        </a>
      </nav>

      <!-- FINAN AI Assistant Launcher in Sidebar -->
      <div class="mt-auto space-y-2">
        <button
          (click)="assistant.toggle()"
          class="w-full p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,229,153,0.1)]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-bold font-mono text-white">FINAN AI</span>
            </div>
            <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
              ABRIR
            </span>
          </div>
          <p class="text-[10px] text-neutral-400 font-sans mt-1">
            Consulte teto seguro, faturas e pergunte no Zap
          </p>
        </button>

        <!-- Badge de Isolamento de Fundos -->
        <div class="p-3 rounded-xl bg-black border border-neutral-850 text-left">
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Quarentena Ativa</span>
          </div>
          <p class="mt-0.5 text-[10px] text-neutral-500 leading-relaxed font-sans">
            Fundos em cofres estão blindados do saldo diário.
          </p>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  assistant = inject(AssistantService);
}

