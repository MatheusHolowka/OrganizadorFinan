import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Account } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/accounts`; }

  private _accounts = signal<Account[]>([]);
  private _totalBalance = signal<number>(0);

  readonly accounts = this._accounts.asReadonly();
  readonly totalBalance = this._totalBalance.asReadonly();

  findAll(): Observable<{ accounts: Account[]; totalBalance: number }> {
    return this.http.get<{ accounts: Account[]; totalBalance: number }>(this.apiUrl).pipe(
      tap((res) => {
        this._accounts.set(res.accounts);
        this._totalBalance.set(res.totalBalance);
      }),
    );
  }

  create(data: any): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, data);
  }

  update(id: string, data: any): Observable<Account> {
    return this.http.patch<Account>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
