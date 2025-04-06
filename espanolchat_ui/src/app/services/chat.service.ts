import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject} from 'rxjs';
import {environment} from '../environments/environment';

export interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  mood?: string;
}

export interface ChatResponse {
  content: string;
  mood: string;
  timestamp: Date;
  conversationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  // Use a BehaviorSubject with an initial empty array
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private botThinkingSubject = new BehaviorSubject<boolean>(false);
  public botThinking$ = this.botThinkingSubject.asObservable();

  private conversationIdSubject = new BehaviorSubject<string | null>(null);
  public conversationId$ = this.conversationIdSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  // Send a message and get a response
  sendMessage(message: string): Observable<ChatResponse> {
    // Set bot thinking to true
    this.botThinkingSubject.next(true);

    // Add user message to messages
    this.addUserMessage(message);

    // Get current conversation ID
    const conversationId = this.conversationIdSubject.value;

    // Return the HTTP request
    return this.http.post<ChatResponse>(`${this.apiUrl}/send`, {
      message,
      conversationId
    });
  }

  // Add user message to state - public for immediate UI feedback
  addUserMessage(content: string): void {
    const userMessage: Message = {
      content,
      sender: 'user',
      timestamp: new Date()
    };

    // Create a new array to trigger change detection
    const currentMessages = [...this.messagesSubject.value];
    currentMessages.push(userMessage);

    // Update the subject with the new array
    this.messagesSubject.next(currentMessages);
  }

  // Handle bot response
  handleResponse(response: any): void {
    // Update conversation ID
    this.conversationIdSubject.next(response.conversationId);

    const timestamp = new Date(response.timestamp);
    const validTimestamp = isNaN(timestamp.getTime()) ? new Date() : timestamp;

    const botMessage: any = {
      content: response.response.content,
      sender: 'bot',
      timestamp: validTimestamp,
      mood: response.mood
    };

    // Create a new array to trigger change detection
    const currentMessages = [...this.messagesSubject.value];
    currentMessages.push(botMessage);

    // Update the subject with the new array
    this.messagesSubject.next(currentMessages);

    // Set bot thinking to false
    this.botThinkingSubject.next(false);

    // Log for debugging
    console.log('Bot response added:', response);
    console.log('Current messages:', currentMessages);
  }

  // Get random phrase suggestion
  getRandomPhrase(): Observable<{ phrase: string }> {
    return this.http.get<{ phrase: string }>(`${this.apiUrl}/random-phrase`);
  }

  // Clear messages
  clearMessages(): void {
    this.messagesSubject.next([]);
    this.conversationIdSubject.next(null);
  }

  // Set messages (when loading a conversation)
  setMessages(messages: Message[]): void {
    // Create a new array to trigger change detection
    this.messagesSubject.next([...messages]);
  }

  // Set conversation ID
  setConversationId(id: string | null): void {
    this.conversationIdSubject.next(id);
  }

  // Get current messages (for debugging)
  getCurrentMessages(): Message[] {
    return [...this.messagesSubject.value];
  }
}
