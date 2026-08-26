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
import { Account, Category, CreditCard, CreditCardInvoice, CreditCardTransaction } from '../../core/models';

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
    <div class="h-screen flex flex-col overflow-hidden bg-black text-[#ededed] font-sans">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-neutral-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white tracking-tight">Cartões & Faturas</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono">
                  Cascata de Parcelas 36x
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">Gestão de limites, extrato de faturas e projeção mês a mês de parcelas</p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <button
                (click)="openNewCardModal()"
                class="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium transition-all cursor-pointer"
              >
                + Novo Cartão
              </button>

              <button
                (click)="openPurchaseModal()"
                [disabled]="cardsService.cards().length === 0"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Lançar Compra</span>
              </button>
            </div>
          </div>

          @if (cardsService.loading() && !selectedCardDetail()) {
            <div class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
            </div>
          } @else if (cardsService.cards().length === 0) {
            <!-- Empty State -->
            <div class="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-3">
              <div class="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center text-lg">
                💳
              </div>
              <h3 class="text-sm font-bold text-white">Nenhum cartão de crédito cadastrado</h3>
              <p class="text-xs text-neutral-500 max-w-sm mx-auto">
                Cadastre seus cartões para calcular ciclos de corte, extratos de faturas e parcelamentos futuros.
              </p>
              <button
                (click)="openNewCardModal()"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold cursor-pointer"
              >
                Cadastrar Primeiro Cartão
              </button>
            </div>
          } @else {
            <!-- SELEÇÃO DE CARTÕES (CARDS HORIZONTAIS) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (card of cardsService.cards(); track card.id) {
                <div
                  (click)="selectCard(card.id)"
                  class="p-5 rounded-2xl bg-[#0c0c0e] border transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  [ngClass]="selectedCardId() === card.id ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.06)]' : 'border-neutral-800 hover:border-neutral-700'"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">Cartão de Crédito</span>
                      <h3 class="text-base font-bold text-white mt-0.5">{{ card.name }}</h3>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold text-neutral-300 uppercase">
                      {{ card.brand }}
                    </span>
                  </div>

                  <div class="space-y-2 font-mono">
                    <div>
                      <span class="text-[10px] text-neutral-400 uppercase">Fatura Atual:</span>
                      <div class="text-xl font-bold text-white">
                        {{ card.currentInvoiceAmount | currencyBrl }}
                      </div>
                    </div>

                    <!-- Barra de Limite -->
                    <div>
                      <div class="flex justify-between text-[10px] text-neutral-500 mb-1">
                        <span>Disp: {{ card.availableLimit | currencyBrl }}</span>
                        <span>Limite: {{ card.limit | currencyBrl }}</span>
                      </div>
                      <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-white rounded-full transition-all duration-300"
                          [style.width.%]="card.limit > 0 ? (card.availableLimit / card.limit) * 100 : 0"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div class="pt-2.5 border-t border-neutral-850 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>Corte dia <strong>{{ card.closingDay }}</strong></span>
                    <span>Venc. dia <strong>{{ card.dueDay }}</strong></span>
                  </div>
                </div>
              }
            </div>

            <!-- DETALHES DO CARTÃO SELECIONADO & EXTRATO DE FATURA -->
            @if (selectedCardDetail(); as card) {
              <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-6">
                <!-- Cabeçalho do Extrato -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-850">
                  <div>
                    <span class="text-[10px] uppercase font-mono text-neutral-500 font-bold">Extrato de Faturas</span>
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                      <span>{{ card.name }}</span>
                      <span class="text-xs font-normal text-neutral-400 font-mono">({{ card.brand }})</span>
                    </h2>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <!-- Seletor de Faturas (Ciclos) -->
                    <div class="relative">
                      <select
                        [ngModel]="selectedInvoiceId()"
                        (ngModelChange)="onSelectInvoice($event)"
                        class="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500 cursor-pointer"
                      >
                        @for (inv of card.invoices; track inv.id) {
                          <option [value]="inv.id" class="bg-neutral-900 text-white">
                            {{ getInvoiceMonthName(inv.referenceMonth) }}/{{ inv.referenceYear }} — {{ inv.totalAmount | currencyBrl }} ({{ getInvoiceStatusLabel(inv.status) }})
                          </option>
                        }
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    @if (selectedInvoice(); as inv) {
                      <button
                        (click)="openPayInvoiceModal(card, inv)"
                        [disabled]="inv.status === 'PAID' || inv.totalAmount <= 0"
                        class="px-4 py-2 btn-vercel-primary text-xs font-semibold cursor-pointer disabled:opacity-30"
                      >
                        {{ inv.status === 'PAID' ? 'Fatura Paga' : 'Pagar Fatura (' + (inv.totalAmount | currencyBrl) + ')' }}
                      </button>
                    }

                    <button
                      (click)="deleteCard(card)"
                      class="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 border border-neutral-800 transition-colors cursor-pointer"
                      title="Excluir Cartão"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Resumo da Fatura Selecionada -->
                @if (selectedInvoice(); as inv) {
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div class="p-3.5 rounded-xl bg-black border border-neutral-850">
                      <span class="text-[10px] text-neutral-500 uppercase">Ciclo de Referência</span>
                      <div class="text-sm font-bold text-white mt-0.5">
                        {{ getInvoiceMonthName(inv.referenceMonth) }} de {{ inv.referenceYear }}
                      </div>
                    </div>
                    <div class="p-3.5 rounded-xl bg-black border border-neutral-850">
                      <span class="text-[10px] text-neutral-500 uppercase">Status</span>
                      <div class="text-sm font-bold mt-0.5" [ngClass]="inv.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'">
                        {{ getInvoiceStatusLabel(inv.status) }}
                      </div>
                    </div>
                    <div class="p-3.5 rounded-xl bg-black border border-neutral-850">
                      <span class="text-[10px] text-neutral-500 uppercase">Total da Fatura</span>
                      <div class="text-sm font-bold text-white mt-0.5">
                        {{ inv.totalAmount | currencyBrl }}
                      </div>
                    </div>
                    <div class="p-3.5 rounded-xl bg-black border border-neutral-850">
                      <span class="text-[10px] text-neutral-500 uppercase">Lançamentos / Compras</span>
                      <div class="text-sm font-bold text-white mt-0.5">
                        {{ inv.transactions?.length || 0 }} compras
                      </div>
                    </div>
                  </div>

                  <!-- Tabela de Lançamentos da Fatura -->
                  <div>
                    <h3 class="text-xs font-mono uppercase text-neutral-400 mb-3">Compras e Parcelas nesta Fatura</h3>

                    @if (!inv.transactions || inv.transactions.length === 0) {
                      <div class="text-center py-10 text-neutral-500 text-xs font-mono border border-dashed border-neutral-850 rounded-xl space-y-2">
                        <p>Nenhuma compra lançada nesta fatura.</p>
                        <button
                          (click)="openPurchaseModal(card.id)"
                          class="text-white underline hover:text-neutral-300 cursor-pointer"
                        >
                          Lançar Compra neste Cartão
                        </button>
                      </div>
                    } @else {
                      <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs font-mono">
                          <thead class="text-neutral-500 border-b border-neutral-800 uppercase text-[10px]">
                            <tr>
                              <th class="pb-3 font-medium">Data Compra</th>
                              <th class="pb-3 font-medium">Descrição</th>
                              <th class="pb-3 font-medium">Categoria</th>
                              <th class="pb-3 font-medium">Parcela</th>
                              <th class="pb-3 font-medium text-right">Valor Parcela</th>
                              <th class="pb-3 font-medium text-right">Valor Total Compra</th>
                              <th class="pb-3 font-medium text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-neutral-850 text-neutral-300">
                            @for (tx of inv.transactions; track tx.id) {
                              <tr class="hover:bg-neutral-900/40 transition-colors">
                                <td class="py-3.5 text-neutral-500">{{ tx.purchaseDate | date:'dd/MM/yyyy' }}</td>
                                <td class="py-3.5 font-sans font-medium text-white">
                                  {{ tx.description }}
                                </td>
                                <td class="py-3.5 text-neutral-400">
                                  <span class="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px]">
                                    {{ tx.category?.name || 'Geral' }}
                                  </span>
                                </td>
                                <td class="py-3.5 text-neutral-400">
                                  <span class="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-bold">
                                    {{ tx.totalInstallments > 1 ? tx.installmentNumber + '/' + tx.totalInstallments : 'À vista' }}
                                  </span>
                                </td>
                                <td class="py-3.5 text-right font-bold text-white">
                                  {{ tx.installmentAmount | currencyBrl }}
                                </td>
                                <td class="py-3.5 text-right text-neutral-500">
                                  {{ tx.totalAmount | currencyBrl }}
                                </td>
                                <td class="py-3.5 text-right">
                                  <button
                                    (click)="deleteTransaction(tx)"
                                    title="Excluir Lançamento da Fatura"
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

                <!-- CASCATA / WATERFALL DE FATURAS FUTURAS PROJETADAS -->
                <div class="pt-5 border-t border-neutral-850">
                  <h3 class="text-xs font-mono uppercase text-neutral-400 mb-3">Cascata de Comprometimento Futuro (Próximos Meses)</h3>
                  <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 font-mono text-xs">
                    @for (inv of card.invoices; track inv.id) {
                      <div
                        (click)="onSelectInvoice(inv.id)"
                        class="p-3 rounded-xl bg-black border transition-all cursor-pointer text-center space-y-1"
                        [ngClass]="selectedInvoiceId() === inv.id ? 'border-white bg-neutral-950' : 'border-neutral-850 hover:border-neutral-700'"
                      >
                        <div class="text-[10px] text-neutral-500 uppercase">{{ getInvoiceMonthName(inv.referenceMonth) }}/{{ inv.referenceYear }}</div>
                        <div class="text-xs font-bold text-white">{{ inv.totalAmount | currencyBrl }}</div>
                        <div class="text-[9px]" [ngClass]="inv.status === 'PAID' ? 'text-emerald-400' : 'text-neutral-400'">
                          {{ getInvoiceStatusLabel(inv.status) }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          }
        </main>
      </div>

      <!-- Modal Novo Cartão -->
      <app-modal
        [isOpen]="isNewCardModalOpen()"
        title="Cadastrar Cartão de Crédito"
        (close)="isNewCardModalOpen.set(false)"
      >
        <form [formGroup]="cardForm" (ngSubmit)="submitNewCard()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Nome do Cartão</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Nubank Ultravioleta, Itaú Black, Sicredi Gold"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Bandeira</label>
              <div class="relative">
                <select
                  formControlName="brand"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  <option value="MASTERCARD" class="bg-neutral-900 text-white">Mastercard</option>
                  <option value="VISA" class="bg-neutral-900 text-white">Visa</option>
                  <option value="ELO" class="bg-neutral-900 text-white">Elo</option>
                  <option value="AMEX" class="bg-neutral-900 text-white">American Express</option>
                  <option value="HIPERCARD" class="bg-neutral-900 text-white">Hipercard</option>
                  <option value="OTHER" class="bg-neutral-900 text-white">Outra</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Limite (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="limit"
                placeholder="5000.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Dia Fechamento (Corte)</label>
              <input
                type="number"
                min="1"
                max="31"
                formControlName="closingDay"
                placeholder="Ex: 25"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Dia Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                formControlName="dueDay"
                placeholder="Ex: 5"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              (click)="isNewCardModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              [disabled]="cardForm.invalid || submittingCard()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (submittingCard()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              }
              <span>Cadastrar Cartão</span>
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Nova Compra / Parcelamento -->
      <app-modal
        [isOpen]="isPurchaseModalOpen()"
        title="Lançar Compra no Cartão"
        (close)="isPurchaseModalOpen.set(false)"
      >
        <form [formGroup]="purchaseForm" (ngSubmit)="submitPurchase()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Cartão de Crédito</label>
            <div class="relative">
              <select
                formControlName="cardId"
                class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
              >
                @for (card of cardsService.cards(); track card.id) {
                  <option [value]="card.id" class="bg-neutral-900 text-white">{{ card.name }} (Fecha dia {{ card.closingDay }})</option>
                }
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1.5">Descrição da Compra</label>
            <input
              type="text"
              formControlName="description"
              placeholder="Ex: Notebook Dell, Supermercado, Passagem Aérea"
              class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Valor Total da Compra (R$)</label>
              <input
                type="number"
                step="0.01"
                formControlName="totalAmount"
                placeholder="0.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Nº de Parcelas</label>
              <input
                type="number"
                min="1"
                max="36"
                formControlName="installments"
                placeholder="1"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Data da Compra</label>
              <input
                type="date"
                formControlName="purchaseDate"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Categoria</label>
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
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              (click)="isPurchaseModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              [disabled]="purchaseForm.invalid || submittingPurchase()"
              class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (submittingPurchase()) {
                <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              }
              <span>Lançar e Projetar Parcelas</span>
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Pagar Fatura -->
      <app-modal
        [isOpen]="isPayModalOpen()"
        title="Pagar Fatura de Cartão"
        (close)="isPayModalOpen.set(false)"
      >
        @if (selectedCardForPay(); as card) {
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-black border border-neutral-800 font-mono">
              <div class="text-[10px] text-neutral-500 uppercase">Cartão / Fatura</div>
              <div class="text-sm font-bold text-white font-sans">{{ card.name }}</div>
              <div class="text-sm font-bold text-rose-400 mt-1">
                Valor a Pagar: {{ (selectedInvoiceForPay()?.totalAmount || card.currentInvoiceAmount) | currencyBrl }}
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">Conta Bancária para Débito</label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedPayAccountId"
                  class="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  @for (acc of accounts(); track acc.id) {
                    <option [value]="acc.id" class="bg-neutral-900 text-white">{{ acc.name }} (Saldo: {{ acc.currentBalance | currencyBrl }})</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-500">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                (click)="isPayModalOpen.set(false)"
                class="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                (click)="confirmPayInvoice()"
                [disabled]="!selectedPayAccountId || payingInvoice()"
                class="px-4 py-2 btn-vercel-primary text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                @if (payingInvoice()) {
                  <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                }
                <span>Confirmar Pagamento</span>
              </button>
            </div>
          </div>
        }
      </app-modal>

      <app-bottom-nav />
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

  selectedCardId = signal<string | null>(null);
  selectedCardDetail = signal<CreditCard | null>(null);
  selectedInvoiceId = signal<string | null>(null);
  selectedInvoice = signal<CreditCardInvoice | null>(null);

  isNewCardModalOpen = signal(false);
  isPurchaseModalOpen = signal(false);
  isPayModalOpen = signal(false);

  submittingCard = signal(false);
  submittingPurchase = signal(false);
  payingInvoice = signal(false);

  selectedCardForPay = signal<CreditCard | null>(null);
  selectedInvoiceForPay = signal<CreditCardInvoice | null>(null);
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
    this.loadCards();
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

  loadCards(selectCardId?: string) {
    this.cardsService.findAll().subscribe((cards) => {
      if (cards.length > 0) {
        const idToSelect = selectCardId || this.selectedCardId() || cards[0].id;
        this.selectCard(idToSelect);
      } else {
        this.selectedCardId.set(null);
        this.selectedCardDetail.set(null);
        this.selectedInvoice.set(null);
      }
    });
  }

  selectCard(cardId: string) {
    this.selectedCardId.set(cardId);
    this.cardsService.findOne(cardId).subscribe({
      next: (cardDetail) => {
        this.selectedCardDetail.set(cardDetail);
        if (cardDetail.invoices && cardDetail.invoices.length > 0) {
          // Selecionar a primeira fatura (normalmente a mais recente ou aberta)
          const invId = this.selectedInvoiceId() && cardDetail.invoices.some((i) => i.id === this.selectedInvoiceId())
            ? this.selectedInvoiceId()!
            : cardDetail.invoices[0].id;
          this.onSelectInvoice(invId);
        } else {
          this.selectedInvoice.set(null);
        }
      },
    });
  }

  onSelectInvoice(invoiceId: string) {
    this.selectedInvoiceId.set(invoiceId);
    const card = this.selectedCardDetail();
    if (card && card.invoices) {
      const inv = card.invoices.find((i) => i.id === invoiceId) || card.invoices[0];
      this.selectedInvoice.set(inv);
    }
  }

  openNewCardModal() {
    this.cardForm.reset({ brand: 'MASTERCARD', limit: 5000, closingDay: 25, dueDay: 5 });
    this.isNewCardModalOpen.set(true);
  }

  openPurchaseModal(cardId?: string) {
    const cards = this.cardsService.cards();
    if (cards.length > 0) {
      this.purchaseForm.patchValue({
        cardId: cardId || this.selectedCardId() || cards[0].id,
        purchaseDate: new Date().toISOString().substring(0, 10),
        installments: 1,
      });
      this.isPurchaseModalOpen.set(true);
    }
  }

  submitNewCard() {
    if (this.cardForm.invalid) return;

    this.submittingCard.set(true);
    this.cardsService.create(this.cardForm.value).subscribe({
      next: (newCard) => {
        this.submittingCard.set(false);
        this.isNewCardModalOpen.set(false);
        this.toastService.success('Cartão de crédito cadastrado com sucesso!');
        this.loadCards(newCard.id);
      },
      error: (err) => {
        this.submittingCard.set(false);
        this.toastService.error(err.error?.message || 'Erro ao cadastrar cartão.');
      },
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
          this.loadCards();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao excluir cartão.'),
      });
    }
  }

  submitPurchase() {
    if (this.purchaseForm.invalid) return;

    this.submittingPurchase.set(true);
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
          this.submittingPurchase.set(false);
          this.isPurchaseModalOpen.set(false);
          this.purchaseForm.reset({
            installments: 1,
            purchaseDate: new Date().toISOString().substring(0, 10),
          });
          this.toastService.success('Compra lançada e parcelas distribuídas na cascata!');
          this.loadCards(val.cardId!);
        },
        error: (err) => {
          this.submittingPurchase.set(false);
          this.toastService.error(err.error?.message || 'Erro ao lançar compra.');
        },
      });
  }

  async deleteTransaction(tx: CreditCardTransaction) {
    const confirmed = await this.dialogService.confirm({
      title: 'Excluir Lançamento da Fatura',
      message: `Deseja remover "${tx.description}" (${tx.installmentAmount} R$) desta fatura?`,
      confirmText: 'Sim, Remover',
      cancelText: 'Cancelar',
      type: 'danger',
    });

    if (confirmed) {
      this.cardsService.deleteTransaction(tx.id).subscribe({
        next: () => {
          this.toastService.success('Lançamento removido da fatura.');
          if (this.selectedCardId()) {
            this.selectCard(this.selectedCardId()!);
          }
          this.cardsService.findAll().subscribe();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Erro ao excluir lançamento.'),
      });
    }
  }

  openPayInvoiceModal(card: CreditCard, invoice?: CreditCardInvoice) {
    this.selectedCardForPay.set(card);
    this.selectedInvoiceForPay.set(invoice || card.currentInvoice || null);
    this.isPayModalOpen.set(true);
  }

  confirmPayInvoice() {
    const card = this.selectedCardForPay();
    const invoice = this.selectedInvoiceForPay() || card?.currentInvoice;
    if (!card || !invoice) return;

    this.payingInvoice.set(true);
    this.cardsService
      .payInvoice(invoice.id, { accountId: this.selectedPayAccountId })
      .subscribe({
        next: () => {
          this.payingInvoice.set(false);
          this.isPayModalOpen.set(false);
          this.toastService.success('Fatura paga com sucesso!');
          this.loadCards(card.id);
          this.accountsService.findAll().subscribe();
        },
        error: (err) => {
          this.payingInvoice.set(false);
          this.toastService.error(err.error?.message || 'Erro ao pagar fatura.');
        },
      });
  }

  getInvoiceMonthName(monthNumber: number): string {
    const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return names[monthNumber - 1] || `${monthNumber}`;
  }

  getInvoiceStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN': return 'Aberta';
      case 'CLOSED': return 'Fechada';
      case 'PAID': return 'Paga';
      case 'OVERDUE': return 'Atrasada';
      default: return status;
    }
  }
}
