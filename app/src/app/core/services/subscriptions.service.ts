import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SubscriptionItem {
  id: string;
  name: string;
  merchantName: string;
  amount: number;
  frequency: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  category: string;
  status: 'ACTIVE' | 'FLAGGED_GHOST' | 'CANCELLED';
  icon: string;
  color: string;
  lastBilledAt?: string;
  nextBillingAt?: string;
  autoDetected: boolean;
  notes?: string;
}

export interface SubscriptionsResponse {
  subscriptions: SubscriptionItem[];
  metrics: {
    totalMonthly: number;
    totalYearly: number;
    activeCount: number;
    ghostCount: number;
    totalCount: number;
  };
}

export interface SavingsSimulation {
  monthlySaved: number;
  annualSavedDirect: number;
  futureValue1Year: number;
  futureValue3Years: number;
  futureValue5Years: number;
  futureValue10Years: number;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsService {
  private http = inject(HttpClient);
  private get apiUrl() {
    return `${environment.apiUrl}/subscriptions`;
  }

  private _data = signal<SubscriptionsResponse | null>(null);
  private _loading = signal<boolean>(false);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();

  findAll(): Observable<SubscriptionsResponse> {
    this._loading.set(true);
    return this.http.get<SubscriptionsResponse>(this.apiUrl).pipe(
      tap({
        next: (res) => {
          this._data.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  scan(): Observable<SubscriptionsResponse> {
    this._loading.set(true);
    return this.http.post<SubscriptionsResponse>(`${this.apiUrl}/scan`, {}).pipe(
      tap({
        next: (res) => {
          this._data.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  create(data: Partial<SubscriptionItem>): Observable<SubscriptionItem> {
    return this.http.post<SubscriptionItem>(this.apiUrl, data);
  }

  update(id: string, data: Partial<SubscriptionItem>): Observable<SubscriptionItem> {
    return this.http.patch<SubscriptionItem>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: string): Observable<SubscriptionItem> {
    return this.http.patch<SubscriptionItem>(`${this.apiUrl}/${id}/toggle`, {});
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  simulateSavings(monthlyCutAmount: number, annualRate: number = 0.115): Observable<SavingsSimulation> {
    return this.http.post<SavingsSimulation>(`${this.apiUrl}/simulate`, { monthlyCutAmount, annualRate });
  }
}
