export type ImportRow = {
  rowNumber: number;
  ean: string;
  quantity: number;
};

export type ImportParseError = {
  lineNumber: number;
  message: string;
};

export type ImportSummary = {
  ean: string;
  totalQuantity: number;
  sourceRows: number[];
};

export type OrderLineStatus = 'Open' | 'Allocated' | 'Partially booked';

export type OrderLine = {
  id: string;
  ean: string;
  productName: string;
  deliveryDate: string;
  orderedQuantity: number;
  openQuantity: number;
  status: OrderLineStatus;
  location: string;
};

export type ResolutionRow = {
  ean: string;
  requestedQuantity: number;
  candidates: OrderLine[];
  selectedLineId: string | null;
  selectedLine: OrderLine | null;
  sourceRows: number[];
  requiresManualSelection: boolean;
};

export type BookingLine = {
  ean: string;
  quantity: number;
  orderLineId: string;
};

export type BookingResult = {
  bookedAt: string;
  orderId: string;
  lines: BookingLine[];
};

export type MockOrder = {
  id: string;
  customer: string;
  salesChannel: string;
  requestedShipWindow: string;
};

export type WorkflowStepId = 1 | 2 | 3;
