import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-schedule-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label>
      {{ label }}
      <input
        [type]="type"
        [name]="name"
        [value]="value"
        [required]="required"
        [pattern]="pattern"
        [placeholder]="placeholder"
        [attr.inputmode]="inputmode || null"
        [attr.autocomplete]="autocomplete || null"
        (input)="onInput($event)"
      >
      @if (showError) {
        <small class="field-error">{{ errorText }}</small>
      }
    </label>
  `,
})
export class ScheduleFormField {
  @Input() label = '';
  @Input() name = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() pattern: string | null = null;
  @Input() inputmode: string | null = null;
  @Input() autocomplete: string | null = null;
  @Input() showError = false;
  @Input() errorText = '';

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
