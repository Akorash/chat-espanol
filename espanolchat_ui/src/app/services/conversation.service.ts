import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Message } from './chat.service';

export interface Conversation {
  _id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    current: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  // Get all conversations for current user
  getConversations(page: number = 1, limit: number = 10): Observable<ConversationsResponse> {
    return this.http.get<ConversationsResponse>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  // Get conversation by ID
  getConversationById(id: string): Observable<{ conversation: Conversation }> {
    return this.http.get<{ conversation: Conversation }>(`${this.apiUrl}/${id}`);
  }

  // Create new conversation
  createConversation(title?: string): Observable<{ message: string; conversationId: string }> {
    return this.http.post<{ message: string; conversationId: string }>(
      this.apiUrl,
      { title }
    );
  }

  // Delete conversation
  deleteConversation(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Update conversation title
  updateTitle(id: string, title: string): Observable<{ message: string; conversation: Conversation }> {
    return this.http.patch<{ message: string; conversation: Conversation }>(
      `${this.apiUrl}/${id}/title`,
      { title }
    );
  }

  // Clear conversation messages
  clearConversation(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/clear`, {});
  }
}
