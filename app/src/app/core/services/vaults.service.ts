import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Vault } from '../models';
import { environment } from '../../../environments/environment';

export interface VaultsResponse {
  summary: {
    totalVaults: number;
    totalTarget: number;
    totalCurrent: number;
    totalIsolated: number;
  };
  vaults: Vault[];
}

@Injectable({
  providedIn: 'root',
})
export class VaultsService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/vaults`; }

  private _data = signal<VaultsResponse | null>(null);
  private _loading = signal<boolean>(false);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();

  findAll(): Observable<VaultsResponse> {
    this._loading.set(true);
    return this.http.get<VaultsResponse>(this.apiUrl).pipe(
      tap({
        next: (res) => {
          this._data.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  findOne(id: string): Observable<Vault> {
    return this.http.get<Vault>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<Vault> {
    return this.http.post<Vault>(this.apiUrl, data);
  }

  update(id: string, data: any): Observable<Vault> {
    return this.http.patch<Vault>(`${this.apiUrl}/${id}`, data);
  }

  createMovement(vaultId: string, data: { type: 'DEPOSIT' | 'WITHDRAWAL'; amount: number; accountId?: string; description?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${vaultId}/movements`, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getRoundUpStats(): Observable<{
    activeVault: { id: string; title: string; step: number; accumulated: number } | null;
    stats: {
      eligibleTxCount: number;
      step: number;
      estimatedMonthly: number;
      estimatedYearly: number;
      acceleratedMonths: number;
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/roundups/stats`);
  }

  toggleRoundUp(vaultId: string, enabled: boolean, step: number = 5): Observable<Vault> {
    return this.http.patch<Vault>(`${this.apiUrl}/${vaultId}/roundup`, { enabled, step });
  }
}

