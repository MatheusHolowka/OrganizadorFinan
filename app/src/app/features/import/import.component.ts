import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ImportService } from '../../core/services/import.service';
import { AccountsService } from '../../core/services/accounts.service';
import { CategoriesService } from '../../core/services/categories.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { Account, Category, ImportBatchPreview, ImportItem } from '../../core/models';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyBrlPipe,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
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
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white font-display">Motor de Importação Inteligente</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold flex items-center gap-1">
                  <span>✨</span>
                  <span>Anti-Duplicidade & Auto-Categorização</span>
                </span>
              </div>
              <p class="text-xs md:text-sm text-surface-400 mt-0.5">
                Upload de arquivos <strong>.OFX</strong> ou <strong>.CSV</strong> com limpeza de descrições e bloqueio de lançamentos repetidos.
              </p>
            </div>
          </div>

          <!-- Card de Upload e Configuração -->
          @if (!preview()) {
            <div class="max-w-2xl mx-auto space-y-6">
              <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-surface-300 uppercase mb-1.5">
                    1. Selecione a Conta Bancária de Destino
                  </label>
                  <div class="relative">
                    <select
                      [(ngModel)]="selectedAccountId"
                      class="w-full appearance-none pl-4 pr-10 py-3 rounded-2xl bg-surface-950 border border-surface-700 text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      @for (acc of accounts(); track acc.id) {
                        <option [value]="acc.id" class="bg-surface-900 text-white">{{ acc.name }} (Saldo atual: {{ acc.currentBalance | currencyBrl }})</option>
                      }
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-surface-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-surface-300 uppercase mb-1.5">
                    2. Envie o Arquivo .OFX ou .CSV (Ex: Sicredi, Nubank, Itaú)
                  </label>
                  <div
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                    class="border-2 border-dashed border-surface-700 hover:border-brand-500 rounded-3xl p-8 text-center transition-colors cursor-pointer bg-surface-950/40 relative"
                  >
                    <input
                      type="file"
                      accept=".ofx,.csv"
                      (change)="onFileSelected($event)"
                      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />

                    <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 mx-auto flex items-center justify-center mb-3">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    @if (selectedFile(); as file) {
                      <p class="text-sm font-bold text-white">{{ file.name }}</p>
                      <p class="text-xs text-surface-400 mt-1">Clique para trocar de arquivo</p>
                    } @else {
                      <p class="text-sm font-semibold text-surface-200">Arraste seu arquivo aqui ou clique para selecionar</p>
                      <p class="text-xs text-surface-500 mt-1">Extensões aceitas: .OFX e .CSV</p>
                    }
                  </div>
                </div>

                <button
                  (click)="uploadAndParse()"
                  [disabled]="!selectedFile() || !selectedAccountId || loading()"
                  class="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  @if (loading()) {
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processando e Normalizando...</span>
                  } @else {
                    <span>🚀</span>
                    <span>Analisar e Pré-Visualizar Extrato</span>
                  }
                </button>
              </div>

              <!-- Dicas de Formato -->
              <div class="p-5 rounded-3xl bg-surface-900/40 border border-surface-800/80 space-y-2 text-xs text-surface-400">
                <div class="flex items-center gap-2 text-surface-200 font-semibold">
                  <span>💡</span>
                  <span>Dica de Compatibilidade:</span>
                </div>
                <p>
                  O motor detecta automaticamente colunas de data, valor, código de transação e identificadores únicos de qualquer banco.
                </p>
              </div>
            </div>
          } @else {
            <!-- Preview dos Dados Importados -->
            @if (preview(); as p) {
              <div class="space-y-6 animate-fade-in">
                <!-- Alerta de Lote ou Duplicatas -->
                @if (p.isDuplicateBatch) {
                  <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
                    <span class="text-xl">⚠️</span>
                    <div>
                      <h4 class="text-sm font-bold text-white">Aviso de Lote já Importado</h4>
                      <p class="text-xs mt-0.5">
                        Detectamos que este arquivo ou suas transações já foram conciliadas anteriormente. Os lançamentos repetidos vêm desmarcados por padrão.
                      </p>
                    </div>
                  </div>
                }

                <!-- Barra de Ações Rápidas -->
                <div class="p-4 rounded-3xl bg-surface-900/80 border border-surface-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-surface-300">
                      <strong>{{ countSelectedItems() }}</strong> de <strong>{{ p.totalItems }}</strong> selecionados
                    </span>
                    @if (countDuplicateItems() > 0) {
                      <span class="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">
                        {{ countDuplicateItems() }} já importados
                      </span>
                    }
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      (click)="selectAllNew()"
                      class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-surface-700 transition-colors"
                    >
                      Selecionar Apenas Novos
                    </button>
                    <button
                      (click)="selectAll(true)"
                      class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-surface-700 transition-colors"
                    >
                      Marcar Todos
                    </button>
                    <button
                      (click)="selectAll(false)"
                      class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-surface-700 transition-colors"
                    >
                      Desmarcar Todos
                    </button>
                    <button
                      (click)="cancelPreview()"
                      class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      (click)="confirmImport()"
                      [disabled]="loading() || countSelectedItems() === 0"
                      class="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                    >
                      @if (loading()) {
                        <div class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                        <span>Salvando...</span>
                      } @else {
                        <span>Confirmar e Importar</span>
                      }
                    </button>
                  </div>
                </div>

                <!-- Tabela de Itens para Revisão -->
                <div class="p-6 rounded-3xl bg-surface-900/70 border border-surface-800 backdrop-blur-sm overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="text-surface-400 border-b border-surface-800 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th class="pb-3 w-8">Imp.</th>
                          <th class="pb-3 font-semibold">Data</th>
                          <th class="pb-3 font-semibold">Descrição Normalizada</th>
                          <th class="pb-3 font-semibold">Categoria Sugerida</th>
                          <th class="pb-3 font-semibold text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-surface-800/60">
                        @for (item of p.items; track item.id) {
                          <tr
                            class="transition-colors"
                            [ngClass]="item.isDuplicate ? 'bg-surface-950/40 opacity-75' : 'hover:bg-surface-800/30'"
                          >
                            <td class="py-3.5">
                              <input
                                type="checkbox"
                                [(ngModel)]="item.shouldImport"
                                class="w-4 h-4 rounded border-surface-700 bg-surface-950 text-brand-500 focus:ring-brand-500/30"
                              />
                            </td>
                            <td class="py-3.5 text-surface-400 whitespace-nowrap">{{ item.date | date:'dd/MM/yyyy' }}</td>
                            <td class="py-3.5">
                              <div class="flex items-center gap-2">
                                <span
                                  class="w-2.5 h-2.5 rounded-full shrink-0"
                                  [ngClass]="item.type === 'INCOME' ? 'bg-emerald-400' : 'bg-rose-400'"
                                ></span>
                                <input
                                  type="text"
                                  [(ngModel)]="item.description"
                                  class="w-full max-w-sm px-2.5 py-1 rounded-lg bg-surface-950 border border-surface-700 text-white text-xs focus:border-brand-500 focus:outline-none"
                                />
                                @if (item.isDuplicate) {
                                  <span class="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold shrink-0">
                                    ⚠️ Já Importado
                                  </span>
                                }
                              </div>
                              <div class="text-[10px] text-surface-500 mt-0.5 pl-4 truncate max-w-md" title="{{ item.memo }}">
                                Original: {{ item.memo }}
                              </div>
                            </td>
                            <td class="py-3.5">
                              <div class="flex items-center gap-1.5 mb-1">
                                <span class="text-[10px] text-surface-400">Sugestão:</span>
                                <span class="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px] font-semibold border border-brand-500/20">
                                  {{ item.suggestedCategoryName || 'Geral' }}
                                </span>
                              </div>
                              <div class="relative max-w-[200px]">
                                <select
                                  [(ngModel)]="item.categoryId"
                                  class="w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-xl bg-surface-950 border border-surface-700 text-white text-xs focus:border-brand-500 focus:outline-none cursor-pointer"
                                >
                                  <option value="" class="bg-surface-900 text-white">Sem categoria</option>
                                  @for (cat of categories(); track cat.id) {
                                    <option [value]="cat.id" class="bg-surface-900 text-white">{{ cat.name }}</option>
                                  }
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-surface-400">
                                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </td>
                            <td
                              class="py-3.5 text-right font-bold text-sm whitespace-nowrap"
                              [ngClass]="item.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'"
                            >
                              {{ item.type === 'EXPENSE' ? '-' : '+' }}{{ item.amount | currencyBrl }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          }
        </main>
      </div>

      <app-bottom-nav />
    </div>
  `,
})
export class ImportComponent implements OnInit {
  importService = inject(ImportService);
  accountsService = inject(AccountsService);
  categoriesService = inject(CategoriesService);
  toastService = inject(ToastService);
  http = inject(HttpClient);
  router = inject(Router);

  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  selectedAccountId = '';
  selectedFile = signal<File | null>(null);
  preview = signal<ImportBatchPreview | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.accountsService.findAll().subscribe((res) => {
      this.accounts.set(res.accounts);
      if (res.accounts.length > 0) {
        this.selectedAccountId = res.accounts[0].id;
      }
    });
    this.categoriesService.findAll().subscribe((cats) => this.categories.set(cats));
  }

  countSelectedItems(): number {
    const p = this.preview();
    if (!p) return 0;
    return p.items.filter((i) => i.shouldImport).length;
  }

  countDuplicateItems(): number {
    const p = this.preview();
    if (!p) return 0;
    return p.items.filter((i) => i.isDuplicate).length;
  }

  selectAllNew() {
    const p = this.preview();
    if (!p) return;
    p.items.forEach((item) => {
      item.shouldImport = !item.isDuplicate;
    });
  }

  selectAll(status: boolean) {
    const p = this.preview();
    if (!p) return;
    p.items.forEach((item) => {
      item.shouldImport = status;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  uploadAndParse() {
    const file = this.selectedFile();
    if (!file || !this.selectedAccountId) return;

    this.loading.set(true);
    this.importService.uploadFile(this.selectedAccountId, file).subscribe({
      next: (previewData) => {
        previewData.items = previewData.items.map((item) => ({
          ...item,
          shouldImport: !item.isDuplicate,
        }));
        this.preview.set(previewData);
        this.loading.set(false);
        this.toastService.info(
          `${previewData.totalItems} lançamentos lidos com sucesso (${previewData.totalDuplicates} duplicatas identificadas).`,
          'Extrato Analisado'
        );
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Erro ao processar o extrato.');
      },
    });
  }

  cancelPreview() {
    this.preview.set(null);
    this.selectedFile.set(null);
  }

  confirmImport() {
    const p = this.preview();
    if (!p) return;

    const itemsToImport = p.items.filter((item) => item.shouldImport);
    if (itemsToImport.length === 0) {
      this.toastService.warning('Selecione pelo menos um lançamento para importar.');
      return;
    }

    this.loading.set(true);
    this.importService
      .confirmImport({
        batchId: p.batchId,
        accountId: this.selectedAccountId,
        items: itemsToImport.map((item) => ({
          importItemId: item.id,
          description: item.description,
          amount: item.type === 'EXPENSE' ? -Math.abs(item.amount) : Math.abs(item.amount),
          date: item.date,
          categoryId: item.categoryId || undefined,
          shouldImport: true,
        })),
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.toastService.success(res.message, 'Importação Concluída');
          this.router.navigate(['/transactions']);
        },
        error: (err) => {
          this.loading.set(false);
          this.toastService.error(err.error?.message || 'Erro ao conciliar transações.');
        },
      });
  }
}
