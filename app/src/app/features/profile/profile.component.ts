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
    <div class="h-screen flex flex-col overflow-hidden bg-black text-[#ededed] font-sans">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-neutral-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">Minha Conta & Família</h1>
              <p class="text-xs text-neutral-400 mt-0.5">Segurança, dados de acesso e gestão do grupo familiar</p>
            </div>
          </div>

          <!-- Navegação por Abas -->
          <div class="flex items-center gap-1 p-1 rounded-xl bg-[#0c0c0e] border border-neutral-800">
            <button
              (click)="activeTab.set('profile')"
              [ngClass]="activeTab() === 'profile' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'"
              class="flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Dados Pessoais</span>
            </button>
            <button
              (click)="activeTab.set('security')"
              [ngClass]="activeTab() === 'security' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'"
              class="flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Segurança & Senha</span>
            </button>
            <button
              (click)="activeTab.set('family')"
              [ngClass]="activeTab() === 'family' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'"
              class="flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 relative cursor-pointer"
            >
              <span>Finanças da Família</span>
              @if (familyService.familyData()?.pendingInvitesReceived?.length) {
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              }
            </button>
          </div>

          <!-- CONTEÚDO DA ABA 1: DADOS PESSOAIS -->
          @if (activeTab() === 'profile') {
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-6">
              <div class="flex items-center gap-4 pb-5 border-b border-neutral-850">
                <div class="w-12 h-12 rounded-xl bg-white text-black font-bold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {{ userInitials }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">{{ authService.currentUser()?.name }}</h3>
                  <p class="text-xs text-neutral-400 font-mono">{{ authService.currentUser()?.email }}</p>
                </div>
              </div>

              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Nome Completo</label>
                    <input
                      type="text"
                      formControlName="name"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">E-mail (Login)</label>
                    <input
                      type="email"
                      [value]="authService.currentUser()?.email"
                      disabled
                      class="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-neutral-850 text-neutral-500 text-xs font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div class="flex justify-end pt-2">
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || profileLoading()"
                    class="px-5 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    @if (profileLoading()) {
                      <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    }
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- CONTEÚDO DA ABA 2: SEGURANÇA & SENHA -->
          @if (activeTab() === 'security') {
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-5">
              <div>
                <h3 class="text-base font-bold text-white">Alterar Senha</h3>
                <p class="text-xs text-neutral-400 mt-0.5">Sua nova senha deve atender aos critérios de segurança</p>
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4 max-w-md">
                <div>
                  <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Senha Atual</label>
                  <input
                    type="password"
                    formControlName="currentPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Nova Senha</label>
                  <input
                    type="password"
                    formControlName="newPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <!-- Medidor de Força -->
                <div class="p-3 rounded-xl bg-black border border-neutral-800 space-y-2">
                  <div class="flex justify-between items-center text-[10px] font-mono">
                    <span class="text-neutral-500 uppercase">Segurança:</span>
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

                  <div class="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-neutral-900">
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 1 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : (passwordStrengthScore >= 2 ? 'bg-amber-400' : 'bg-rose-400')) : 'bg-neutral-900'"></div>
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 2 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-neutral-900'"></div>
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 3 ? (passwordStrengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-neutral-900'"></div>
                    <div class="h-full transition-all" [ngClass]="passwordStrengthScore >= 4 ? 'bg-emerald-400' : 'bg-neutral-900'"></div>
                  </div>

                  <div class="grid grid-cols-2 gap-1 pt-1 text-[10px] font-mono">
                    <div class="flex items-center gap-1" [ngClass]="hasMinLength ? 'text-emerald-400' : 'text-neutral-600'">
                      <span>{{ hasMinLength ? '✓' : '○' }}</span>
                      <span>Mín. 8 chars</span>
                    </div>
                    <div class="flex items-center gap-1" [ngClass]="hasUpperAndLower ? 'text-emerald-400' : 'text-neutral-600'">
                      <span>{{ hasUpperAndLower ? '✓' : '○' }}</span>
                      <span>Maiúsc. & Minúsc.</span>
                    </div>
                    <div class="flex items-center gap-1" [ngClass]="hasNumber ? 'text-emerald-400' : 'text-neutral-600'">
                      <span>{{ hasNumber ? '✓' : '○' }}</span>
                      <span>1 número</span>
                    </div>
                    <div class="flex items-center gap-1" [ngClass]="hasSpecial ? 'text-emerald-400' : 'text-neutral-600'">
                      <span>{{ hasSpecial ? '✓' : '○' }}</span>
                      <span>Símbolo (@#$)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                  />
                  @if (passwordForm.value.newPassword && passwordForm.value.confirmPassword && passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
                    <span class="text-[10px] text-rose-400 mt-1 block">As senhas não coincidem.</span>
                  }
                </div>

                <div class="pt-2">
                  <button
                    type="submit"
                    [disabled]="passwordForm.invalid || passwordStrengthScore < 4 || passwordForm.value.newPassword !== passwordForm.value.confirmPassword || passwordLoading()"
                    class="px-5 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    @if (passwordLoading()) {
                      <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    }
                    <span>Atualizar Senha</span>
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- CONTEÚDO DA ABA 3: FINANÇAS DA FAMÍLIA -->
          @if (activeTab() === 'family') {
            <div class="space-y-5">
              <!-- Convites Pendentes Recebidos -->
              @if (familyService.familyData()?.pendingInvitesReceived?.length) {
                <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-3">
                  <div class="flex items-center gap-2 text-white font-bold text-xs font-mono uppercase">
                    <span>Convites de Grupos Familiares:</span>
                  </div>
                  @for (inv of familyService.familyData()!.pendingInvitesReceived; track inv.id) {
                    <div class="flex items-center justify-between p-3.5 rounded-xl bg-black border border-neutral-850">
                      <div>
                        <h4 class="text-xs font-bold text-white">{{ inv.familyGroup.name }}</h4>
                        <p class="text-[11px] text-neutral-400 font-mono">Criado por {{ inv.familyGroup.creator.name }} ({{ inv.familyGroup.creator.email }})</p>
                      </div>
                      <button
                        (click)="acceptFamilyInvite(inv.id)"
                        class="px-4 py-1.5 btn-vercel-primary text-xs font-semibold cursor-pointer"
                      >
                        Aceitar e Participar
                      </button>
                    </div>
                  }
                </div>
              }

              @if (familyService.familyData()?.hasFamily) {
                @if (familyService.familyData()?.familyGroup; as family) {
                  <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-850">
                      <div>
                        <span class="text-[10px] uppercase font-mono text-neutral-500 font-bold">Grupo Familiar</span>
                        <h3 class="text-lg font-bold text-white">{{ family.name }}</h3>
                        <p class="text-xs text-neutral-400 mt-0.5">Visão consolidada de despesas mantendo contas individuais privadas</p>
                      </div>

                      <button
                        (click)="isInviteModalOpen.set(true)"
                        class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>+ Convidar Membro</span>
                      </button>
                    </div>

                    <!-- Lista de Membros -->
                    <div class="space-y-3">
                      <h4 class="text-xs font-mono uppercase text-neutral-500">Membros da Família ({{ family.members.length }})</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        @for (m of family.members; track m.id) {
                          <div class="p-3.5 rounded-xl bg-black border border-neutral-800 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                              <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold flex items-center justify-center text-xs">
                                {{ m.user?.name ? m.user!.name.substring(0, 2).toUpperCase() : '✉' }}
                              </div>
                              <div>
                                <h5 class="text-xs font-bold text-white">{{ m.user?.name || m.email }}</h5>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                  <span class="text-[10px] text-neutral-500 font-mono">{{ m.email }}</span>
                                  <span
                                    class="text-[9px] font-mono px-1.5 py-0.2 rounded"
                                    [ngClass]="m.status === 'ACCEPTED' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'"
                                  >
                                    {{ m.status === 'ACCEPTED' ? (m.role === 'OWNER' ? 'Criador' : 'Membro') : 'Pendente' }}
                                  </span>
                                </div>
                              </div>
                            </div>

                            @if (m.role !== 'OWNER' || family.createdById !== authService.currentUser()?.id) {
                              <button
                                (click)="removeMember(m)"
                                title="Remover da família"
                                class="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors cursor-pointer"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div class="p-10 text-center rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-3">
                  <div class="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center text-lg">
                    👥
                  </div>
                  <h3 class="text-base font-bold text-white">Crie o Grupo Familiar</h3>
                  <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Convide cônjuge, filhos ou dependentes por e-mail para compartilhar despesas consolidadas mantendo a privacidade de suas contas individuais.
                  </p>

                  <div class="max-w-xs mx-auto flex gap-2 pt-2">
                    <input
                      type="text"
                      [(ngModel)]="newFamilyName"
                      placeholder="Ex: Família Silva"
                      class="flex-1 px-3 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
                    />
                    <button
                      (click)="createFamily()"
                      [disabled]="!newFamilyName || familyLoading()"
                      class="px-4 py-2 btn-vercel-primary text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Criar
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
          <p class="text-xs text-neutral-400 leading-relaxed">
            Informe o e-mail da pessoa que você deseja convidar. Ela receberá uma notificação para aceitar o compartilhamento financeiro.
          </p>

          <div>
            <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">E-mail do Convidado</label>
            <input
              type="email"
              [(ngModel)]="inviteEmail"
              placeholder="exemplo@email.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all"
            />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              (click)="isInviteModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="sendInvite()"
              [disabled]="!inviteEmail || inviteLoading()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (inviteLoading()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Enviando...</span>
              } @else {
                <span>Enviar Convite</span>
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
    const name = this.authService.currentUser()?.name || 'OF';
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
      case 4: return 'Forte';
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
        this.toastService.success('Dados atualizados com sucesso!');
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
