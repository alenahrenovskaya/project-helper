import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'clear-field',
  template: `
    <button mat-icon-button color="primary" *ngIf="value"
            (click)="clear.emit()" stopPropagation>
      <mat-icon>clear</mat-icon>
    </button>
  `,
})
export class ClearFieldComponent<T> {
  @Input() value: T;
  @Output() clear: EventEmitter<void> = new EventEmitter<void>();
}
