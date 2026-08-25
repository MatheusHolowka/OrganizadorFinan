import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FamilyService } from '../../../core/services/family.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-16 border-b border-surface-800/80 bg-surface-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a routerLink="/dashboard" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold group-hover:scale-105 transition-transform">
            OF
          </div>
          <div>
            <span class="font-display font-bold text-lg text-white tracking-tight">Finan<span class="text-brand-400">Organizador</span></span>
            <span class="hidden md:inline-block ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-800 text-surface-300 font-semibold border border-surface-700">v2.0 Pro</span>
          </div>
        </a>
      </div>

      <div class="flex items-center gap-3 md:gap-5">
        <!-- Alternador de Escopo: Pessoal vs Família -->
        @if (familyService.familyData()?.hasFamily) {
          <div class="flex items-center p-1 rounded-2xl bg-surface-900 border border-surface-800 text-xs font-semibold">
            <button
              (click)="toggleScope('personal')"
              [ngClass]="familyService.activeScope() === 'personal' ? 'bg-surface-800 text-white shadow' : 'text-surface-400 hover:text-surface-200'"
              class="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>👤</span>
              <span class="hidden sm:inline">Minhas</span>
            </button>
            <button
              (click)="toggleScope('family')"
              [ngClass]="familyService.activeScope() === 'family' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-surface-400 hover:text-surface-200'"
              class="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span class="hidden sm:inline">Família</span>
            </button>
          </div>
        }

        <!-- Perfil e Notificações -->
        @if (authService.currentUser(); as user) {
          <div class="flex items-center gap-2 md:gap-3">
            <a
              routerLink="/profile"
              title="Gerenciar Minha Conta e Família"
              class="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-surface-800/60 border border-transparent hover:border-surface-700 transition-all cursor-pointer group relative"
            >
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="hidden sm:flex flex-col text-left">
                <span class="text-xs font-bold text-white leading-tight group-hover:text-brand-400 transition-colors">{{ user.name }}</span>
                <span class="text-[10px] text-surface-400 leading-tight">{{ user.email }}</span>
              </div>
              @if (familyService.familyData()?.pendingInvitesReceived?.length) {
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              }
            </a>

            <button
              (click)="authService.logout()"
              title="Sair da conta"
              class="p-2 rounded-xl text-surface-400 hover:text-rose-400 hover:bg-surface-800/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  familyService = inject(FamilyService);

  ngOnInit() {
    this.familyService.getMyFamily().subscribe();
  }

  toggleScope(scope: 'personal' | 'family') {
    this.familyService.setScope(scope);
  }
}
