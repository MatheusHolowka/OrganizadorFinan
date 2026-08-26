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
    <header class="h-16 border-b border-neutral-800 bg-black/80 backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a routerLink="/dashboard" class="flex items-center gap-2.5 cursor-pointer group">
          <div class="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
            ▲
          </div>
          <div>
            <span class="font-bold text-base text-white tracking-tight">Organizador<span class="text-neutral-400">Finan</span></span>
            <span class="hidden md:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">v2.4</span>
          </div>
        </a>
      </div>

      <div class="flex items-center gap-3 md:gap-4">
        <!-- Alternador de Escopo: Pessoal vs Família -->
        @if (familyService.familyData()?.hasFamily) {
          <div class="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium">
            <button
              (click)="toggleScope('personal')"
              [ngClass]="familyService.activeScope() === 'personal' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'"
              class="px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>👤</span>
              <span class="hidden sm:inline">Minhas</span>
            </button>
            <button
              (click)="toggleScope('family')"
              [ngClass]="familyService.activeScope() === 'family' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'"
              class="px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span class="hidden sm:inline">Família</span>
            </button>
          </div>
        }

        <!-- Perfil e Logout -->
        @if (authService.currentUser(); as user) {
          <div class="flex items-center gap-2 md:gap-3">
            <a
              routerLink="/profile"
              title="Gerenciar Minha Conta e Família"
              class="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group relative"
            >
              <div class="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-white group-hover:bg-neutral-700 transition-colors">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="hidden sm:flex flex-col text-left">
                <span class="text-xs font-medium text-white leading-tight">{{ user.name }}</span>
                <span class="text-[10px] text-neutral-500 font-mono leading-tight">{{ user.email }}</span>
              </div>
              @if (familyService.familyData()?.pendingInvitesReceived?.length) {
                <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              }
            </a>

            <button
              (click)="authService.logout()"
              title="Sair da conta"
              class="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
