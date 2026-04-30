import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BookingResult, ResolutionRow } from './booking.models';

@Component({
  selector: 'app-booking-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel step-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Step 3</p>
          <h2>Review and release booking</h2>
        </div>
      </div>

      <div class="metric-grid three-up compact-grid">
        <div class="metric-card">
          <span>Booking lines</span>
          <strong>{{ lineCount() }}</strong>
        </div>
        <div class="metric-card">
          <span>Total quantity</span>
          <strong>{{ totalQuantity() }}</strong>
        </div>
        <div class="metric-card">
          <span>Mapped order lines</span>
          <strong>{{ lineCount() }}</strong>
        </div>
      </div>

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

      <div class="data-table-card compact-table">
        <div class="table-header">
          <h3>Resolved booking lines</h3>
          <span>{{ lineCount() }} lines</span>
        </div>
        <table>
          <thead>
            <tr>
              <th scope="col">EAN</th>
              <th scope="col">Qty</th>
              <th scope="col">Order line</th>
              <th scope="col">Delivery</th>
              <th scope="col">Open qty</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (row of resolutionRows(); track row.ean) {
              <tr>
                <td>{{ row.ean }}</td>
                <td>{{ row.requestedQuantity }}</td>
                <td>{{ row.selectedLine?.id ?? 'Not mapped' }}</td>
                <td>{{ row.selectedLine?.deliveryDate | date: 'dd MMM yyyy' }}</td>
                <td>{{ row.selectedLine?.openQuantity ?? '-' }}</td>
                <td>{{ row.selectedLine?.status ?? 'Missing' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (bookingResult(); as result) {
        <div class="message-card success-card" aria-live="polite">
          <h3>Mock booking completed</h3>
          <p>
            {{ result.lines.length }} lines booked into {{ result.orderId }} at
            {{ result.bookedAt | date: 'dd MMM yyyy, HH:mm:ss' }}.
          </p>
        </div>
      }

      <div class="step-actions split-actions">
        <button type="button" class="ghost-button" (click)="back.emit()">Back to mapping</button>
        <button type="button" class="primary-button" [disabled]="!canBook()" (click)="book.emit()">
          Book selected order lines
        </button>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingStepComponent {
  readonly resolutionRows = input.required<ResolutionRow[]>();
  readonly blockers = input.required<string[]>();
  readonly lineCount = input.required<number>();
  readonly totalQuantity = input.required<number>();
  readonly canBook = input.required<boolean>();
  readonly bookingResult = input.required<BookingResult | null>();

  readonly back = output<void>();
  readonly book = output<void>();
}
