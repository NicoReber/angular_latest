import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ResolutionRow } from './booking.models';

@Component({
  selector: 'app-mapping-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel step-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Step 2</p>
          <h2>Resolve one order line per EAN</h2>
        </div>
        <span class="status-pill accent"
          >{{ mappedCount() }}/{{ ambiguousRows().length }} mapped</span
        >
      </div>

      @if (ambiguousRows().length > 0) {
        <div class="data-table-card compact-table">
          <table>
            <thead>
              <tr>
                <th scope="col">EAN</th>
                <th scope="col">Qty</th>
                <th scope="col">Rows</th>
                <th scope="col">Sales order lines</th>
              </tr>
            </thead>
            <tbody>
              @for (row of ambiguousRows(); track row.ean) {
                <tr>
                  <td>{{ row.ean }}</td>
                  <td>{{ row.requestedQuantity }}</td>
                  <td>{{ row.sourceRows.join(', ') }}</td>
                  <td class="mapping-cell">
                    <div
                      class="candidate-list"
                      role="radiogroup"
                      [attr.aria-label]="'Order lines for EAN ' + row.ean"
                    >
                      @for (candidate of row.candidates; track candidate.id) {
                        <label
                          class="candidate-row"
                          [class.selected]="row.selectedLineId === candidate.id"
                        >
                          <input
                            type="radio"
                            [name]="'mapping-' + row.ean"
                            [checked]="row.selectedLineId === candidate.id"
                            (change)="
                              lineSelected.emit({ ean: row.ean, orderLineId: candidate.id })
                            "
                          />
                          <span class="candidate-line-id">{{ candidate.id }}</span>
                          <span>{{ candidate.deliveryDate | date: 'dd MMM yyyy' }}</span>
                          <span>{{ candidate.openQuantity }} open</span>
                          <span>{{ candidate.status }}</span>
                        </label>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="message-card success-card compact-message">
          No manual mapping is required. All imported EANs already resolve to a single order line.
        </div>
      }

      @if (blockers().length > 0) {
        <div class="message-card warning-card" role="alert" aria-live="polite">
          <h3>Booking blockers</h3>
          <table class="issue-table">
            <thead>
              <tr>
                <th scope="col">Issue</th>
              </tr>
            </thead>
            <tbody>
              @for (blocker of blockers(); track blocker) {
                <tr>
                  <td>{{ blocker }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <div class="step-actions split-actions">
        <button type="button" class="ghost-button" (click)="back.emit()">Back to import</button>
        <button
          type="button"
          class="primary-button"
          [disabled]="!canContinue()"
          (click)="next.emit()"
        >
          Continue to booking
        </button>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingStepComponent {
  readonly ambiguousRows = input.required<ResolutionRow[]>();
  readonly mappedCount = input.required<number>();
  readonly blockers = input.required<string[]>();
  readonly canContinue = input.required<boolean>();

  readonly lineSelected = output<{ ean: string; orderLineId: string }>();
  readonly back = output<void>();
  readonly next = output<void>();
}
