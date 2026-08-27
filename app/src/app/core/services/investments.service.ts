import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OpenFinanceInvestment } from '../models';

export interface InvestmentAllocation {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface InvestmentsSummaryResponse {
  summary: {
    totalInvested: number;
    totalAssets: number;
    averageRate: number | null;
    allocation: InvestmentAllocation[];
  };
  items: (OpenFinanceInvestment & {
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
export class InvestmentsService {
  private http = inject(HttpClient);
  private get apiUrl() {
    return `${environment.apiUrl}/investments`;
  }

  private _data = signal<InvestmentsSummaryResponse | null>(null);
  readonly data = this._data.asReadonly();

  private _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  getInvestments(): Observable<InvestmentsSummaryResponse> {
    this._loading.set(true);
    return this.http.get<InvestmentsSummaryResponse>(this.apiUrl).pipe(
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
