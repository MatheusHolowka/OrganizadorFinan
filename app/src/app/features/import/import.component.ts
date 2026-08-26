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
    <div class="h-screen flex flex-col overflow-hidden bg-black text-[#ededed] font-sans">
      <app-header class="shrink-0 z-30" />

      <div class="flex-1 flex overflow-hidden min-h-0 pb-16 md:pb-0">
        <app-sidebar class="shrink-0 overflow-y-auto hidden md:block border-r border-neutral-800" />

        <main class="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
          <!-- Cabeçalho -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-white tracking-tight">Importação de Extratos</h1>
                <span class="px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800 text-xs font-mono">
                  Deduplicação FITID
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Upload de arquivos <strong>.OFX</strong> ou <strong>.CSV</strong> bancários com neutralização de duplicatas
              </p>
            </div>
          </div>

          <!-- Card de Upload e Configuração -->
          @if (!preview()) {
            <div class="max-w-xl mx-auto space-y-5">
              <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 space-y-4">
                <div>
                  <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1.5">
                    1. Conta Bancária de Destino
                  </label>
                  <div class="relative">
                    <select
                      [(ngModel)]="selectedAccountId"
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

                <div>
                  <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1.5">
                    2. Arquivo .OFX ou .CSV (Nubank, Itaú, Inter, Sicredi...)
                  </label>
                  <div
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                    class="border border-dashed border-neutral-800 hover:border-neutral-600 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-black relative"
                  >
                    <input
                      type="file"
                      accept=".ofx,.csv"
                      (change)="onFileSelected($event)"
                      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />

                    <div class="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center mb-2.5">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    @if (selectedFile(); as file) {
                      <p class="text-xs font-mono font-bold text-white">{{ file.name }}</p>
                      <p class="text-[10px] text-neutral-500 mt-0.5">Clique para alterar o arquivo</p>
                    } @else {
                      <p class="text-xs font-medium text-neutral-300">Arraste seu arquivo aqui ou clique para selecionar</p>
                      <p class="text-[10px] font-mono text-neutral-500 mt-1">Formatos aceitos: .OFX ou .CSV</p>
                    }
                  </div>
                </div>

                <button
                  (click)="uploadAndParse()"
                  [disabled]="!selectedFile() || !selectedAccountId || loading()"
                  class="w-full py-3 rounded-xl btn-vercel-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  @if (loading()) {
                    <div class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Processando extrato...</span>
                  } @else {
                    <span>Analisar e Pré-Visualizar</span>
                  }
                </button>
              </div>
            </div>
          } @else {
            <!-- Preview dos Dados Importados -->
            @if (preview(); as p) {
              <div class="space-y-4 animate-fade-in">
                @if (p.isDuplicateBatch) {
                  <div class="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 text-amber-300 text-xs flex items-start gap-2.5">
                    <span class="text-sm">⚠️</span>
                    <div>
                      <h4 class="font-bold text-white">Aviso de Conciliação</h4>
                      <p class="text-neutral-400 mt-0.5">
                        Transações repetidas foram identificadas e desmarcadas automaticamente pela trava anti-duplicidade.
                      </p>
                    </div>
                  </div>
                }

                <!-- Barra de Ações Rápidas -->
                <div class="p-4 rounded-2xl bg-[#0c0c0e] border border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                  <div class="flex items-center gap-3">
                    <span class="text-neutral-300">
                      <strong>{{ countSelectedItems() }}</strong> de <strong>{{ p.totalItems }}</strong> selecionados
                    </span>
                    @if (countDuplicateItems() > 0) {
                      <span class="px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/50 text-[10px]">
                        {{ countDuplicateItems() }} duplicatas neutralizadas
                      </span>
                    }
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      (click)="selectAllNew()"
                      class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors cursor-pointer"
                    >
                      Apenas Novos
                    </button>
                    <button
                      (click)="selectAll(true)"
                      class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors cursor-pointer"
                    >
                      Marcar Todos
                    </button>
                    <button
                      (click)="selectAll(false)"
                      class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors cursor-pointer"
                    >
                      Desmarcar Todos
                    </button>
                    <button
                      (click)="cancelPreview()"
                      class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-white text-xs border border-neutral-800 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      (click)="confirmImport()"
                      [disabled]="loading() || countSelectedItems() === 0"
                      class="px-4 py-1.5 btn-vercel-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      @if (loading()) {
                        <div class="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Salvando...</span>
                      } @else {
                        <span>Confirmar Importação</span>
                      }
                    </button>
                  </div>
                </div>

                <!-- Tabela de Itens para Revisão -->
                <div class="p-6 rounded-2xl bg-[#0c0c0e] border border-neutral-800 overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs font-mono">
                      <thead class="text-neutral-500 border-b border-neutral-800 uppercase text-[10px]">
                        <tr>
                          <th class="pb-3 w-8">Imp.</th>
                          <th class="pb-3 font-medium">Data</th>
                          <th class="pb-3 font-medium">Descrição</th>
                          <th class="pb-3 font-medium">Categoria Sugerida</th>
                          <th class="pb-3 font-medium text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-neutral-850 text-neutral-300">
                        @for (item of p.items; track item.id) {
                          <tr
                            class="transition-colors"
                            [ngClass]="item.isDuplicate ? 'opacity-60 bg-rose-950/10' : 'hover:bg-neutral-900/40'"
                          >
                            <td class="py-3">
                              <input
                                type="checkbox"
                                [(ngModel)]="item.shouldImport"
                                class="w-3.5 h-3.5 rounded bg-black border-neutral-800 text-white cursor-pointer"
                              />
                            </td>
                            <td class="py-3 text-neutral-500 whitespace-nowrap">{{ item.date | date:'dd/MM/yyyy' }}</td>
                            <td class="py-3 font-sans">
                              <div class="flex items-center gap-2">
                                <span
                                  class="w-1.5 h-1.5 rounded-full shrink-0"
                                  [ngClass]="item.type === 'INCOME' ? 'bg-emerald-400' : 'bg-rose-400'"
                                ></span>
                                <input
                                  type="text"
                                  [(ngModel)]="item.description"
                                  class="w-full max-w-xs px-2 py-1 rounded bg-black border border-neutral-800 text-white text-xs focus:border-neutral-500 focus:outline-none"
                                />
                                @if (item.isDuplicate) {
                                  <span class="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900/50 text-[9px] font-mono font-bold shrink-0">
                                    DUPLICATA
                                  </span>
                                }
                              </div>
                            </td>
                            <td class="py-3">
                              <div class="relative max-w-[180px]">
                                <select
                                  [(ngModel)]="item.categoryId"
                                  class="w-full appearance-none pl-2.5 pr-7 py-1 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:border-neutral-500 focus:outline-none cursor-pointer"
                                >
                                  <option value="" class="bg-neutral-900 text-white">Sem categoria</option>
                                  @for (cat of categories(); track cat.id) {
                                    <option [value]="cat.id" class="bg-neutral-900 text-white">{{ cat.name }}</option>
                                  }
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </td>
                            <td
                              class="py-3 text-right font-bold whitespace-nowrap"
                              [ngClass]="item.type === 'INCOME' ? 'text-emerald-400' : 'text-white'"
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
          `${previewData.totalItems} lançamentos lidos (${previewData.totalDuplicates} duplicatas neutralizadas).`,
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
