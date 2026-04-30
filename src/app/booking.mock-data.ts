import { MockOrder, OrderLine } from './booking.models';

export const DEFAULT_IMPORT_TEXT = `4006381333931,12
5412345678901,4
8712345678905,10
7638901234567,6
4006381333931,3`;

export const MOCK_ORDER: MockOrder = {
  id: 'SO-2400819',
  customer: 'Northwind Retail Group',
  salesChannel: 'Key Account Replenishment',
  requestedShipWindow: 'Week 12 / 2026',
};

export const MOCK_ORDER_LINES: OrderLine[] = [
  {
    id: 'OL-10017',
    ean: '4006381333931',
    productName: 'Sparkling Water 6x1L',
    deliveryDate: '2026-03-18',
    orderedQuantity: 30,
    openQuantity: 18,
    status: 'Open',
    location: 'Hamburg DC',
  },
  {
    id: 'OL-10021',
    ean: '4006381333931',
    productName: 'Sparkling Water 6x1L',
    deliveryDate: '2026-03-25',
    orderedQuantity: 24,
    openQuantity: 20,
    status: 'Allocated',
    location: 'Hamburg DC',
  },
  {
    id: 'OL-10031',
    ean: '5412345678901',
    productName: 'Organic Tomato Sauce 12x500g',
    deliveryDate: '2026-03-19',
    orderedQuantity: 10,
    openQuantity: 6,
    status: 'Open',
    location: 'Bremen Hub',
  },
  {
    id: 'OL-10035',
    ean: '8712345678905',
    productName: 'Premium Pasta No.5 20x500g',
    deliveryDate: '2026-03-17',
    orderedQuantity: 14,
    openQuantity: 10,
    status: 'Partially booked',
    location: 'Rotterdam Crossdock',
  },
  {
    id: 'OL-10039',
    ean: '8712345678905',
    productName: 'Premium Pasta No.5 20x500g',
    deliveryDate: '2026-03-24',
    orderedQuantity: 18,
    openQuantity: 16,
    status: 'Open',
    location: 'Rotterdam Crossdock',
  },
  {
    id: 'OL-10042',
    ean: '3057654321098',
    productName: 'Citrus Cleaning Spray 8x750ml',
    deliveryDate: '2026-03-21',
    orderedQuantity: 12,
    openQuantity: 12,
    status: 'Open',
    location: 'Bremen Hub',
  },
  {
    id: 'OL-10055',
    ean: '7638901234567',
    productName: 'Dark Roast Coffee Beans 1kg',
    deliveryDate: '2026-03-28',
    orderedQuantity: 10,
    openQuantity: 8,
    status: 'Open',
    location: 'Zurich Reserve',
  },
];
