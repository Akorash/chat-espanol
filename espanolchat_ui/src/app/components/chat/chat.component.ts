import { Component, OnInit, ViewChild, ElementRef, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Message } from '../../services/chat.service';
import { ConversationService } from '../../services/conversation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  message = '';
  messages: Message[] = [];
  isBotThinking = false;
  currentConversationId: string | null = null;
  characterCount = 0;
  maxLength = 100;
  savedUserMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private conversationService: ConversationService,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to messages with improved handling
    this.subscriptions.push(
      this.chatService.messages$.subscribe(messages => {
        // Run inside Angular zone to ensure change detection
        this.zone.run(() => {
          console.log('Messages updated:', messages.length);
          this.messages = [...messages]; // Create a new array reference
           this.messages = messages.map(msg => ({
    ...msg,
    timestamp: this.ensureValidDate(msg.timestamp)
  }));
           console.log(this.messages);
          this.cdr.detectChanges(); // Force change detection
          this.scrollToBottom();
        });
      })
    );

    // Subscribe to bot thinking status
    this.subscriptions.push(
      this.chatService.botThinking$.subscribe(thinking => {
        this.zone.run(() => {
          console.log('Bot thinking status:', thinking);
          this.isBotThinking = thinking;
          this.cdr.detectChanges(); // Force change detection
        });
      })
    );

    // Subscribe to conversation ID changes
    this.subscriptions.push(
      this.chatService.conversationId$.subscribe(id => {
        this.currentConversationId = id;
      })
    );

    // Get conversation ID from route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadConversation(id);
      } else {
        this.chatService.clearMessages();
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private ensureValidDate(date: any): Date {
  const validDate = new Date(date);
  return isNaN(validDate.getTime()) ? new Date() : validDate;
}

  // Send message with explicit change detection
  sendMessage(): void {
    const trimmedMessage = this.message.trim();

    if (!trimmedMessage) {
      return;
    }

    // Explicitly handle the response to ensure it's processed
    this.chatService.sendMessage(trimmedMessage)
      .subscribe({
        next: (response) => {
          // Run inside Angular zone to ensure change detection
          this.zone.run(() => {
            console.log('Got response from bot:', response);
            this.chatService.handleResponse(response);
            this.message = '';
            this.characterCount = 0;
            this.cdr.detectChanges(); // Force change detection
          });
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isBotThinking = false;
          this.cdr.detectChanges(); // Force change detection
        }
      });
  }

  // Update character count
  onMessageInput(): void {
    this.characterCount = this.message.length;
  }

  // Apply random phrase suggestion
  applyPhraseSuggestion(phrase: string): void {
    // Save current message for undo
    this.savedUserMessage = this.message;

    // Set phrase as message
    this.message = phrase;
    this.characterCount = phrase.length;

    // Focus input
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    });
  }

  // Undo phrase suggestion
  undoSuggestion(): void {
    this.message = this.savedUserMessage;
    this.characterCount = this.savedUserMessage.length;

    // Focus input
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    });
  }

  // Create new conversation
  newConversation(): void {
    if (this.messages.length === 0) {
      return;
    }

    if (confirm('Are you sure you want to start a new conversation? This will clear the current conversation.')) {
      this.chatService.clearMessages();
      this.router.navigate(['/chat']);
    }
  }

  // Load conversation by ID
  private loadConversation(id: string): void {
    this.conversationService.getConversationById(id)
      .subscribe({
        next: (response) => {
          // Map messages to correct format
          const messages = response.conversation.messages.map(msg => ({
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            mood: msg.mood
          }));

          // Set conversation in chat service
          this.chatService.setMessages(messages);
          this.chatService.setConversationId(id);
        },
        error: (error) => {
          console.error('Error loading conversation:', error);
          this.router.navigate(['/chat']);
        }
      });
  }

  // Scroll to bottom of messages container with better timing
  private scrollToBottom(): void {
    // Use requestAnimationFrame for better timing with renders
    requestAnimationFrame(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  // Track function for ngFor optimization
  trackByFn(index: number, item: Message): string {
    // Use timestamp + content as a unique identifier
    return `${item.sender}-${item.timestamp.getTime()}-${item.content?.substring(0, 10)}`;
  }
}
