import { MockOrder, OrderLine } from './booking.models';

export const DEFAULT_IMPORT_TEXT = `4006381333931,12
5412345678901,4
8712345678905,10
7638901234567,6
4006381333931,3`;

export const MOCK_ORDER: MockOrder = {
  id: 'SO-FREIPARKEN',
  customer: 'Tante Ernas Tante-Emma-Laden GmbH',
  salesChannel: 'Pausenbrot-Nachschub',
  requestedShipWindow: 'Woche nach dem langen Wochenende',
};

export const MOCK_ORDER_LINES: OrderLine[] = [
  {
    id: 'OL-10017',
    ean: '4006381333931',
    productName: 'Büro-Sprudelwasser 6x1L',
    deliveryDate: '2026-03-18',
    orderedQuantity: 30,
    openQuantity: 18,
    status: 'Open',
    location: 'Homeoffice Nord',
  },
  {
    id: 'OL-10021',
    ean: '4006381333931',
    productName: 'Büro-Sprudelwasser 6x1L',
    deliveryDate: '2026-03-25',
    orderedQuantity: 24,
    openQuantity: 20,
    status: 'Allocated',
    location: 'Homeoffice Nord',
  },
  {
    id: 'OL-10031',
    ean: '5412345678901',
    productName: 'Kantine-Tomatensauce 12x500g',
    deliveryDate: '2026-03-19',
    orderedQuantity: 10,
    openQuantity: 6,
    status: 'Open',
    location: 'Freiparken Süd',
  },
  {
    id: 'OL-10035',
    ean: '8712345678905',
    productName: 'Dienstags-Nudeln Nr.5 20x500g',
    deliveryDate: '2026-03-17',
    orderedQuantity: 14,
    openQuantity: 10,
    status: 'Partially booked',
    location: 'Teambuilding West',
  },
  {
    id: 'OL-10039',
    ean: '8712345678905',
    productName: 'Dienstags-Nudeln Nr.5 20x500g',
    deliveryDate: '2026-03-24',
    orderedQuantity: 18,
    openQuantity: 16,
    status: 'Open',
    location: 'Teambuilding West',
  },
  {
    id: 'OL-10042',
    ean: '3057654321098',
    productName: 'Schreibtisch-Zitronenspray 8x750ml',
    deliveryDate: '2026-03-21',
    orderedQuantity: 12,
    openQuantity: 12,
    status: 'Open',
    location: 'Freiparken Süd',
  },
  {
    id: 'OL-10055',
    ean: '7638901234567',
    productName: 'Chef-Kaffee Extra Stark 1kg',
    deliveryDate: '2026-03-28',
    orderedQuantity: 10,
    openQuantity: 8,
    status: 'Open',
    location: 'Betriebsausflug Ost',
  },
];
