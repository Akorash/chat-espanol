import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhraseSuggestionComponent } from './phrase-suggestion.component';

describe('PhraseSuggestionComponent', () => {
  let component: PhraseSuggestionComponent;
  let fixture: ComponentFixture<PhraseSuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhraseSuggestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhraseSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
