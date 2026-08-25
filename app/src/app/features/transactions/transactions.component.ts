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
    <div class="h-screen flex flex-col overflow-hidden bg-surface-950">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-surface-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho & Botões de Ação -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white font-display">Extrato & Transações</h1>
                @if (familyService.activeScope() === 'family') {
                  <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                    👨‍👩‍👧‍👦 Extrato da Família
                  </span>
                }
              </div>
              <p class="text-xs md:text-sm text-surface-400 mt-0.5">Gerencie suas entradas, despesas e transferências</p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <button
                (click)="clearAllTransactions()"
                class="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-rose-500/5"
                title="Apagar todos os lançamentos e zerar a base"
              >
                <span>🗑️</span>
                <span>Limpar Lançamentos</span>
              </button>

              <a
                routerLink="/import"
                class="px-4 py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-700 font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>📥</span>
                <span>Importar Extrato</span>
              </a>

              <button
                (click)="openCreateModal()"
                class="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Transação</span>
              </button>
            </div>
          </div>

          <!-- Barra de Filtros com Dropdowns Elegantes -->
          <div class="p-4 md:p-5 rounded-3xl bg-surface-900/80 border border-surface-800 flex flex-wrap items-center gap-3 backdrop-blur-md shadow-glass">
            <!-- Seletor de Mês -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-surface-400 font-semibold uppercase">Mês:</span>
              <div class="relative">
                <select
                  [(ngModel)]="selectedMonth"
                  (change)="applyFilters()"
                  class="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer transition-all"
                >
                  @for (m of months; track m.value) {
                    <option [value]="m.value" class="bg-surface-900 text-white">{{ m.name }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Seletor de Ano -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-surface-400 font-semibold uppercase">Ano:</span>
              <div class="relative">
                <select
                  [(ngModel)]="selectedYear"
                  (change)="applyFilters()"
                  class="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer transition-all"
                >
                  @for (y of years; track y) {
                    <option [value]="y" class="bg-surface-900 text-white">{{ y }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Seletor de Tipo -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-surface-400 font-semibold uppercase">Tipo:</span>
              <div class="relative">
                <select
                  [(ngModel)]="selectedType"
                  (change)="applyFilters()"
                  class="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer transition-all"
                >
                  <option value="" class="bg-surface-900 text-white">Todos os Tipos</option>
                  <option value="INCOME" class="bg-surface-900 text-emerald-400 font-medium">Receitas (+)</option>
                  <option value="EXPENSE" class="bg-surface-900 text-rose-400 font-medium">Despesas (-)</option>
                  <option value="TRANSFER" class="bg-surface-900 text-indigo-400 font-medium">Transferências (↔)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Campo de Busca -->
            <div class="flex-1 min-w-[200px] relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="Buscar por descrição..."
                class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-surface-500">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Cards de Resumo do Período -->
          @if (transactionsService.data(); as data) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-surface-900/60 border border-surface-800">
                <span class="text-xs text-surface-400 font-semibold uppercase">Entradas do Mês</span>
                <div class="text-xl font-bold text-emerald-400 mt-1 font-display">
                  +{{ data.summary.totalIncome | currencyBrl }}
                </div>
              </div>
              <div class="p-4 rounded-2xl bg-surface-900/60 border border-surface-800">
                <span class="text-xs text-surface-400 font-semibold uppercase">Saídas do Mês</span>
                <div class="text-xl font-bold text-rose-400 mt-1 font-display">
                  -{{ data.summary.totalExpense | currencyBrl }}
                </div>
              </div>
              <div class="p-4 rounded-2xl bg-surface-900/60 border border-surface-800">
                <span class="text-xs text-surface-400 font-semibold uppercase">Balanço do Período</span>
                <div
                  class="text-xl font-bold mt-1 font-display"
                  [ngClass]="data.summary.netPeriod >= 0 ? 'text-brand-400' : 'text-rose-400'"
                >
                  {{ data.summary.netPeriod | currencyBrl }}
                </div>
              </div>
            </div>

            <!-- Tabela de Transações -->
            <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm overflow-hidden">
              @if (data.transactions.length === 0) {
                <div class="text-center py-16 text-surface-400 text-sm space-y-3">
                  <div class="text-3xl">📄</div>
                  <div class="font-semibold text-white">Nenhum lançamento encontrado em {{ selectedMonthName }} de {{ selectedYear }}</div>
                  <p class="text-xs text-surface-500 max-w-sm mx-auto">
                    Você pode selecionar outro mês/ano nos filtros acima ou importar seu arquivo de extrato.
                  </p>
                  <a
                    routerLink="/import"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold hover:bg-brand-500/30 transition-all"
                  >
                    <span>📥</span>
                    <span>Importar Arquivo de Extrato</span>
                  </a>
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="text-surface-400 border-b border-surface-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th class="pb-3 font-semibold">Data</th>
                        <th class="pb-3 font-semibold">Descrição</th>
                        <th class="pb-3 font-semibold">Categoria</th>
                        <th class="pb-3 font-semibold">Conta</th>
                        <th class="pb-3 font-semibold text-right">Valor</th>
                        <th class="pb-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-800/60">
                      @for (tx of data.transactions; track tx.id) {
                        <tr class="hover:bg-surface-800/30 transition-colors">
                          <td class="py-3.5 text-surface-400">{{ tx.date | date:'dd/MM/yyyy' }}</td>
                          <td class="py-3.5 font-medium text-white flex items-center gap-2">
                            <span
                              class="w-2.5 h-2.5 rounded-full shrink-0"
                              [ngClass]="tx.type === 'INCOME' ? 'bg-emerald-400' : (tx.type === 'EXPENSE' ? 'bg-rose-400' : 'bg-indigo-400')"
                            ></span>
                            <span class="truncate max-w-md">{{ tx.description }}</span>
                          </td>
                          <td class="py-3.5 text-surface-300">
                            <span class="px-2 py-0.5 rounded-md bg-surface-800 border border-surface-700 text-[11px]">
                              {{ tx.category?.name || 'Geral' }}
                            </span>
                          </td>
                          <td class="py-3.5 text-surface-300">
                            {{ tx.account?.name }}
                            @if (tx.destinationAccount) {
                              <span class="text-surface-500">→ {{ tx.destinationAccount.name }}</span>
                            }
                          </td>
                          <td
                            class="py-3.5 text-right font-bold text-sm whitespace-nowrap"
                            [ngClass]="tx.type === 'INCOME' ? 'text-emerald-400' : (tx.type === 'EXPENSE' ? 'text-rose-400' : 'text-indigo-400')"
                          >
                            {{ tx.type === 'EXPENSE' ? '-' : '+' }}{{ tx.amount | currencyBrl }}
                          </td>
                          <td class="py-3.5 text-right">
                            <button
                              (click)="deleteTransaction(tx)"
                              title="Excluir transação"
                              class="p-1.5 rounded-lg text-surface-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div class="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-surface-950 border border-surface-800">
            <button
              type="button"
              (click)="setType('EXPENSE')"
              [ngClass]="form.value.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'text-surface-400'"
              class="py-2 rounded-xl text-xs font-bold transition-all border border-transparent"
            >
              Despesa
            </button>
            <button
              type="button"
              (click)="setType('INCOME')"
              [ngClass]="form.value.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-surface-400'"
              class="py-2 rounded-xl text-xs font-bold transition-all border border-transparent"
            >
              Receita
            </button>
            <button
              type="button"
              (click)="setType('TRANSFER')"
              [ngClass]="form.value.type === 'TRANSFER' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'text-surface-400'"
              class="py-2 rounded-xl text-xs font-bold transition-all border border-transparent"
            >
              Transferência
            </button>
          </div>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Descrição</label>
            <input
              type="text"
              formControlName="description"
              placeholder="Ex: Almoço, Supermercado, Salário"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="amount"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Data</label>
              <input
                type="date"
                formControlName="date"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">
                {{ form.value.type === 'TRANSFER' ? 'Conta Origem' : 'Conta' }}
              </label>
              <div class="relative">
                <select
                  formControlName="accountId"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  @for (acc of accounts(); track acc.id) {
                    <option [value]="acc.id" class="bg-surface-900 text-white">{{ acc.name }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            @if (form.value.type === 'TRANSFER') {
              <div>
                <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Conta Destino</label>
                <div class="relative">
                  <select
                    formControlName="destinationAccountId"
                    class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    @for (acc of accounts(); track acc.id) {
                      <option [value]="acc.id" class="bg-surface-900 text-white">{{ acc.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            } @else {
              <div>
                <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Categoria</label>
                <div class="relative">
                  <select
                    formControlName="categoryId"
                    class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="" class="bg-surface-900 text-white">Sem categoria</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id" class="bg-surface-900 text-white">{{ cat.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="isModalOpen.set(false)"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all"
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
      title: '⚠️ Zerar Base e Lançamentos',
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
