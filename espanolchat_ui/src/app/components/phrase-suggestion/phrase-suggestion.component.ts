import { Component, Output, EventEmitter } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-phrase-suggestion',
  templateUrl: './phrase-suggestion.component.html',
  styleUrls: ['./phrase-suggestion.component.scss']
})
export class PhraseSuggestionComponent {
  @Output() suggestionSelected = new EventEmitter<string>();
  @Output() undoRequested = new EventEmitter<void>();

  isLoading = false;
  currentSuggestion = '';
  showUndo = false;

  constructor(private chatService: ChatService) {}

  getRandomPhrase(): void {
    this.isLoading = true;

    this.chatService.getRandomPhrase().subscribe({
      next: (response) => {
        this.currentSuggestion = response.phrase;
        this.suggestionSelected.emit(this.currentSuggestion);
        this.showUndo = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting random phrase:', error);
        this.isLoading = false;
      }
    });
  }

  undo(): void {
    this.undoRequested.emit();
    this.showUndo = false;
  }
}
