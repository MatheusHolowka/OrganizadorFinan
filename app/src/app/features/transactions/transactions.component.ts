import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionsService } from '../../core/services/transactions.service';
import { AccountsService } from '../../core/services/accounts.service';
import { CategoriesService } from '../../core/services/categories.service';
import { FamilyService } from '../../core/services/family.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Account, Category } from '../../core/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    CurrencyBrlPipe,
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

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho & Botões de Ação -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white tracking-tight">Extrato & Transações</h1>
                @if (familyService.activeScope() === 'family') {
                  <span class="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono">
                    Família Consolidada
                  </span>
                }
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">Gerencie suas entradas, despesas e transferências</p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <button
                (click)="clearAllTransactions()"
                class="px-3.5 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/50 text-xs font-medium transition-all cursor-pointer"
                title="Apagar todos os lançamentos e zerar a base"
              >
                <span>Limpar Lançamentos</span>
              </button>

              <a
                routerLink="/import"
                class="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <span>Importar OFX</span>
              </a>

              <button
                (click)="openCreateModal()"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Transação</span>
              </button>
            </div>
          </div>

          <!-- Barra de Filtros -->
          <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800 flex flex-wrap items-center gap-3">
            <!-- Seletor de Mês -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-neutral-400 uppercase">Mês:</span>
              <div class="relative">
                <select
                  [(ngModel)]="selectedMonth"
                  (change)="applyFilters()"
                  class="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-black border border-neutral-800 text-white text-xs font-medium focus:outline-none focus:border-neutral-600 cursor-pointer"
                >
                  @for (m of months; track m.value) {
                    <option [value]="m.value" class="bg-neutral-900 text-white">{{ m.name }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Seletor de Ano -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-neutral-400 uppercase">Ano:</span>
              <div class="relative">
                <select
                  [(ngModel)]="selectedYear"
                  (change)="applyFilters()"
                  class="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-black border border-neutral-800 text-white text-xs font-mono font-medium focus:outline-none focus:border-neutral-600 cursor-pointer"
                >
                  @for (y of years; track y) {
                    <option [value]="y" class="bg-neutral-900 text-white">{{ y }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Seletor de Tipo -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-neutral-400 uppercase">Tipo:</span>
              <div class="relative">
                <select
                  [(ngModel)]="selectedType"
                  (change)="applyFilters()"
                  class="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-black border border-neutral-800 text-white text-xs font-medium focus:outline-none focus:border-neutral-600 cursor-pointer"
                >
                  <option value="" class="bg-neutral-900 text-white">Todos os Tipos</option>
                  <option value="INCOME" class="bg-neutral-900 text-emerald-400">Receitas (+)</option>
                  <option value="EXPENSE" class="bg-neutral-900 text-rose-400">Despesas (-)</option>
                  <option value="TRANSFER" class="bg-neutral-900 text-neutral-300">Transferências (↔)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Campo de Busca -->
            <div class="flex-1 min-w-[180px] relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="Buscar por descrição..."
                class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-neutral-800 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-all"
              />
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2.5 text-neutral-500">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Cards de Resumo do Período -->
          @if (transactionsService.data(); as data) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800">
                <span class="text-[11px] text-neutral-400 uppercase">Entradas</span>
                <div class="text-xl font-bold text-emerald-400 mt-1">
                  +{{ data.summary.totalIncome | currencyBrl }}
                </div>
              </div>
              <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800">
                <span class="text-[11px] text-neutral-400 uppercase">Saídas</span>
                <div class="text-xl font-bold text-rose-400 mt-1">
                  -{{ data.summary.totalExpense | currencyBrl }}
                </div>
              </div>
              <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800">
                <span class="text-[11px] text-neutral-400 uppercase">Balanço Líquido</span>
                <div
                  class="text-xl font-bold mt-1"
                  [ngClass]="data.summary.netPeriod >= 0 ? 'text-white' : 'text-rose-400'"
                >
                  {{ data.summary.netPeriod | currencyBrl }}
                </div>
              </div>
            </div>

            <!-- Tabela de Transações -->
            <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 overflow-hidden">
              @if (data.transactions.length === 0) {
                <div class="text-center py-16 text-neutral-400 text-xs font-mono space-y-3">
                  <div class="text-2xl">📄</div>
                  <div class="font-bold text-white">Nenhum lançamento encontrado em {{ selectedMonthName }} de {{ selectedYear }}</div>
                  <p class="text-neutral-500 max-w-sm mx-auto font-sans">
                    Você pode selecionar outro período nos filtros ou importar seu arquivo de extrato OFX.
                  </p>
                  <a
                    routerLink="/import"
                    class="inline-block px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-sans text-xs transition-all"
                  >
                    Importar Arquivo OFX
                  </a>
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs font-mono">
                    <thead class="text-neutral-500 border-b border-neutral-800 uppercase text-[10px]">
                      <tr>
                        <th class="pb-3 font-medium">Data</th>
                        <th class="pb-3 font-medium">Descrição</th>
                        <th class="pb-3 font-medium">Categoria</th>
                        <th class="pb-3 font-medium">Conta</th>
                        <th class="pb-3 font-medium text-right">Valor</th>
                        <th class="pb-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-850 text-neutral-300">
                      @for (tx of data.transactions; track tx.id) {
                        <tr class="hover:bg-neutral-900/40 transition-colors">
                          <td class="py-3.5 text-neutral-500">{{ tx.date | date:'dd/MM/yyyy' }}</td>
                          <td class="py-3.5 font-sans font-medium text-white flex items-center gap-2">
                            <span
                              class="w-1.5 h-1.5 rounded-full shrink-0"
                              [ngClass]="tx.type === 'INCOME' ? 'bg-emerald-400' : (tx.type === 'EXPENSE' ? 'bg-rose-400' : 'bg-neutral-400')"
                            ></span>
                            <span class="truncate max-w-md">{{ tx.description }}</span>
                          </td>
                          <td class="py-3.5 text-neutral-400">
                            <span class="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px]">
                              {{ tx.category?.name || 'Geral' }}
                            </span>
                          </td>
                          <td class="py-3.5 text-neutral-400">
                            {{ tx.account?.name }}
                            @if (tx.destinationAccount) {
                              <span class="text-neutral-500">→ {{ tx.destinationAccount.name }}</span>
                            }
                          </td>
                          <td
                            class="py-3.5 text-right font-bold whitespace-nowrap"
                            [ngClass]="tx.type === 'INCOME' ? 'text-emerald-400' : (tx.type === 'EXPENSE' ? 'text-white' : 'text-neutral-300')"
                          >
                            {{ tx.type === 'EXPENSE' ? '-' : '+' }}{{ tx.amount | currencyBrl }}
                          </td>
                          <td class="py-3.5 text-right">
                            <button
                              (click)="deleteTransaction(tx)"
                              title="Excluir transação"
                              class="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors cursor-pointer"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <!-- Modal Nova Transação -->
      <app-modal
        [isOpen]="isModalOpen()"
        title="Lançar Nova Transação"
        (close)="isModalOpen.set(false)"
        (closeModal)="isModalOpen.set(false)"
      >
        <form [formGroup]="form" (ngSubmit)="submitTransaction()" class="space-y-4">
          <!-- Seletor de Tipo -->
          <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black border border-neutral-800">
            <button
              type="button"
              (click)="setType('EXPENSE')"
              [ngClass]="form.value.type === 'EXPENSE' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-500'"
              class="py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              Despesa
            </button>
            <button
              type="button"
              (click)="setType('INCOME')"
              [ngClass]="form.value.type === 'INCOME' ? 'bg-neutral-900 text-emerald-400 font-bold' : 'text-neutral-500'"
              class="py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              Receita
            </button>
            <button
              type="button"
              (click)="setType('TRANSFER')"
              [ngClass]="form.value.type === 'TRANSFER' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-500'"
              class="py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              Transferência
            </button>
          </div>

          <div>
            <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Descrição</label>
            <input
              type="text"
              formControlName="description"
              placeholder="Ex: Supermercado, Salário"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="amount"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Data</label>
              <input
                type="date"
                formControlName="date"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                {{ form.value.type === 'TRANSFER' ? 'Conta Origem' : 'Conta' }}
              </label>
              <div class="relative">
                <select
                  formControlName="accountId"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  @for (acc of accounts(); track acc.id) {
                    <option [value]="acc.id" class="bg-neutral-900 text-white">{{ acc.name }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            @if (form.value.type === 'TRANSFER') {
              <div>
                <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Conta Destino</label>
                <div class="relative">
                  <select
                    formControlName="destinationAccountId"
                    class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
                  >
                    @for (acc of accounts(); track acc.id) {
                      <option [value]="acc.id" class="bg-neutral-900 text-white">{{ acc.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            } @else {
              <div>
                <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Categoria</label>
                <div class="relative">
                  <select
                    formControlName="categoryId"
                    class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
                  >
                    <option value="" class="bg-neutral-900 text-white">Sem categoria</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id" class="bg-neutral-900 text-white">{{ cat.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              (click)="isModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold cursor-pointer"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </app-modal>

      <app-bottom-nav />
    </div>
  `,
})
export class TransactionsComponent implements OnInit {
  transactionsService = inject(TransactionsService);
  accountsService = inject(AccountsService);
  categoriesService = inject(CategoriesService);
  familyService = inject(FamilyService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  router = inject(Router);
  fb = inject(FormBuilder);

  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  isModalOpen = signal(false);

  now = new Date();
  selectedMonth = this.now.getMonth() + 1;
  selectedYear = this.now.getFullYear();
  selectedType = '';
  searchQuery = '';

  months = [
    { value: 1, name: 'Janeiro' },
    { value: 2, name: 'Fevereiro' },
    { value: 3, name: 'Março' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Maio' },
    { value: 6, name: 'Junho' },
    { value: 7, name: 'Julho' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Setembro' },
    { value: 10, name: 'Outubro' },
    { value: 11, name: 'Novembro' },
    { value: 12, name: 'Dezembro' },
  ];

  years = [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020];

  constructor() {
    effect(() => {
      const scope = this.familyService.activeScope();
      this.loadData(scope);
    });
  }

  get selectedMonthName(): string {
    return this.months.find((m) => m.value === Number(this.selectedMonth))?.name || '';
  }

  form = this.fb.group({
    type: ['EXPENSE', [Validators.required]],
    description: ['', [Validators.required]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().substring(0, 10), [Validators.required]],
    accountId: ['', [Validators.required]],
    destinationAccountId: [''],
    categoryId: [''],
  });

  ngOnInit() {
    this.loadData();
    this.accountsService.findAll().subscribe((res) => {
      this.accounts.set(res.accounts);
      if (res.accounts.length > 0 && !this.form.value.accountId) {
        this.form.patchValue({ accountId: res.accounts[0].id });
      }
    });
    this.categoriesService.findAll().subscribe((cats) => this.categories.set(cats));
  }

  loadData(scope?: string) {
    const currentScope = scope || this.familyService.activeScope();
    this.transactionsService
      .findAll({
        month: Number(this.selectedMonth),
        year: Number(this.selectedYear),
        type: this.selectedType || undefined,
        search: this.searchQuery || undefined,
        scope: currentScope,
      })
      .subscribe();
  }

  applyFilters() {
    this.loadData();
  }

  setType(type: 'INCOME' | 'EXPENSE' | 'TRANSFER') {
    this.form.patchValue({ type });
  }

  openCreateModal() {
    this.form.reset({
      type: 'EXPENSE',
      date: new Date().toISOString().substring(0, 10),
      accountId: this.accounts().length > 0 ? this.accounts()[0].id : '',
    });
    this.isModalOpen.set(true);
  }

  submitTransaction() {
    if (this.form.invalid) return;

    this.transactionsService.create(this.form.value).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.toastService.success('Transação lançada com sucesso!');
        this.loadData();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao lançar transação.');
      },
    });
  }

  async deleteTransaction(tx: any) {
    const confirmed = await this.dialogService.confirm({
      title: 'Excluir Transação',
      message: `Deseja realmente excluir o lançamento "${tx.description}"? O saldo da conta será recalculado automaticamente.`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.transactionsService.remove(tx.id).subscribe({
        next: () => {
          this.toastService.success('Transação excluída com sucesso.');
          this.loadData();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao excluir transação.');
        },
      });
    }
  }

  async clearAllTransactions() {
    const confirmed = await this.dialogService.confirm({
      title: 'Zerar Base e Lançamentos',
      message: 'Esta ação irá apagar permanentemente todas as suas transações, compras de cartões, faturas e lotes de extratos, resetando os saldos para R$ 0,00. Deseja continuar?',
      confirmText: 'Sim, Zerar Tudo',
      cancelText: 'Voltar',
      type: 'danger',
    });

    if (confirmed) {
      this.transactionsService.clearAll().subscribe({
        next: (res) => {
          this.toastService.success(res.message, 'Base Zerada');
          this.loadData();
          this.accountsService.findAll().subscribe((a) => this.accounts.set(a.accounts));
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao limpar lançamentos.'),
      });
    }
  }
}
