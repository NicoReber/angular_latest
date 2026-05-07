import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { BoardSpace, Card, GamePhase, Player, PlayerColor, RentInfo } from './game.models';
import {
  BOARD,
  CHANCE_CARDS,
  COLOR_GROUPS,
  COMMUNITY_CHEST_CARDS,
  RAILROAD_IDS,
  UTILITY_IDS,
  createShuffledDeck,
} from './game.data';

type RenderedSpace = BoardSpace & {
  gridRow: number;
  gridCol: number;
  side: 'top' | 'bottom' | 'left' | 'right' | 'corner';
  occupants: Player[];
  ownerId: number;
  ownerColor: PlayerColor | null;
};

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // ─── Constants ────────────────────────────────────────────────────────────
  protected readonly BOARD = BOARD;
  protected readonly PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

  // ─── Setup ────────────────────────────────────────────────────────────────
  protected readonly setupCount = signal(2);
  protected readonly setupNames = signal(['Alice', 'Bob', 'Charlie', 'Dave']);

  // ─── Core state ───────────────────────────────────────────────────────────
  protected readonly players = signal<Player[]>([]);
  protected readonly owned = signal<Record<number, number>>({});
  protected readonly phase = signal<GamePhase>('setup');
  protected readonly currentIdx = signal(0);
  protected readonly dice = signal<[number, number] | null>(null);
  protected readonly consecutiveDoubles = signal(0);
  protected readonly log = signal<string[]>([]);
  protected readonly pendingCard = signal<Card | null>(null);
  protected readonly pendingRent = signal<RentInfo | null>(null);
  protected readonly winner = signal<Player | null>(null);

  private readonly lastDiceSum = signal(0);
  private readonly chanceDeck = signal<Card[]>([]);
  private readonly ccDeck = signal<Card[]>([]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  protected readonly currentPlayer = computed(() => this.players()[this.currentIdx()] ?? null);

  protected readonly activePlayers = computed(() => this.players().filter((p) => !p.isBankrupt));

  protected readonly rolledDoubles = computed(() => {
    const d = this.dice();
    return d !== null && d[0] === d[1];
  });

  protected readonly boardSpaces = computed<RenderedSpace[]>(() => {
    const owned = this.owned();
    const players = this.players();
    return BOARD.map((space) => ({
      ...space,
      gridRow: this.spaceRow(space.id),
      gridCol: this.spaceCol(space.id),
      side: this.spaceSide(space.id),
      occupants: players.filter((p) => p.position === space.id && !p.isBankrupt),
      ownerId: owned[space.id] ?? -1,
      ownerColor: owned[space.id] !== undefined ? (players[owned[space.id]]?.color ?? null) : null,
    }));
  });

  // ─── Setup actions ────────────────────────────────────────────────────────
  protected setCount(n: number): void {
    this.setupCount.set(n);
  }

  protected updateName(i: number, value: string): void {
    this.setupNames.update((arr) => {
      const copy = [...arr];
      copy[i] = value;
      return copy;
    });
  }

  protected startGame(): void {
    const count = this.setupCount();
    const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
    const players: Player[] = this.setupNames()
      .slice(0, count)
      .map((name, i) => ({
        id: i,
        name: name.trim() || `Player ${i + 1}`,
        color: colors[i],
        money: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        isBankrupt: false,
        ownedProperties: [],
        getOutOfJailCards: 0,
      }));

    this.players.set(players);
    this.owned.set({});
    this.phase.set('pre_roll');
    this.currentIdx.set(0);
    this.dice.set(null);
    this.consecutiveDoubles.set(0);
    this.pendingCard.set(null);
    this.pendingRent.set(null);
    this.winner.set(null);
    this.lastDiceSum.set(0);
    this.chanceDeck.set(createShuffledDeck(CHANCE_CARDS));
    this.ccDeck.set(createShuffledDeck(COMMUNITY_CHEST_CARDS));
    this.log.set([
      `🎲 Game started! Each player begins with $1,500.`,
      `👤 It's ${players[0].name}'s turn.`,
    ]);
  }

  // ─── Dice & movement ──────────────────────────────────────────────────────
  protected rollDice(): void {
    if (this.phase() !== 'pre_roll') return;

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const doubles = die1 === die2;

    this.dice.set([die1, die2]);
    this.lastDiceSum.set(total);

    const player = this.currentPlayer()!;
    this.addLog(
      `${player.name} rolled ${die1} + ${die2} = ${total}${doubles ? ' 🎰 Doubles!' : ''}.`,
    );

    if (player.inJail) {
      this.handleJailRoll(player.id, total, doubles);
    } else {
      if (doubles) {
        const count = this.consecutiveDoubles() + 1;
        if (count >= 3) {
          this.addLog(`${player.name} rolled 3 consecutive doubles — Go directly to Jail!`);
          this.consecutiveDoubles.set(0);
          this.sendToJail(player.id);
          this.phase.set('post_roll');
          return;
        }
        this.consecutiveDoubles.set(count);
      } else {
        this.consecutiveDoubles.set(0);
      }
      this.doMove(player.id, total, true, doubles);
    }
  }

  private handleJailRoll(playerId: number, total: number, doubles: boolean): void {
    const player = this.players().find((p) => p.id === playerId)!;
    if (doubles) {
      this.addLog(`${player.name} rolled doubles and escaped jail!`);
      this.updatePlayer(playerId, { inJail: false, jailTurns: 0 });
      this.consecutiveDoubles.set(0);
      this.doMove(playerId, total, true, false); // no extra roll after jail escape
    } else {
      const turns = player.jailTurns + 1;
      if (turns >= 3) {
        this.addLog(`${player.name} failed to roll doubles 3 times — pays $50 and moves.`);
        this.updatePlayer(playerId, { inJail: false, jailTurns: 0 });
        this.deductMoney(playerId, 50);
        this.doMove(playerId, total, true, false);
      } else {
        this.addLog(`${player.name} stays in jail (${turns}/3 turns used).`);
        this.updatePlayer(playerId, { jailTurns: turns });
        this.consecutiveDoubles.set(0);
        this.phase.set('post_roll');
      }
    }
  }

  private doMove(
    playerId: number,
    steps: number,
    checkGo: boolean,
    rolledDoubles: boolean,
  ): void {
    const player = this.players().find((p) => p.id === playerId)!;
    const oldPos = player.position;
    const newPos = (oldPos + steps + 40) % 40;

    if (checkGo && newPos < oldPos && steps > 0) {
      this.addLog(`${player.name} passed Go! Collect $200.`);
      this.addMoney(playerId, 200);
    }

    this.updatePlayer(playerId, { position: newPos });
    this.addLog(`${player.name} landed on ${BOARD[newPos].name}.`);
    this.handleLanding(playerId, newPos, rolledDoubles);
  }

  private moveTo(playerId: number, target: number, collectGo: boolean): void {
    const player = this.players().find((p) => p.id === playerId)!;
    if (collectGo && target < player.position) {
      this.addLog(`${player.name} passed Go! Collect $200.`);
      this.addMoney(playerId, 200);
    }
    this.updatePlayer(playerId, { position: target });
    this.addLog(`${player.name} moved to ${BOARD[target].name}.`);
    this.handleLanding(playerId, target, false);
  }

  private moveBy(playerId: number, spaces: number): void {
    const player = this.players().find((p) => p.id === playerId)!;
    const oldPos = player.position;
    const newPos = ((oldPos + spaces) % 40 + 40) % 40;
    if (spaces > 0 && newPos < oldPos) {
      this.addLog(`${player.name} passed Go! Collect $200.`);
      this.addMoney(playerId, 200);
    }
    this.updatePlayer(playerId, { position: newPos });
    this.addLog(`${player.name} moved to ${BOARD[newPos].name}.`);
    this.handleLanding(playerId, newPos, false);
  }

  private handleLanding(playerId: number, pos: number, rolledDoubles: boolean): void {
    const space = BOARD[pos];
    const player = this.players().find((p) => p.id === playerId)!;

    switch (space.type) {
      case 'go':
        this.phase.set('post_roll');
        break;

      case 'property':
      case 'railroad':
      case 'utility': {
        const ownerId = this.owned()[pos];
        if (ownerId === undefined) {
          this.phase.set('buy_prompt');
        } else if (ownerId === playerId) {
          this.addLog(`${player.name} owns ${space.name} — no rent due.`);
          this.phase.set('post_roll');
        } else {
          const owner = this.players().find((p) => p.id === ownerId)!;
          const rent = this.calcRent(pos, ownerId);
          this.addLog(`${player.name} owes $${rent} rent to ${owner.name}.`);
          this.pendingRent.set({ amount: rent, toPlayerId: ownerId, toPlayerName: owner.name });
          this.payRent(playerId, ownerId, rent);
        }
        break;
      }

      case 'income_tax':
        this.addLog(`${player.name} pays Income Tax: $${space.taxAmount}.`);
        this.deductMoney(playerId, space.taxAmount!);
        this.checkBankruptcy();
        this.phase.set('post_roll');
        break;

      case 'luxury_tax':
        this.addLog(`${player.name} pays Luxury Tax: $${space.taxAmount}.`);
        this.deductMoney(playerId, space.taxAmount!);
        this.checkBankruptcy();
        this.phase.set('post_roll');
        break;

      case 'chance':
        this.drawCard('chance', playerId);
        break;

      case 'community_chest':
        this.drawCard('community_chest', playerId);
        break;

      case 'go_to_jail':
        this.sendToJail(playerId);
        this.phase.set('post_roll');
        break;

      default:
        this.addLog(`${player.name} is just visiting.`);
        this.phase.set('post_roll');
        break;
    }

    // Unused parameter kept to signal caller intent; suppress TS warning
    void rolledDoubles;
  }

  // ─── Properties ───────────────────────────────────────────────────────────
  protected buyProperty(): void {
    if (this.phase() !== 'buy_prompt') return;
    const player = this.currentPlayer()!;
    const space = BOARD[player.position];
    if (!space.price) return;

    if (player.money < space.price) {
      this.addLog(`${player.name} can't afford ${space.name} ($${space.price}).`);
      this.phase.set('post_roll');
      return;
    }

    this.deductMoney(player.id, space.price);
    this.owned.update((map) => ({ ...map, [space.id]: player.id }));
    this.updatePlayer(player.id, { ownedProperties: [...player.ownedProperties, space.id] });
    this.addLog(`${player.name} bought ${space.name} for $${space.price}! 🏠`);
    this.phase.set('post_roll');
  }

  protected declineBuy(): void {
    const space = BOARD[this.currentPlayer()!.position];
    this.addLog(`${this.currentPlayer()!.name} declined to buy ${space.name}.`);
    this.phase.set('post_roll');
  }

  private payRent(fromId: number, toId: number, amount: number): void {
    const payer = this.players().find((p) => p.id === fromId)!;
    const actualPay = Math.min(amount, payer.money);
    this.deductMoney(fromId, actualPay);
    this.addMoney(toId, actualPay);
    if (actualPay < amount) {
      this.addLog(
        `${payer.name} could only pay $${actualPay} (insufficient funds — bankrupt!).`,
      );
    }
    this.checkBankruptcy();
    this.phase.set('post_roll');
    this.pendingRent.set(null);
  }

  private calcRent(spaceId: number, ownerId: number): number {
    const space = BOARD[spaceId];
    const owner = this.players().find((p) => p.id === ownerId)!;

    if (space.type === 'railroad') {
      const count = owner.ownedProperties.filter((id) => RAILROAD_IDS.includes(id)).length;
      return 25 * Math.pow(2, count - 1);
    }

    if (space.type === 'utility') {
      const count = owner.ownedProperties.filter((id) => UTILITY_IDS.includes(id)).length;
      return this.lastDiceSum() * (count === 2 ? 10 : 4);
    }

    if (space.type === 'property' && space.color) {
      const group = COLOR_GROUPS[space.color] ?? [];
      const ownsAll = group.every((id) => owner.ownedProperties.includes(id));
      return ownsAll ? (space.setRent ?? 0) : (space.baseRent ?? 0);
    }

    return 0;
  }

  // ─── Cards ────────────────────────────────────────────────────────────────
  private drawCard(type: 'chance' | 'community_chest', playerId: number): void {
    const deck = type === 'chance' ? this.chanceDeck : this.ccDeck;
    const source = type === 'chance' ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;
    if (deck().length === 0) {
      deck.set(createShuffledDeck(source));
    }
    const [card, ...rest] = deck();
    deck.set(rest);
    this.pendingCard.set(card);
    const label = type === 'chance' ? 'Chance' : 'Community Chest';
    this.addLog(`${this.players().find((p) => p.id === playerId)!.name} drew a ${label} card.`);
    this.phase.set('card_display');
  }

  protected resolveCard(): void {
    const card = this.pendingCard();
    if (!card) return;
    const player = this.currentPlayer()!;
    const effect = card.effect;
    this.pendingCard.set(null);

    switch (effect.kind) {
      case 'money':
        if (effect.amount >= 0) {
          this.addMoney(player.id, effect.amount);
          this.addLog(`${player.name} received $${effect.amount}.`);
        } else {
          this.deductMoney(player.id, -effect.amount);
          this.addLog(`${player.name} paid $${-effect.amount}.`);
        }
        this.checkBankruptcy();
        this.phase.set('post_roll');
        break;

      case 'move_to':
        this.moveTo(player.id, effect.position, effect.collectGo);
        break;

      case 'move_by':
        this.moveBy(player.id, effect.spaces);
        break;

      case 'go_to_jail':
        this.sendToJail(player.id);
        this.phase.set('post_roll');
        break;

      case 'get_out_of_jail':
        this.updatePlayer(player.id, {
          getOutOfJailCards: player.getOutOfJailCards + 1,
        });
        this.addLog(`${player.name} received a Get Out of Jail Free card!`);
        this.phase.set('post_roll');
        break;

      case 'collect_each': {
        const others = this.activePlayers().filter((p) => p.id !== player.id);
        let total = 0;
        others.forEach((p) => {
          const paid = Math.min(effect.amount, p.money);
          this.deductMoney(p.id, paid);
          total += paid;
        });
        this.addMoney(player.id, total);
        this.addLog(
          `${player.name} collected $${effect.amount} from each other player ($${total} total).`,
        );
        this.checkBankruptcy();
        this.phase.set('post_roll');
        break;
      }

      case 'pay_each': {
        const others = this.activePlayers().filter((p) => p.id !== player.id);
        const total = effect.amount * others.length;
        this.deductMoney(player.id, total);
        others.forEach((p) => this.addMoney(p.id, effect.amount));
        this.addLog(`${player.name} paid $${effect.amount} to each other player ($${total} total).`);
        this.checkBankruptcy();
        this.phase.set('post_roll');
        break;
      }

      case 'nearest_railroad': {
        const pos = player.position;
        const nearest = RAILROAD_IDS.find((id) => id > pos) ?? RAILROAD_IDS[0];
        this.moveTo(player.id, nearest, true);
        break;
      }

      case 'nearest_utility': {
        const pos = player.position;
        const nearest = UTILITY_IDS.find((id) => id > pos) ?? UTILITY_IDS[0];
        this.moveTo(player.id, nearest, true);
        break;
      }
    }
  }

  // ─── Jail ─────────────────────────────────────────────────────────────────
  private sendToJail(playerId: number): void {
    const player = this.players().find((p) => p.id === playerId)!;
    this.addLog(`${player.name} goes to Jail! 🔒`);
    this.updatePlayer(playerId, { position: 10, inJail: true, jailTurns: 0 });
    this.consecutiveDoubles.set(0);
  }

  protected payJailFine(): void {
    const player = this.currentPlayer()!;
    if (!player.inJail || player.money < 50) return;
    this.deductMoney(player.id, 50);
    this.updatePlayer(player.id, { inJail: false, jailTurns: 0 });
    this.addLog(`${player.name} paid $50 bail and is free!`);
  }

  protected useJailCard(): void {
    const player = this.currentPlayer()!;
    if (!player.inJail || player.getOutOfJailCards === 0) return;
    this.updatePlayer(player.id, {
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: player.getOutOfJailCards - 1,
    });
    this.addLog(`${player.name} used a Get Out of Jail Free card!`);
  }

  // ─── Turn management ──────────────────────────────────────────────────────
  protected endTurn(): void {
    if (this.phase() !== 'post_roll') return;

    const current = this.currentPlayer()!;

    // If doubles and player is not (now) in jail: roll again same player
    if (this.rolledDoubles() && !current.inJail) {
      this.addLog(`${current.name} rolled doubles — rolls again!`);
      this.dice.set(null);
      this.phase.set('pre_roll');
      return;
    }

    const active = this.activePlayers();
    if (active.length <= 1) {
      this.declareWinner();
      return;
    }

    // Advance to next non-bankrupt player
    let nextIdx = (this.currentIdx() + 1) % this.players().length;
    while (this.players()[nextIdx].isBankrupt) {
      nextIdx = (nextIdx + 1) % this.players().length;
    }
    this.currentIdx.set(nextIdx);
    this.dice.set(null);
    this.phase.set('pre_roll');
    this.addLog(`👤 It's ${this.players()[nextIdx].name}'s turn.`);
  }

  // ─── Bankruptcy & winner ──────────────────────────────────────────────────
  private checkBankruptcy(): void {
    this.players().forEach((p) => {
      if (!p.isBankrupt && p.money <= 0) {
        this.addLog(`💀 ${p.name} is bankrupt and out of the game!`);
        this.updatePlayer(p.id, { isBankrupt: true, money: 0 });
        // Return owned properties to the bank
        const current = { ...this.owned() };
        p.ownedProperties.forEach((id) => delete current[id]);
        this.owned.set(current);
        this.updatePlayer(p.id, { ownedProperties: [] });
      }
    });
    if (this.activePlayers().length <= 1) {
      this.declareWinner();
    }
  }

  private declareWinner(): void {
    const active = this.activePlayers();
    if (active.length === 1) {
      this.winner.set(active[0]);
      this.addLog(`🏆 ${active[0].name} wins the game!`);
    }
    this.phase.set('game_over');
  }

  protected newGame(): void {
    this.phase.set('setup');
  }

  // ─── Player state helpers ─────────────────────────────────────────────────
  private updatePlayer(id: number, patch: Partial<Player>): void {
    this.players.update((arr) => arr.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  private addMoney(playerId: number, amount: number): void {
    const p = this.players().find((p) => p.id === playerId)!;
    this.updatePlayer(playerId, { money: p.money + amount });
  }

  private deductMoney(playerId: number, amount: number): void {
    const p = this.players().find((p) => p.id === playerId)!;
    this.updatePlayer(playerId, { money: Math.max(0, p.money - amount) });
  }

  private addLog(msg: string): void {
    this.log.update((arr) => [msg, ...arr].slice(0, 60));
  }

  // ─── Board grid helpers ───────────────────────────────────────────────────
  private spaceRow(id: number): number {
    if (id <= 10) return 11;           // bottom row
    if (id <= 19) return 10 - (id - 11); // left col: 10 down to 2
    if (id <= 30) return 1;            // top row
    return id - 29;                    // right col: 2 up to 10
  }

  private spaceCol(id: number): number {
    if (id === 0) return 11;           // Go: bottom-right corner
    if (id <= 9) return 11 - id;       // bottom row: col 10 down to 2
    if (id <= 20) return 1;            // left col (incl. corners 10, 20)
    if (id <= 29) return id - 19;      // top row: col 2 up to 10
    if (id === 30) return 11;          // Go to Jail: top-right corner
    return 11;                         // right col
  }

  private spaceSide(id: number): RenderedSpace['side'] {
    if (id === 0 || id === 10 || id === 20 || id === 30) return 'corner';
    if (id <= 9) return 'bottom';
    if (id <= 19) return 'left';
    if (id <= 29) return 'top';
    return 'right';
  }

  // ─── Template helpers ─────────────────────────────────────────────────────
  protected colorHex(color: string | undefined): string {
    const map: Record<string, string> = {
      'brown': '#8B4513',
      'light-blue': '#87CEEB',
      'pink': '#FF69B4',
      'orange': '#FF8C00',
      'red': '#DC143C',
      'yellow': '#FFD700',
      'green': '#228B22',
      'dark-blue': '#00008B',
    };
    return color ? (map[color] ?? 'transparent') : 'transparent';
  }

  protected spaceIcon(type: string): string {
    const icons: Record<string, string> = {
      go: '🚀', railroad: '🚂', utility: '💡',
      income_tax: '💸', luxury_tax: '💎',
      chance: '?', community_chest: '🎁',
      jail: '🔒', go_to_jail: '👮', free_parking: '🚗',
    };
    return icons[type] ?? '';
  }

  protected tokenBg(color: PlayerColor): string {
    const map: Record<PlayerColor, string> = {
      red: '#DC143C', blue: '#1565C0', green: '#2E7D32', yellow: '#F9A825',
    };
    return map[color];
  }

  protected trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
