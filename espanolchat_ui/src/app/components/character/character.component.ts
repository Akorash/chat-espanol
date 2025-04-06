import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
  animations: [
    trigger('poseChange', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CharacterComponent implements OnChanges {
  @Input() isBotThinking = false;
  @Input() mood: string = 'neutral';

  currentPose = 'idle';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isBotThinking']) {
      if (this.isBotThinking) {
        this.currentPose = 'thinking';
      } else if (!this.isBotThinking && !changes['mood']) {
        this.currentPose = 'idle';
      }
    }

    if (changes['mood'] && !this.isBotThinking && changes['mood'].currentValue) {
      this.updatePoseBasedOnMood(changes['mood'].currentValue);
    }
  }

  private updatePoseBasedOnMood(mood: string): void {
    switch (mood) {
      case 'happy':
      case 'sad':
      case 'angry':
      case 'laughing':
      case 'confused':
      case 'blushing':
        this.currentPose = mood;
        break;
      default:
        this.currentPose = 'idle';
        break;
    }

    // Reset to idle after 5 seconds
    setTimeout(() => {
      if (this.currentPose !== 'thinking') {
        this.currentPose = 'idle';
      }
    }, 5000);
  }

  getPoseImagePath(): string {
    return `assets/characters/${this.currentPose}.svg`;
  }
}
