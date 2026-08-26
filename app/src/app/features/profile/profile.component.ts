import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { FamilyService } from '../../core/services/family.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
    ModalComponent,
  ],
  template: `
    <div class="h-screen flex flex-col overflow-hidden bg-surface-950">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-surface-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-white font-display">Minha Conta & Família</h1>
              <p class="text-xs md:text-sm text-surface-400 mt-0.5">Gerencie seus dados de acesso, segurança e finanças familiares</p>
            </div>
          </div>

          <!-- Navegação por Abas -->
          <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-900/80 border border-surface-800 backdrop-blur-md">
            <button
              (click)="activeTab.set('profile')"
              [ngClass]="activeTab() === 'profile' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-surface-400 hover:text-white'"
              class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>👤</span>
              <span>Dados Pessoais</span>
            </button>
            <button
              (click)="activeTab.set('security')"
              [ngClass]="activeTab() === 'security' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-surface-400 hover:text-white'"
              class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>🔒</span>
              <span>Segurança & Senha</span>
            </button>
            <button
              (click)="activeTab.set('family')"
              [ngClass]="activeTab() === 'family' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-surface-400 hover:text-white'"
              class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>Finanças da Família</span>
              @if (familyService.familyData()?.pendingInvitesReceived?.length) {
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              }
            </button>
          </div>

          <!-- CONTEÚDO DA ABA 1: DADOS PESSOAIS -->
          @if (activeTab() === 'profile') {
            <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm space-y-6">
              <div class="flex items-center gap-4 pb-6 border-b border-surface-800">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
                  {{ userInitials }}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white font-display">{{ authService.currentUser()?.name }}</h3>
                  <p class="text-xs text-surface-400">{{ authService.currentUser()?.email }}</p>
                </div>
              </div>

              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Nome Completo</label>
                    <input
                      type="text"
                      formControlName="name"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">E-mail (Login)</label>
                    <input
                      type="email"
                      [value]="authService.currentUser()?.email"
                      disabled
                      class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950/40 border border-surface-800 text-surface-400 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div class="flex justify-end pt-2">
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || profileLoading()"
                    class="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                  >
                    @if (profileLoading()) {
                      <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    }
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- CONTEÚDO DA ABA 2: SEGURANÇA & SENHA -->
          @if (activeTab() === 'security') {
            <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm space-y-6">
              <div>
                <h3 class="text-base font-bold text-white font-display">Alterar Senha de Acesso</h3>
                <p class="text-xs text-surface-400 mt-0.5">Sua nova senha deve atender a todos os padrões de segurança do sistema</p>
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4 max-w-lg">
                <div>
                  <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Senha Atual</label>
                  <input
                    type="password"
                    formControlName="currentPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Nova Senha Forte</label>
                  <input
                    type="password"
                    formControlName="newPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <!-- Medidor de Força -->
                <div class="p-3 rounded-2xl bg-surface-950 border border-surface-800 space-y-2">
                  <div class="flex justify-between items-center text-[10px]">
                    <span class="font-bold uppercase text-surface-400">Força da Senha:</span>
                    <span
                      class="font-bold uppercase"
                      [ngClass]="{
                        'text-rose-400': passwordStrengthScore < 2,
                        'text-amber-400': passwordStrengthScore >= 2 && passwordStrengthScore < 4,
                        'text-emerald-400': passwordStrengthScore === 4
                      }"
                    >
                      {{ passwordStrengthLabel }}
                    </span>
                  </div>

                  <div class="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-surface-800">
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 1 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : (passwordStrengthScore >= 2 ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-surface-800'"></div>
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 2 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-surface-800'"></div>
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 3 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-surface-800'"></div>
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 4 ? 'bg-emerald-400' : 'bg-surface-800'"></div>
                  </div>

                  <div class="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                    <div class="flex items-center gap-1" [ngClass]="hasMinLength ? 'text-emerald-400' : 'text-surface-500'">
                      <span>{{ hasMinLength ? '✓' : '○' }}</span>
                      <span>Mín. 8 caracteres</span>
                    </div>
                    <div class="flex items-center gap-1" [ngClass]="hasUpperAndLower ? 'text-emerald-400' : 'text-surface-500'">
                      <span>{{ hasUpperAndLower ? '✓' : '○' }}</span>
                      <span>Maiúscula & Minúscula</span>
                    </div>
                    <div class="flex items-center gap-1" [ngClass]="hasNumber ? 'text-emerald-400' : 'text-surface-500'">
                      <span>{{ hasNumber ? '✓' : '○' }}</span>
                      <span>Pelo menos 1 número</span>
                    </div>
                    <div class="flex items-center gap-1" [ngClass]="hasSpecial ? 'text-emerald-400' : 'text-surface-500'">
                      <span>{{ hasSpecial ? '✓' : '○' }}</span>
                      <span>Caractere especial (@#$)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                  @if (passwordForm.value.newPassword && passwordForm.value.confirmPassword && passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
                    <span class="text-[10px] text-rose-400 mt-1 block">As senhas digitadas não coincidem.</span>
                  }
                </div>

                <div class="pt-2">
                  <button
                    type="submit"
                    [disabled]="passwordForm.invalid || passwordStrengthScore < 4 || passwordForm.value.newPassword !== passwordForm.value.confirmPassword || passwordLoading()"
                    class="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                  >
                    @if (passwordLoading()) {
                      <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    }
                    <span>Atualizar Senha</span>
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- CONTEÚDO DA ABA 3: FINANÇAS DA FAMÍLIA -->
          @if (activeTab() === 'family') {
            <div class="space-y-6">
              <!-- Convites Pendentes Recebidos -->
              @if (familyService.familyData()?.pendingInvitesReceived?.length) {
                <div class="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                  <div class="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <span>📬</span>
                    <span>Você recebeu convites para grupos familiares!</span>
                  </div>
                  @for (inv of familyService.familyData()!.pendingInvitesReceived; track inv.id) {
                    <div class="flex items-center justify-between p-3.5 rounded-2xl bg-surface-900/90 border border-surface-700">
                      <div>
                        <h4 class="text-xs font-bold text-white">{{ inv.familyGroup.name }}</h4>
                        <p class="text-[11px] text-surface-400">Criado por {{ inv.familyGroup.creator.name }} ({{ inv.familyGroup.creator.email }})</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          (click)="acceptFamilyInvite(inv.id)"
                          class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
                        >
                          Aceitar e Participar
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (familyService.familyData()?.hasFamily) {
                @if (familyService.familyData()?.familyGroup; as family) {
                  <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
                      <div>
                        <span class="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Grupo Familiar Ativo</span>
                        <h3 class="text-xl font-bold text-white font-display">{{ family.name }}</h3>
                        <p class="text-xs text-surface-400 mt-0.5">Membros integrados compartilham visão consolidada de despesas e extratos</p>
                      </div>

                      <button
                        (click)="isInviteModalOpen.set(true)"
                        class="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                      >
                        <span>➕</span>
                        <span>Convidar por E-mail</span>
                      </button>
                    </div>

                    <!-- Lista de Membros -->
                    <div class="space-y-3">
                      <h4 class="text-xs font-bold uppercase text-surface-400">Membros da Família ({{ family.members.length }})</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        @for (m of family.members; track m.id) {
                          <div class="p-4 rounded-2xl bg-surface-950 border border-surface-800 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                                {{ m.user?.name ? m.user!.name.substring(0, 2).toUpperCase() : '✉️' }}
                              </div>
                              <div>
                                <h5 class="text-xs font-bold text-white">{{ m.user?.name || m.email }}</h5>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                  <span class="text-[10px] text-surface-400">{{ m.email }}</span>
                                  <span
                                    class="text-[9px] font-bold px-1.5 py-0.2 rounded"
                                    [ngClass]="m.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'"
                                  >
                                    {{ m.status === 'ACCEPTED' ? (m.role === 'OWNER' ? '👑 Criador' : 'Membro') : '⏳ Convite Pendente' }}
                                  </span>
                                </div>
                              </div>
                            </div>

                            @if (m.role !== 'OWNER' || family.createdById !== authService.currentUser()?.id) {
                              <button
                                (click)="removeMember(m)"
                                title="Remover da família"
                                class="p-1.5 rounded-lg text-surface-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              } @else {
                <!-- Criar Primeiro Grupo Familiar -->
                <div class="p-12 text-center rounded-3xl bg-surface-900/60 border border-surface-800 space-y-4">
                  <div class="w-16 h-16 rounded-full bg-indigo-500/15 text-indigo-400 mx-auto flex items-center justify-center text-2xl font-bold">
                    👨‍👩‍👧‍👦
                  </div>
                  <h3 class="text-lg font-bold text-white font-display">Crie o Grupo Financeiro da Sua Família</h3>
                  <p class="text-xs text-surface-400 max-w-md mx-auto leading-relaxed">
                    Convide cônjuge, filhos ou sócios através do e-mail. Ao aceitarem, vocês poderão compartilhar visão consolidada de transações, contas e gastos mensais.
                  </p>

                  <div class="max-w-sm mx-auto flex gap-2 pt-2">
                    <input
                      type="text"
                      [(ngModel)]="newFamilyName"
                      placeholder="Ex: Família Silva"
                      class="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      (click)="createFamily()"
                      [disabled]="!newFamilyName || familyLoading()"
                      class="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
                    >
                      Criar Família
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <!-- Modal Convidar Membro por E-mail -->
      <app-modal
        [isOpen]="isInviteModalOpen()"
        title="Convidar Membro para a Família"
        (close)="isInviteModalOpen.set(false)"
        (closeModal)="isInviteModalOpen.set(false)"
      >
        <div class="space-y-4">
          <p class="text-xs text-surface-300 leading-relaxed">
            Informe o e-mail da pessoa que você deseja convidar. Ela receberá uma mensagem e poderá aceitar com 1 clique para compartilhar as finanças.
          </p>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">E-mail do Convidado</label>
            <input
              type="email"
              [(ngModel)]="inviteEmail"
              placeholder="exemplo@email.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs placeholder-surface-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="isInviteModalOpen.set(false)"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="sendInvite()"
              [disabled]="!inviteEmail || inviteLoading()"
              class="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              @if (inviteLoading()) {
                <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Enviando...</span>
              } @else {
                <span>Enviar Convite por E-mail</span>
              }
            </button>
          </div>
        </div>
      </app-modal>

      <app-bottom-nav />
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  usersService = inject(UsersService);
  familyService = inject(FamilyService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  activeTab = signal<'profile' | 'security' | 'family'>('profile');

  profileLoading = signal(false);
  passwordLoading = signal(false);
  familyLoading = signal(false);
  inviteLoading = signal(false);

  newFamilyName = '';
  inviteEmail = '';
  isInviteModalOpen = signal(false);

  profileForm = this.fb.group({
    name: ['', [Validators.required]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam === 'family' || tabParam === 'security' || tabParam === 'profile') {
      this.activeTab.set(tabParam);
    }

    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({ name: user.name });
    }

    this.loadFamily();
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.name || 'US';
    return name.substring(0, 2).toUpperCase();
  }

  get password(): string {
    return this.passwordForm.value.newPassword || '';
  }

  get hasMinLength(): boolean {
    return this.password.length >= 8;
  }

  get hasUpperAndLower(): boolean {
    return /[a-z]/.test(this.password) && /[A-Z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  get hasSpecial(): boolean {
    return /[@$!%*?&#]/.test(this.password);
  }

  get passwordStrengthScore(): number {
    let score = 0;
    if (this.hasMinLength) score++;
    if (this.hasUpperAndLower) score++;
    if (this.hasNumber) score++;
    if (this.hasSpecial) score++;
    return score;
  }

  get passwordStrengthLabel(): string {
    switch (this.passwordStrengthScore) {
      case 4: return 'Forte & Segura';
      case 3: return 'Média';
      case 2: return 'Fraca';
      default: return 'Muito Fraca';
    }
  }

  loadFamily() {
    this.familyService.getMyFamily().subscribe();
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.profileLoading.set(true);
    this.usersService.updateProfile({ name: this.profileForm.value.name! }).subscribe({
      next: (user) => {
        this.profileLoading.set(false);
        this.authService.updateCurrentUser(user);
        this.toastService.success('Dados do perfil atualizados com sucesso!');
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.toastService.error(err.error?.message || 'Erro ao atualizar perfil.');
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid || this.passwordStrengthScore < 4) return;
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.toastService.error('As senhas não coincidem.');
      return;
    }

    this.passwordLoading.set(true);
    this.usersService
      .changePassword({
        currentPassword: this.passwordForm.value.currentPassword!,
        newPassword: this.passwordForm.value.newPassword!,
      })
      .subscribe({
        next: (res) => {
          this.passwordLoading.set(false);
          this.passwordForm.reset();
          this.toastService.success(res.message, 'Senha Atualizada');
        },
        error: (err) => {
          this.passwordLoading.set(false);
          this.toastService.error(err.error?.message || 'Erro ao alterar senha.');
        },
      });
  }

  createFamily() {
    if (!this.newFamilyName) return;

    this.familyLoading.set(true);
    this.familyService.createFamily(this.newFamilyName).subscribe({
      next: () => {
        this.familyLoading.set(false);
        this.newFamilyName = '';
        this.toastService.success('Grupo familiar criado com sucesso!');
        this.loadFamily();
      },
      error: (err) => {
        this.familyLoading.set(false);
        this.toastService.error(err.error?.message || 'Erro ao criar família.');
      },
    });
  }

  sendInvite() {
    if (!this.inviteEmail) return;

    this.inviteLoading.set(true);
    this.familyService.inviteMember(this.inviteEmail).subscribe({
      next: (res) => {
        this.inviteLoading.set(false);
        this.isInviteModalOpen.set(false);
        this.inviteEmail = '';
        this.toastService.success(res.message, 'Convite Enviado');
        this.loadFamily();
      },
      error: (err) => {
        this.inviteLoading.set(false);
        this.toastService.error(err.error?.message || 'Erro ao enviar convite.');
      },
    });
  }

  acceptFamilyInvite(memberId: string) {
    this.familyService.acceptInvite(memberId).subscribe({
      next: (res) => {
        this.toastService.success(res.message, 'Bem-vindo à Família!');
        this.loadFamily();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao aceitar convite.');
      },
    });
  }

  async removeMember(member: any) {
    const isSelf = member.userId === this.authService.currentUser()?.id;
    const confirmed = await this.dialogService.confirm({
      title: isSelf ? 'Sair da Família' : 'Remover Membro',
      message: isSelf
        ? 'Deseja realmente sair deste grupo familiar e voltar a gerenciar finanças apenas individuais?'
        : `Deseja realmente remover "${member.user?.name || member.email}" do grupo familiar?`,
      confirmText: isSelf ? 'Sim, Sair' : 'Sim, Remover',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.familyService.removeOrLeaveMember(member.id).subscribe({
        next: (res) => {
          this.toastService.success(res.message);
          this.loadFamily();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao remover membro.'),
      });
    }
  }
}
