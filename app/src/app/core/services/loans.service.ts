import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OpenFinanceLoan } from '../models';

export interface LoansSummaryResponse {
  summary: {
    totalContracted: number;
    totalOutstandingBalance: number;
    totalContracts: number;
    averageCet: number | null;
    totalInstallmentsCount: number;
    paidInstallmentsCount: number;
    overallProgress: number;
  };
  items: (OpenFinanceLoan & {
    openFinanceConnection?: {
      connectorName: string;
      connectorColor?: string;
      connectorImageUrl?: string;
    };
  })[];
}

@Injectable({
  providedIn: 'root',
})
export class LoansService {
  private http = inject(HttpClient);
  private get apiUrl() {
    return `${environment.apiUrl}/loans`;
  }

  private _data = signal<LoansSummaryResponse | null>(null);
  readonly data = this._data.asReadonly();

  private _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  getLoans(): Observable<LoansSummaryResponse> {
    this._loading.set(true);
    return this.http.get<LoansSummaryResponse>(this.apiUrl).pipe(
      tap({
        next: (res) => {
          this._data.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }
}
