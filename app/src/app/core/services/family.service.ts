import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FamilyMemberItem {
  id: string;
  familyGroupId: string;
  userId?: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt: string;
  joinedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface FamilyGroupData {
  id: string;
  name: string;
  createdById: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  members: FamilyMemberItem[];
}

export interface MyFamilyResponse {
  hasFamily: boolean;
  familyGroup: FamilyGroupData | null;
  myRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
  pendingInvitesReceived: Array<{
    id: string;
    familyGroupId: string;
    email: string;
    status: 'PENDING';
    familyGroup: {
      id: string;
      name: string;
      creator: { id: string; name: string; email: string };
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class FamilyService {
  private http = inject(HttpClient);
  private get apiUrl() { return `${environment.apiUrl}/family`; }

  familyData = signal<MyFamilyResponse | null>(null);
  loading = signal(false);
  activeScope = signal<'personal' | 'family'>('personal');

  getMyFamily(): Observable<MyFamilyResponse> {
    this.loading.set(true);
    return this.http.get<MyFamilyResponse>(`${this.apiUrl}/my-group`).pipe(
      tap({
        next: (data) => {
          this.familyData.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      }),
    );
  }

  createFamily(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { name });
  }

  inviteMember(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite`, { email });
  }

  acceptInvite(memberId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/accept/${memberId}`, {});
  }

  removeOrLeaveMember(memberId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/members/${memberId}`);
  }

  setScope(scope: 'personal' | 'family') {
    this.activeScope.set(scope);
  }
}
