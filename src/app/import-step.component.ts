import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ImportParseError } from './booking.models';

@Component({
  selector: 'app-import-step',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <article class="panel step-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Schritt 1</p>
          <h2>Pausenbrot-Liste einfügen</h2>
        </div>
      </div>

      <textarea
        class="import-textarea"
        [formControl]="importControl()"
        rows="14"
        spellcheck="false"
        aria-label="EAN quantity import"
      ></textarea>

      @if (parseErrors().length > 0) {
        <div class="message-card error-card" role="alert" aria-live="polite">
          <h3>Import issues</h3>
          <table class="issue-table">
            <thead>
              <tr>
                <th scope="col">Line</th>
                <th scope="col">Issue</th>
              </tr>
            </thead>
            <tbody>
              @for (error of parseErrors(); track error.lineNumber + error.message) {
                <tr>
                  <td>{{ error.lineNumber }}</td>
                  <td>{{ error.message }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <div class="step-actions">
        <button
          type="button"
          class="primary-button"
          [disabled]="!canContinue()"
          (click)="next.emit()"
        >
          Continue
        </button>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportStepComponent {
  readonly importControl = input.required<FormControl<string>>();
  readonly parseErrors = input.required<ImportParseError[]>();
  readonly canContinue = input.required<boolean>();

  readonly next = output<void>();
}
