import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Transaction } from '../models';
import { environment } from '../../../environments/environment';

export interface TransactionsResponse {
  period: { month: number; year: number };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netPeriod: number;
  };
  transactions: Transaction[];
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/transactions`; }

  private _data = signal<TransactionsResponse | null>(null);
  private _loading = signal<boolean>(false);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();

  findAll(filters?: {
    month?: number;
    year?: number;
    type?: string;
    accountId?: string;
    categoryId?: string;
    search?: string;
    scope?: string;
  }): Observable<TransactionsResponse> {
    this._loading.set(true);
    let params = new HttpParams();

    if (filters) {
      if (filters.month) params = params.set('month', filters.month.toString());
      if (filters.year) params = params.set('year', filters.year.toString());
      if (filters.type) params = params.set('type', filters.type);
      if (filters.accountId) params = params.set('accountId', filters.accountId);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.scope) params = params.set('scope', filters.scope);
    }

    return this.http.get<TransactionsResponse>(this.apiUrl, { params }).pipe(
      tap({
        next: (res) => {
          this._data.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  create(data: any): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }

  update(id: string, data: any): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  clearAll(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/clear-all`);
  }
}
