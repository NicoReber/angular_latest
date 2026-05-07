import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

import { DEFAULT_IMPORT_TEXT, MOCK_ORDER, MOCK_ORDER_LINES } from './booking.mock-data';
import { BookingStepComponent } from './booking-step.component';
import {
  BookingLine,
  BookingResult,
  ImportParseError,
  ImportRow,
  ImportSummary,
  ResolutionRow,
  WorkflowStepId,
} from './booking.models';
import { ImportStepComponent } from './import-step.component';
import { MappingStepComponent } from './mapping-step.component';

import { TestEnum } from './test.enum';

@Component({
  selector: 'app-root',
  imports: [ImportStepComponent, MappingStepComponent, BookingStepComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly activeStep = signal<WorkflowStepId>(1);
  protected readonly orderLines = signal(MOCK_ORDER_LINES);
  protected readonly importControl = new FormControl(DEFAULT_IMPORT_TEXT, {
    nonNullable: true,
  });
  protected readonly importText = toSignal(this.importControl.valueChanges, {
    initialValue: this.importControl.getRawValue(),
  });
  protected readonly manualSelections = signal<Record<string, string>>({});
  protected readonly bookingResult = signal<BookingResult | null>(null);

  protected readonly parseState = computed(() => this.parseImportText(this.importText()));
  protected readonly importRows = computed(() => this.parseState().rows);
  protected readonly parseErrors = computed(() => this.parseState().errors);

  protected readonly importSummaries = computed<ImportSummary[]>(() => {
    const grouped = new Map<string, ImportSummary>();

    for (const row of this.importRows()) {
      const current = grouped.get(row.ean);

      if (current) {
        current.totalQuantity += row.quantity;
        current.sourceRows.push(row.rowNumber);
        continue;
      }

      grouped.set(row.ean, {
        ean: row.ean,
        totalQuantity: row.quantity,
        sourceRows: [row.rowNumber],
      });
    }

    return Array.from(grouped.values()).sort((left, right) => left.ean.localeCompare(right.ean));
  });

  protected readonly filteredOrderLines = computed(() => {
    const requestedEans = new Set(this.importSummaries().map((row) => row.ean));
    return this.orderLines().filter((line) => requestedEans.has(line.ean));
  });

  protected readonly resolutionRows = computed<ResolutionRow[]>(() => {
    const selections = this.manualSelections();

    return this.importSummaries().map((summary) => {
      const candidates = this.orderLines().filter((line) => line.ean === summary.ean);
      const selectedLineId =
        selections[summary.ean] ?? (candidates.length === 1 ? candidates[0].id : null);
      const selectedLine = candidates.find((line) => line.id === selectedLineId) ?? null;

      return {
        ean: summary.ean,
        requestedQuantity: summary.totalQuantity,
        candidates,
        selectedLineId,
        selectedLine,
        sourceRows: summary.sourceRows,
        requiresManualSelection: candidates.length > 1,
      };
    });
  });

  protected readonly ambiguousResolutionRows = computed(() => {
    return this.resolutionRows().filter((row) => row.candidates.length > 1);
  });

  protected readonly mappedCount = computed(() => {
    return this.ambiguousResolutionRows().filter((row) => row.selectedLineId).length;
  });

  protected readonly blockers = computed(() => {
    return this.resolutionRows().flatMap((row) => {
      if (row.candidates.length === 0) {
        return [`${row.ean}: no matching order line found in ${MOCK_ORDER.id}`];
      }

      if (!row.selectedLineId) {
        return [`${row.ean}: multiple order lines available, manual selection required`];
      }

      if (row.selectedLine && row.requestedQuantity > row.selectedLine.openQuantity) {
        return [
          `${row.ean}: requested ${row.requestedQuantity} exceeds open quantity ${row.selectedLine.openQuantity} on ${row.selectedLine.id}`,
        ];
      }

      return [];
    });
  });

  protected readonly readyToBook = computed(() => {
    if (this.parseErrors().length > 0 || this.resolutionRows().length === 0) {
      return false;
    }

    return this.resolutionRows().every((row) => !!row.selectedLineId && row.candidates.length > 0);
  });

  protected readonly bookingPayload = computed<BookingLine[]>(() => {
    if (!this.readyToBook() || this.blockers().length > 0) {
      return [];
    }

    return this.resolutionRows().map((row) => ({
      ean: row.ean,
      quantity: row.requestedQuantity,
      orderLineId: row.selectedLineId!,
    }));
  });

  protected readonly bookingSummary = computed(() => {
    const payload = this.bookingPayload();

    return {
      lineCount: payload.length,
      totalQuantity: payload.reduce((sum, line) => sum + line.quantity, 0),
    };
  });

  protected readonly canContinueFromImport = computed(() => {
    return this.parseErrors().length === 0 && this.importRows().length > 0;
  });

  protected readonly canContinueFromMapping = computed(() => {
    return this.ambiguousResolutionRows().every((row) => !!row.selectedLineId);
  });

  protected readonly maxUnlockedStep = computed<WorkflowStepId>(() => {
    if (this.canContinueFromMapping()) {
      return 3;
    }

    if (this.canContinueFromImport()) {
      return 2;
    }

    return 1;
  });

  protected readonly stepCards = computed(() => {
    const activeStep = this.activeStep();
    const maxUnlockedStep = this.maxUnlockedStep();

    return [
      {
        id: 1 as WorkflowStepId,
        title: 'Einfügen',
        summary:
          this.importRows().length > 0
            ? `${this.importSummaries().length} EANs`
            : 'Pausenbrot-Liste einfügen',
        state: activeStep === 1 ? 'current' : 1 < activeStep ? 'complete' : 'available',
        disabled: false,
      },
      {
        id: 2 as WorkflowStepId,
        title: 'Chaos lösen',
        summary: `${this.ambiguousResolutionRows().length} unklare EANs`,
        state:
          activeStep === 2
            ? 'current'
            : 2 < activeStep
              ? 'complete'
              : maxUnlockedStep >= 2
                ? 'available'
                : 'locked',
        disabled: maxUnlockedStep < 2,
      },
      {
        id: 3 as WorkflowStepId,
        title: 'Abschicken',
        summary:
          this.bookingResult() !== null
            ? 'Scheinbuchung erledigt 🎉'
            : `${this.filteredOrderLines().length} passende Zeilen`,
        state: activeStep === 3 ? 'current' : maxUnlockedStep >= 3 ? 'available' : 'locked',
        disabled: maxUnlockedStep < 3,
      },
    ];
  });

  constructor() {
    this.importControl.valueChanges.subscribe(() => {
      this.manualSelections.set({});
      this.bookingResult.set(null);

      if (this.activeStep() > 1) {
        this.activeStep.set(1);
      }
    });
  }

  protected goToStep(step: WorkflowStepId): void {
    if (step <= this.maxUnlockedStep()) {
      this.activeStep.set(step);
    }
  }

  protected selectOrderLine(selection: { ean: string; orderLineId: string }): void {
    this.manualSelections.update((current) => ({
      ...current,
      [selection.ean]: selection.orderLineId,
    }));
    this.bookingResult.set(null);
  }

  protected book(): void {
    if (!this.readyToBook() || this.blockers().length > 0) {
      return;
    }

    this.bookingResult.set({
      bookedAt: new Date().toISOString(),
      orderId: MOCK_ORDER.id,
      lines: this.bookingPayload(),
    });
  }

  private parseImportText(rawValue: string): { rows: ImportRow[]; errors: ImportParseError[] } {
    const lines = rawValue
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const rows: ImportRow[] = [];
    const errors: ImportParseError[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map((part) => part.trim());

      if (parts.length !== 2) {
        errors.push({
          lineNumber: index + 1,
          message: 'Expected format EAN,quantity',
        });
        return;
      }

      const [ean, quantityRaw] = parts;

      if (!/^\d{8,14}$/.test(ean)) {
        errors.push({
          lineNumber: index + 1,
          message: `EAN \"${ean}\" must contain 8 to 14 digits`,
        });
        return;
      }

      const quantity = Number(quantityRaw);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        errors.push({
          lineNumber: index + 1,
          message: `Quantity \"${quantityRaw}\" must be a positive integer`,
        });
        return;
      }

      rows.push({
        rowNumber: index + 1,
        ean,
        quantity,
      });
    });

    return { rows, errors };
  }

  logEnum(e: TestEnum): void {
    console.log(e);
  }
}
