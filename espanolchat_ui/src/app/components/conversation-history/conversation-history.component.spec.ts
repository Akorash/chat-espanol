import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationHistoryComponent } from './conversation-history.component';

describe('ConversationHistoryComponent', () => {
  let component: ConversationHistoryComponent;
  let fixture: ComponentFixture<ConversationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConversationHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
