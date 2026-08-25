import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-950/90 backdrop-blur-lg border-t border-surface-800/80 z-40 px-2 flex items-center justify-around">
      <a
        routerLink="/dashboard"
        routerLinkActive="text-brand-400"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex flex-col items-center justify-center py-1 text-surface-400 hover:text-surface-200 text-[10px] font-medium"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Início</span>
      </a>

      <a
        routerLink="/transactions"
        routerLinkActive="text-brand-400"
        class="flex flex-col items-center justify-center py-1 text-surface-400 hover:text-surface-200 text-[10px] font-medium"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span>Extrato</span>
      </a>

      <a
        routerLink="/cards"
        routerLinkActive="text-indigo-400"
        class="flex flex-col items-center justify-center py-1 text-surface-400 hover:text-surface-200 text-[10px] font-medium"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Cartões</span>
      </a>

      <a
        routerLink="/vaults"
        routerLinkActive="text-vault-DEFAULT"
        class="flex flex-col items-center justify-center py-1 text-surface-400 hover:text-surface-200 text-[10px] font-medium"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Cofres</span>
      </a>

      <a
        routerLink="/import"
        routerLinkActive="text-brand-400"
        class="flex flex-col items-center justify-center py-1 text-surface-400 hover:text-surface-200 text-[10px] font-medium"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Importar</span>
      </a>
    </nav>
  `,
})
export class BottomNavComponent {}
