export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export type SpaceType =
  | 'go'
  | 'property'
  | 'railroad'
  | 'utility'
  | 'income_tax'
  | 'luxury_tax'
  | 'chance'
  | 'community_chest'
  | 'jail'
  | 'go_to_jail'
  | 'free_parking';

export type PropertyColor =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark-blue';

export interface BoardSpace {
  id: number;
  name: string;
  type: SpaceType;
  price?: number;
  color?: PropertyColor;
  baseRent?: number;
  setRent?: number;
  taxAmount?: number;
  mortgageValue?: number;
}

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  money: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  ownedProperties: number[];
  getOutOfJailCards: number;
}

export type CardEffect =
  | { kind: 'move_to'; position: number; collectGo: boolean }
  | { kind: 'move_by'; spaces: number }
  | { kind: 'money'; amount: number }
  | { kind: 'go_to_jail' }
  | { kind: 'get_out_of_jail' }
  | { kind: 'pay_each'; amount: number }
  | { kind: 'collect_each'; amount: number }
  | { kind: 'nearest_railroad' }
  | { kind: 'nearest_utility' };

export interface Card {
  id: number;
  type: 'chance' | 'community_chest';
  text: string;
  effect: CardEffect;
}

export type GamePhase = 'setup' | 'pre_roll' | 'post_roll' | 'buy_prompt' | 'card_display' | 'game_over';

export interface RentInfo {
  amount: number;
  toPlayerId: number;
  toPlayerName: string;
}
