import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DashboardSummary } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/dashboard`; }

  private _summary = signal<DashboardSummary | null>(null);
  private _loading = signal<boolean>(false);

  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();

  getSummary(month?: number, year?: number, scope?: string): Observable<DashboardSummary> {
    this._loading.set(true);
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    if (scope) params = params.set('scope', scope);

    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`, { params }).pipe(
      tap({
        next: (data) => {
          this._summary.set(data);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }
}
