import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConversationService, Conversation } from '../../services/conversation.service';

@Component({
  selector: 'app-conversation-history',
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.scss']
})
export class ConversationHistoryComponent implements OnInit {
  conversations: Conversation[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;

  constructor(
    private conversationService: ConversationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(page: number = 1): void {
    this.isLoading = true;

    this.conversationService.getConversations(page).subscribe({
      next: (response) => {
        this.conversations = response.conversations;
        this.currentPage = response.pagination.current;
        this.totalPages = response.pagination.pages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.isLoading = false;
      }
    });
  }

  openConversation(id: string): void {
    this.router.navigate(['/chat', id]);
  }

  deleteConversation(event: Event, id: string): void {
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this conversation?')) {
      this.conversationService.deleteConversation(id).subscribe({
        next: () => {
          this.conversations = this.conversations.filter(c => c._id !== id);
        },
        error: (error) => {
          console.error('Error deleting conversation:', error);
        }
      });
    }
  }

  createNewConversation(): void {
    this.conversationService.createConversation().subscribe({
      next: (response) => {
        this.router.navigate(['/chat', response.conversationId]);
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadConversations(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadConversations(this.currentPage - 1);
    }
  }
}
