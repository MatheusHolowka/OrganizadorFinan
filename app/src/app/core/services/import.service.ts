import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImportBatchPreview } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/import`; }

  uploadFile(accountId: string, file: File): Observable<ImportBatchPreview> {
    const formData = new FormData();
    formData.append('accountId', accountId);
    formData.append('file', file);

    return this.http.post<ImportBatchPreview>(`${this.apiUrl}/upload`, formData);
  }

  confirmImport(data: {
    batchId: string;
    accountId: string;
    items: Array<{
      importItemId: string;
      description: string;
      amount: number;
      date: string;
      categoryId?: string;
      shouldImport: boolean;
    }>;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, data);
  }
}
