import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
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
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';
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
    CustomSelectComponent,
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
            <!-- Seletor de Mês Custom Dark -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-neutral-400 uppercase">Mês:</span>
              <app-custom-select
                [options]="monthOptions"
                [value]="selectedMonth"
                (valueChange)="onMonthFilterChange($event)"
              ></app-custom-select>
            </div>

            <!-- Seletor de Ano Custom Dark -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-neutral-400 uppercase">Ano:</span>
              <app-custom-select
                [options]="yearOptions"
                [value]="selectedYear"
                (valueChange)="onYearFilterChange($event)"
              ></app-custom-select>
            </div>

            <!-- Seletor de Tipo Custom Dark -->
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-neutral-400 uppercase">Tipo:</span>
              <app-custom-select
                [options]="typeOptions"
                [value]="selectedType"
                (valueChange)="onTypeFilterChange($event)"
              ></app-custom-select>
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
                      @for (tx of paginatedTransactions(); track tx.id) {
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

                <!-- Controles de Paginação (10 em 10) -->
                @if (totalItems() > 0) {
                  <div class="mt-4 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div class="text-neutral-500">
                      Mostrando <span class="text-white font-bold">{{ startIndex() + 1 }}</span> a
                      <span class="text-white font-bold">{{ endIndex() }}</span> de
                      <span class="text-white font-bold">{{ totalItems() }}</span> lançamentos
                    </div>

                    <div class="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        (click)="prevPage()"
                        [disabled]="currentPage() === 1"
                        class="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        ← Anterior
                      </button>

                      @for (p of pagesArray(); track p) {
                        <button
                          (click)="goToPage(p)"
                          [ngClass]="currentPage() === p ? 'bg-white text-black font-bold border-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'"
                          class="w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer"
                        >
                          {{ p }}
                        </button>
                      }

                      <button
                        (click)="nextPage()"
                        [disabled]="currentPage() === totalPages()"
                        class="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        Próxima →
                      </button>
                    </div>
                  </div>
                }
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

  monthOptions: SelectOption[] = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  yearOptions: SelectOption[] = [
    { value: 2028, label: '2028' },
    { value: 2027, label: '2027' },
    { value: 2026, label: '2026' },
    { value: 2025, label: '2025' },
    { value: 2024, label: '2024' },
    { value: 2023, label: '2023' },
  ];

  typeOptions: SelectOption[] = [
    { value: '', label: 'Todos os Tipos' },
    { value: 'INCOME', label: 'Receitas (+)', color: '#10B981' },
    { value: 'EXPENSE', label: 'Despesas (-)', color: '#F43F5E' },
    { value: 'TRANSFER', label: 'Transferências (↔)', color: '#A1A1AA' },
  ];

  onMonthFilterChange(month: number) {
    this.selectedMonth = month;
    this.applyFilters();
  }

  onYearFilterChange(year: number) {
    this.selectedYear = year;
    this.applyFilters();
  }

  onTypeFilterChange(type: string) {
    this.selectedType = type;
    this.applyFilters();
  }

  constructor() {
    effect(() => {
      const scope = this.familyService.activeScope();
      this.loadData(scope);
    });
  }

  get selectedMonthName(): string {
    return this.monthOptions.find((m) => m.value === Number(this.selectedMonth))?.label || '';
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

  pageSize = 10;
  currentPage = signal<number>(1);

  totalItems = computed(() => this.transactionsService.data()?.transactions.length || 0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));
  startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.totalItems()));

  paginatedTransactions = computed(() => {
    const list = this.transactionsService.data()?.transactions || [];
    const start = this.startIndex();
    return list.slice(start, start + this.pageSize);
  });

  pagesArray = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  loadData(scope?: string) {
    this.currentPage.set(1);
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
    this.currentPage.set(1);
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
