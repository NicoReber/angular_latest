import { BoardSpace, Card } from './game.models';

export const BOARD: BoardSpace[] = [
  { id: 0, name: 'Go', type: 'go' },
  { id: 1, name: 'Mediterranean Ave', type: 'property', color: 'brown', price: 60, baseRent: 2, setRent: 4, mortgageValue: 30 },
  { id: 2, name: 'Community Chest', type: 'community_chest' },
  { id: 3, name: 'Baltic Ave', type: 'property', color: 'brown', price: 60, baseRent: 4, setRent: 8, mortgageValue: 30 },
  { id: 4, name: 'Income Tax', type: 'income_tax', taxAmount: 200 },
  { id: 5, name: 'Reading Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { id: 6, name: 'Oriental Ave', type: 'property', color: 'light-blue', price: 100, baseRent: 6, setRent: 12, mortgageValue: 50 },
  { id: 7, name: 'Chance', type: 'chance' },
  { id: 8, name: 'Vermont Ave', type: 'property', color: 'light-blue', price: 100, baseRent: 6, setRent: 12, mortgageValue: 50 },
  { id: 9, name: 'Connecticut Ave', type: 'property', color: 'light-blue', price: 120, baseRent: 8, setRent: 16, mortgageValue: 60 },
  { id: 10, name: 'Jail / Just Visiting', type: 'jail' },
  { id: 11, name: 'St. Charles Place', type: 'property', color: 'pink', price: 140, baseRent: 10, setRent: 20, mortgageValue: 70 },
  { id: 12, name: 'Electric Company', type: 'utility', price: 150, mortgageValue: 75 },
  { id: 13, name: 'States Ave', type: 'property', color: 'pink', price: 140, baseRent: 10, setRent: 20, mortgageValue: 70 },
  { id: 14, name: 'Virginia Ave', type: 'property', color: 'pink', price: 160, baseRent: 12, setRent: 24, mortgageValue: 80 },
  { id: 15, name: 'Pennsylvania Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { id: 16, name: 'St. James Place', type: 'property', color: 'orange', price: 180, baseRent: 14, setRent: 28, mortgageValue: 90 },
  { id: 17, name: 'Community Chest', type: 'community_chest' },
  { id: 18, name: 'Tennessee Ave', type: 'property', color: 'orange', price: 180, baseRent: 14, setRent: 28, mortgageValue: 90 },
  { id: 19, name: 'New York Ave', type: 'property', color: 'orange', price: 200, baseRent: 16, setRent: 32, mortgageValue: 100 },
  { id: 20, name: 'Free Parking', type: 'free_parking' },
  { id: 21, name: 'Kentucky Ave', type: 'property', color: 'red', price: 220, baseRent: 18, setRent: 36, mortgageValue: 110 },
  { id: 22, name: 'Chance', type: 'chance' },
  { id: 23, name: 'Indiana Ave', type: 'property', color: 'red', price: 220, baseRent: 18, setRent: 36, mortgageValue: 110 },
  { id: 24, name: 'Illinois Ave', type: 'property', color: 'red', price: 240, baseRent: 20, setRent: 40, mortgageValue: 120 },
  { id: 25, name: 'B&O Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { id: 26, name: 'Atlantic Ave', type: 'property', color: 'yellow', price: 260, baseRent: 22, setRent: 44, mortgageValue: 130 },
  { id: 27, name: 'Ventnor Ave', type: 'property', color: 'yellow', price: 260, baseRent: 22, setRent: 44, mortgageValue: 130 },
  { id: 28, name: 'Water Works', type: 'utility', price: 150, mortgageValue: 75 },
  { id: 29, name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, baseRent: 24, setRent: 48, mortgageValue: 140 },
  { id: 30, name: 'Go To Jail', type: 'go_to_jail' },
  { id: 31, name: 'Pacific Ave', type: 'property', color: 'green', price: 300, baseRent: 26, setRent: 52, mortgageValue: 150 },
  { id: 32, name: 'North Carolina Ave', type: 'property', color: 'green', price: 300, baseRent: 26, setRent: 52, mortgageValue: 150 },
  { id: 33, name: 'Community Chest', type: 'community_chest' },
  { id: 34, name: 'Pennsylvania Ave', type: 'property', color: 'green', price: 320, baseRent: 28, setRent: 56, mortgageValue: 160 },
  { id: 35, name: 'Short Line Railroad', type: 'railroad', price: 200, mortgageValue: 100 },
  { id: 36, name: 'Chance', type: 'chance' },
  { id: 37, name: 'Park Place', type: 'property', color: 'dark-blue', price: 350, baseRent: 35, setRent: 70, mortgageValue: 175 },
  { id: 38, name: 'Luxury Tax', type: 'luxury_tax', taxAmount: 100 },
  { id: 39, name: 'Boardwalk', type: 'property', color: 'dark-blue', price: 400, baseRent: 50, setRent: 100, mortgageValue: 200 },
];

/** Space IDs belonging to each color group */
export const COLOR_GROUPS: Record<string, number[]> = {
  'brown': [1, 3],
  'light-blue': [6, 8, 9],
  'pink': [11, 13, 14],
  'orange': [16, 18, 19],
  'red': [21, 23, 24],
  'yellow': [26, 27, 29],
  'green': [31, 32, 34],
  'dark-blue': [37, 39],
};

export const RAILROAD_IDS = [5, 15, 25, 35];
export const UTILITY_IDS = [12, 28];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createShuffledDeck(cards: Card[]): Card[] {
  return shuffle([...cards]);
}

export const CHANCE_CARDS: Card[] = [
  { id: 1, type: 'chance', text: 'Advance to Go! Collect $200.', effect: { kind: 'move_to', position: 0, collectGo: true } },
  { id: 2, type: 'chance', text: 'Advance to Illinois Ave.', effect: { kind: 'move_to', position: 24, collectGo: true } },
  { id: 3, type: 'chance', text: 'Advance to St. Charles Place.', effect: { kind: 'move_to', position: 11, collectGo: true } },
  { id: 4, type: 'chance', text: 'Advance to the nearest Railroad.', effect: { kind: 'nearest_railroad' } },
  { id: 5, type: 'chance', text: 'Bank pays you a dividend of $50.', effect: { kind: 'money', amount: 50 } },
  { id: 6, type: 'chance', text: 'Get Out of Jail Free!', effect: { kind: 'get_out_of_jail' } },
  { id: 7, type: 'chance', text: 'Go Back 3 Spaces.', effect: { kind: 'move_by', spaces: -3 } },
  { id: 8, type: 'chance', text: 'Go directly to Jail! Do not pass Go, do not collect $200.', effect: { kind: 'go_to_jail' } },
  { id: 9, type: 'chance', text: 'Pay school fees of $150.', effect: { kind: 'money', amount: -150 } },
  { id: 10, type: 'chance', text: 'Speeding fine. Pay $15.', effect: { kind: 'money', amount: -15 } },
  { id: 11, type: 'chance', text: 'Advance to Boardwalk!', effect: { kind: 'move_to', position: 39, collectGo: true } },
  { id: 12, type: 'chance', text: 'You won a crossword competition! Collect $100.', effect: { kind: 'money', amount: 100 } },
  { id: 13, type: 'chance', text: 'Your building loan matures. Collect $150.', effect: { kind: 'money', amount: 150 } },
  { id: 14, type: 'chance', text: 'It is your birthday! Collect $10 from every other player.', effect: { kind: 'collect_each', amount: 10 } },
  { id: 15, type: 'chance', text: 'Advance to Reading Railroad.', effect: { kind: 'move_to', position: 5, collectGo: true } },
  { id: 16, type: 'chance', text: 'Advance to the nearest Utility.', effect: { kind: 'nearest_utility' } },
];

export const COMMUNITY_CHEST_CARDS: Card[] = [
  { id: 1, type: 'community_chest', text: 'Advance to Go! Collect $200.', effect: { kind: 'move_to', position: 0, collectGo: true } },
  { id: 2, type: 'community_chest', text: 'Bank error in your favor – Collect $200!', effect: { kind: 'money', amount: 200 } },
  { id: 3, type: 'community_chest', text: "Doctor's fees. Pay $50.", effect: { kind: 'money', amount: -50 } },
  { id: 4, type: 'community_chest', text: 'From sale of stock you get $50.', effect: { kind: 'money', amount: 50 } },
  { id: 5, type: 'community_chest', text: 'Get Out of Jail Free!', effect: { kind: 'get_out_of_jail' } },
  { id: 6, type: 'community_chest', text: 'Go to Jail! Do not pass Go, do not collect $200.', effect: { kind: 'go_to_jail' } },
  { id: 7, type: 'community_chest', text: 'Holiday fund matures. Collect $100.', effect: { kind: 'money', amount: 100 } },
  { id: 8, type: 'community_chest', text: 'Income tax refund. Collect $20.', effect: { kind: 'money', amount: 20 } },
  { id: 9, type: 'community_chest', text: 'It is your birthday! Collect $10 from every other player.', effect: { kind: 'collect_each', amount: 10 } },
  { id: 10, type: 'community_chest', text: 'Life insurance matures. Collect $100.', effect: { kind: 'money', amount: 100 } },
  { id: 11, type: 'community_chest', text: 'Pay hospital fees of $100.', effect: { kind: 'money', amount: -100 } },
  { id: 12, type: 'community_chest', text: 'Pay school fees of $150.', effect: { kind: 'money', amount: -150 } },
  { id: 13, type: 'community_chest', text: 'Receive $25 consultancy fee.', effect: { kind: 'money', amount: 25 } },
  { id: 14, type: 'community_chest', text: 'Street repairs assessment. Pay $40.', effect: { kind: 'money', amount: -40 } },
  { id: 15, type: 'community_chest', text: 'You have won second prize in a beauty contest. Collect $10!', effect: { kind: 'money', amount: 10 } },
  { id: 16, type: 'community_chest', text: 'You inherit $100.', effect: { kind: 'money', amount: 100 } },
];
