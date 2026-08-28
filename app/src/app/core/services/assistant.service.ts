import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface PromptSuggestion {
  label: string;
  prompt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private http = inject(HttpClient);
  private get apiUrl() {
    return `${environment.apiUrl}/assistant`;
  }

  messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Olá! Sou o **Assistente de Inteligência Financeira do FINAN** 🤖\n\nEstou conectado aos seus extratos, cofres em quarentena e projeções de cartão de crédito. Você pode me perguntar qualquer coisa sobre seu patrimônio em linguagem natural!`,
      timestamp: new Date().toISOString(),
    },
  ]);

  isThinking = signal<boolean>(false);
  isOpen = signal<boolean>(false);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  sendMessage(text: string): Observable<ChatMessage> {
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    this.messages.update((prev) => [...prev, userMsg]);
    this.isThinking.set(true);

    return new Observable<ChatMessage>((observer) => {
      this.http.post<ChatMessage>(`${this.apiUrl}/chat`, { message: text }).subscribe({
        next: (res) => {
          this.messages.update((prev) => [...prev, res]);
          this.isThinking.set(false);
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          const errorMsg: ChatMessage = {
            role: 'assistant',
            content: 'Desculpe, ocorreu uma instabilidade momentânea ao processar sua pergunta. Tente novamente em alguns instantes.',
            timestamp: new Date().toISOString(),
          };
          this.messages.update((prev) => [...prev, errorMsg]);
          this.isThinking.set(false);
          observer.error(err);
        },
      });
    });
  }

  getSuggestions(): Observable<{ suggestions: PromptSuggestion[] }> {
    return this.http.get<{ suggestions: PromptSuggestion[] }>(`${this.apiUrl}/suggestions`);
  }

  connectWhatsApp(phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp-connect`, { phone });
  }
}
