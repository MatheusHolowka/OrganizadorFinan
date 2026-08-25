import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardsService } from '../../core/services/cards.service';
import { AccountsService } from '../../core/services/accounts.service';
import { CategoriesService } from '../../core/services/categories.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../core/services/dialog.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Account, Category, CreditCard } from '../../core/models';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    CommonModule,
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
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-white font-display">Inteligência de Cartões</h1>
              <p class="text-xs md:text-sm text-surface-400 mt-0.5">Gestão de limites, faturas e projeção automática de parcelas futuras</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                (click)="openPurchaseModal()"
                [disabled]="cardsService.cards().length === 0"
                class="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Compra</span>
              </button>

              <button
                (click)="isNewCardModalOpen.set(true)"
                class="px-4 py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold text-xs md:text-sm border border-surface-700 transition-all"
              >
                + Adicionar Cartão
              </button>
            </div>
          </div>

          <!-- Lista de Cartões -->
          @if (cardsService.loading()) {
            <div class="flex items-center justify-center py-20">
              <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-400"></div>
            </div>
          } @else if (cardsService.cards().length === 0) {
            <div class="p-12 text-center rounded-3xl bg-surface-900/60 border border-surface-800 space-y-3">
              <div class="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-white">Nenhum cartão cadastrado</h3>
              <p class="text-xs text-surface-400 max-w-sm mx-auto">
                Cadastre seus cartões de crédito para calcular datas de fechamento e projetar parcelas nos próximos meses.
              </p>
              <button
                (click)="isNewCardModalOpen.set(true)"
                class="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
              >
                Cadastrar Primeiro Cartão
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (card of cardsService.cards(); track card.id) {
                <div
                  class="rounded-3xl p-6 relative overflow-hidden border border-surface-700/80 shadow-glass flex flex-col justify-between"
                  [style.background]="'linear-gradient(135deg, ' + (card.color || '#312e81') + ' 0%, #0f172a 100%)'"
                >
                  <div>
                    <div class="flex justify-between items-start mb-6">
                      <div>
                        <span class="text-[10px] uppercase tracking-widest text-surface-300 font-bold">Cartão de Crédito</span>
                        <h3 class="text-lg font-bold text-white font-display">{{ card.name }}</h3>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase">
                          {{ card.brand }}
                        </span>
                        <button
                          (click)="deleteCard(card)"
                          title="Excluir Cartão"
                          class="p-1 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Fatura Aberta e Limite -->
                    <div class="space-y-3">
                      <div>
                        <span class="text-[11px] text-surface-300">Fatura Atual Aberta:</span>
                        <div class="text-2xl font-black text-white font-display">
                          {{ card.currentInvoiceAmount | currencyBrl }}
                        </div>
                      </div>

                      <!-- Barra de Limite Consumido -->
                      <div>
                        <div class="flex justify-between text-[11px] text-surface-300 mb-1">
                          <span>Disponível: {{ card.availableLimit | currencyBrl }}</span>
                          <span>Limite: {{ card.limit | currencyBrl }}</span>
                        </div>
                        <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                          <div
                            class="h-full bg-emerald-400 rounded-full transition-all"
                            [style.width.%]="card.limit > 0 ? (card.availableLimit / card.limit) * 100 : 0"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Datas e Ação de Pagar -->
                  <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div class="text-[11px] text-surface-300">
                      <span>Fecha dia <strong>{{ card.closingDay }}</strong></span> •
                      <span>Vence dia <strong>{{ card.dueDay }}</strong></span>
                    </div>

                    <button
                      (click)="openPayInvoiceModal(card)"
                      [disabled]="card.currentInvoiceAmount <= 0"
                      class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-30 text-white text-xs font-semibold transition-colors backdrop-blur-sm"
                    >
                      Pagar Fatura
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <!-- Modal Novo Cartão -->
      <app-modal
        [isOpen]="isNewCardModalOpen()"
        title="Cadastrar Cartão de Crédito"
        (close)="isNewCardModalOpen.set(false)"
        (closeModal)="isNewCardModalOpen.set(false)"
      >
        <form [formGroup]="cardForm" (ngSubmit)="submitNewCard()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Nome do Cartão</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Sicredi Mastercard, Nubank"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Bandeira</label>
              <div class="relative">
                <select
                  formControlName="brand"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="MASTERCARD" class="bg-surface-900 text-white">Mastercard</option>
                  <option value="VISA" class="bg-surface-900 text-white">Visa</option>
                  <option value="ELO" class="bg-surface-900 text-white">Elo</option>
                  <option value="AMEX" class="bg-surface-900 text-white">American Express</option>
                  <option value="OTHER" class="bg-surface-900 text-white">Outra</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Limite Total (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="limit"
                placeholder="5000.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Dia Fechamento</label>
              <input
                type="number"
                min="1"
                max="31"
                formControlName="closingDay"
                placeholder="Ex: 25"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Dia Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                formControlName="dueDay"
                placeholder="Ex: 5"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="isNewCardModalOpen.set(false)"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              [disabled]="cardForm.invalid"
              class="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              Cadastrar Cartão
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Nova Compra / Parcelamento -->
      <app-modal
        [isOpen]="isPurchaseModalOpen()"
        title="Lançar Compra no Cartão"
        (close)="isPurchaseModalOpen.set(false)"
        (closeModal)="isPurchaseModalOpen.set(false)"
      >
        <form [formGroup]="purchaseForm" (ngSubmit)="submitPurchase()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Cartão de Crédito</label>
            <div class="relative">
              <select
                formControlName="cardId"
                class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                @for (card of cardsService.cards(); track card.id) {
                  <option [value]="card.id" class="bg-surface-900 text-white">{{ card.name }} (Fecha dia {{ card.closingDay }})</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Descrição</label>
            <input
              type="text"
              formControlName="description"
              placeholder="Ex: Notebook Dell, Supermercado"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Valor Total (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="totalAmount"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Nº de Parcelas</label>
              <input
                type="number"
                min="1"
                max="36"
                formControlName="installments"
                placeholder="1"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Data da Compra</label>
              <input
                type="date"
                formControlName="purchaseDate"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

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
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="isPurchaseModalOpen.set(false)"
              class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              [disabled]="purchaseForm.invalid"
              class="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              Lançar e Projetar Parcelas
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Pagar Fatura -->
      <app-modal
        [isOpen]="isPayModalOpen()"
        title="Pagar Fatura de Cartão"
        (close)="isPayModalOpen.set(false)"
        (closeModal)="isPayModalOpen.set(false)"
      >
        @if (selectedCardForPay(); as card) {
          <div class="space-y-4">
            <div class="p-4 rounded-2xl bg-surface-950 border border-surface-800">
              <div class="text-xs text-surface-400">Cartão Selecionado</div>
              <div class="text-base font-bold text-white font-display">{{ card.name }}</div>
              <div class="text-sm font-semibold text-rose-400 mt-1">
                Valor Total da Fatura: {{ card.currentInvoiceAmount | currencyBrl }}
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-surface-300 uppercase mb-1">Conta Bancária de Pagamento</label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedPayAccountId"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  @for (acc of accounts(); track acc.id) {
                    <option [value]="acc.id" class="bg-surface-900 text-white">{{ acc.name }} (Saldo: {{ acc.currentBalance | currencyBrl }})</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-surface-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="isPayModalOpen.set(false)"
                class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                (click)="confirmPayInvoice()"
                [disabled]="!selectedPayAccountId"
                class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        }
      </app-modal>
    </div>
  `,
})
export class CardsComponent implements OnInit {
  cardsService = inject(CardsService);
  accountsService = inject(AccountsService);
  categoriesService = inject(CategoriesService);
  toastService = inject(ToastService);
  dialogService = inject(DialogService);
  fb = inject(FormBuilder);

  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);

  isNewCardModalOpen = signal(false);
  isPurchaseModalOpen = signal(false);
  isPayModalOpen = signal(false);

  selectedCardForPay = signal<CreditCard | null>(null);
  selectedPayAccountId = '';

  cardForm = this.fb.group({
    name: ['', Validators.required],
    brand: ['MASTERCARD', Validators.required],
    limit: [5000, [Validators.required, Validators.min(1)]],
    closingDay: [25, [Validators.required, Validators.min(1), Validators.max(31)]],
    dueDay: [5, [Validators.required, Validators.min(1), Validators.max(31)]],
  });

  purchaseForm = this.fb.group({
    cardId: ['', Validators.required],
    description: ['', Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0.01)]],
    installments: [1, [Validators.required, Validators.min(1), Validators.max(36)]],
    purchaseDate: [new Date().toISOString().substring(0, 10), Validators.required],
    categoryId: [''],
  });

  ngOnInit() {
    this.cardsService.findAll().subscribe();
    this.accountsService.findAll().subscribe((res) => {
      this.accounts.set(res.accounts);
      if (res.accounts.length > 0) {
        this.selectedPayAccountId = res.accounts[0].id;
      }
    });
    this.categoriesService.findAll().subscribe((cats) => {
      this.categories.set(cats.filter((c) => c.type === 'EXPENSE'));
    });
  }

  openPurchaseModal() {
    const cards = this.cardsService.cards();
    if (cards.length > 0) {
      this.purchaseForm.patchValue({ cardId: cards[0].id });
      this.isPurchaseModalOpen.set(true);
    }
  }

  submitNewCard() {
    if (this.cardForm.invalid) return;

    this.cardsService.create(this.cardForm.value).subscribe({
      next: () => {
        this.isNewCardModalOpen.set(false);
        this.cardForm.reset({ brand: 'MASTERCARD', limit: 5000, closingDay: 25, dueDay: 5 });
        this.toastService.success('Cartão de crédito cadastrado com sucesso!');
        this.cardsService.findAll().subscribe();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Erro ao cadastrar cartão.'),
    });
  }

  async deleteCard(card: CreditCard) {
    const confirmed = await this.dialogService.confirm({
      title: 'Excluir Cartão de Crédito',
      message: `Deseja realmente excluir o cartão "${card.name}" e todas as suas faturas e parcelas vinculadas?`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.cardsService.remove(card.id).subscribe({
        next: () => {
          this.toastService.success(`Cartão "${card.name}" excluído.`);
          this.cardsService.findAll().subscribe();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao excluir cartão.'),
      });
    }
  }

  submitPurchase() {
    if (this.purchaseForm.invalid) return;

    const val = this.purchaseForm.value;
    this.cardsService
      .createTransaction(val.cardId!, {
        description: val.description!,
        totalAmount: Number(val.totalAmount),
        installments: Number(val.installments),
        purchaseDate: val.purchaseDate!,
        categoryId: val.categoryId || undefined,
      })
      .subscribe({
        next: () => {
          this.isPurchaseModalOpen.set(false);
          this.purchaseForm.reset({
            installments: 1,
            purchaseDate: new Date().toISOString().substring(0, 10),
          });
          this.toastService.success('Compra e parcelas lançadas com sucesso!');
          this.cardsService.findAll().subscribe();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao lançar compra.'),
      });
  }

  openPayInvoiceModal(card: CreditCard) {
    this.selectedCardForPay.set(card);
    this.isPayModalOpen.set(true);
  }

  confirmPayInvoice() {
    const card = this.selectedCardForPay();
    if (!card || !card.currentInvoice) return;

    this.cardsService
      .payInvoice(card.currentInvoice.id, { accountId: this.selectedPayAccountId })
      .subscribe({
        next: () => {
          this.isPayModalOpen.set(false);
          this.toastService.success('Pagamento de fatura realizado com sucesso!');
          this.cardsService.findAll().subscribe();
          this.accountsService.findAll().subscribe();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao pagar fatura.'),
      });
  }
}
