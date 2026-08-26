import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Category, CategoryType } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/categories`; }

  private _categories = signal<Category[]>([]);
  readonly categories = this._categories.asReadonly();

  findAll(type?: CategoryType): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl, { params: type ? { type } : {} }).pipe(
      tap((cats) => this._categories.set(cats)),
    );
  }

  create(data: any): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data);
  }
}
