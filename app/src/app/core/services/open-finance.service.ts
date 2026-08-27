import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { OpenFinanceConnection } from '../models';
import { environment } from '../../../environments/environment';

export interface PluggyConnectOptions {
  onSuccess: (data: { item: { id: string } }) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class OpenFinanceService {
  private http = inject(HttpClient);
  private get apiUrl() {
    return `${environment.apiUrl}/open-finance`;
  }

  private _connections = signal<OpenFinanceConnection[]>([]);
  readonly connections = this._connections.asReadonly();

  private _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  /**
   * Obtém o token efêmero de conexão
   */
  getConnectToken(itemId?: string): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/connect-token`, { itemId });
  }

  /**
   * Lista todas as conexões bancárias ativas do usuário
   */
  getConnections(): Observable<OpenFinanceConnection[]> {
    this._loading.set(true);
    return this.http.get<OpenFinanceConnection[]>(`${this.apiUrl}/connections`).pipe(
      tap({
        next: (items) => {
          this._connections.set(items);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  /**
   * Força a sincronização imediata de um banco (Item)
   */
  syncConnection(itemId: string): Observable<{ message: string; connectionId: string; totalSyncedTransactions: number }> {
    return this.http.post<{ message: string; connectionId: string; totalSyncedTransactions: number }>(
      `${this.apiUrl}/connections/sync/${itemId}`,
      {},
    );
  }

  /**
   * Desconecta um banco
   */
  deleteConnection(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/connections/${id}`).pipe(
      tap(() => {
        this._connections.update((items) => items.filter((i) => i.id !== id));
      }),
    );
  }

  /**
   * Inicializa o widget oficial do Pluggy Connect utilizando o SDK oficial
   */
  async openPluggyConnect(connectToken: string, options: PluggyConnectOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Import dinâmico do SDK oficial para compatibilidade perfeita com SSR
      const { PluggyConnect } = await import('pluggy-connect-sdk');

      const pluggyConnect = new PluggyConnect({
        connectToken,
        includeSandbox: true,
        theme: 'dark',
        onSuccess: (data: any) => {
          options.onSuccess(data);
        },
        onError: (err: any) => {
          if (options.onError) options.onError(err);
        },
        onClose: () => {
          if (options.onClose) options.onClose();
        },
      });

      await pluggyConnect.init();
    } catch (error) {
      console.error('Erro ao inicializar PluggyConnect SDK:', error);
      if (options.onError) options.onError(error);
    }
  }
}
