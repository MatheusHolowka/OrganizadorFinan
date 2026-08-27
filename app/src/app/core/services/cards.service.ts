import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CreditCard } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/credit-cards`; }

  private _cards = signal<CreditCard[]>([]);
  private _loading = signal<boolean>(false);

  readonly cards = this._cards.asReadonly();
  readonly loading = this._loading.asReadonly();

  findAll(): Observable<CreditCard[]> {
    this._loading.set(true);
    return this.http.get<CreditCard[]>(this.apiUrl).pipe(
      tap({
        next: (cards) => {
          this._cards.set(cards);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  findOne(id: string): Observable<CreditCard> {
    return this.http.get<CreditCard>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<CreditCard> {
    return this.http.post<CreditCard>(this.apiUrl, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleArchive(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/toggle-archive`, {});
  }

  createTransaction(cardId: string, data: { description: string; totalAmount: number; purchaseDate: string; installments?: number; categoryId?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${cardId}/transactions`, data);
  }

  payInvoice(invoiceId: string, data: { accountId: string; amount?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices/${invoiceId}/pay`, data);
  }

  deleteTransaction(transactionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transactions/${transactionId}`);
  }
}
