import { Injectable, signal, computed, effect } from '@angular/core';
import { ANIMALS, Animal, AnimalId } from '../models/animal.model';
import { Player, RoundResult, VICTORY_SCORE, PROXIMITY_BONUSES } from '../models/game.model';

const STORAGE_KEY = 'papattes-game-state';

interface SavedState {
  players: { animalId: AnimalId; pseudo: string; score: number }[];
  round: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly players = signal<Player[]>([]);
  readonly round = signal(1);
  readonly winners = signal<Player[]>([]);

  readonly hasWinner = computed(() => this.winners().length > 0);
  readonly hasTiedWinners = computed(() => this.winners().length > 1);
  readonly hasSavedGame = computed(() => this.players().length > 0);

  constructor() {
    this.loadState();

    // Auto-sauvegarde à chaque changement d'état
    effect(() => {
      const players = this.players();
      const round = this.round();
      this.persist(players, round);
    });
  }

  startGame(selections: { animal: Animal; pseudo: string }[]): void {
    this.players.set(selections.map(s => ({ ...s, score: 0 })));
    this.round.set(1);
    this.winners.set([]);
  }

  computeRoundResults(
    paletsRemaining: Record<string, number>,
    proximityOrder: string[]
  ): RoundResult[] {
    return this.players().map(player => {
      const id = player.animal.id;
      const palets = paletsRemaining[id] ?? 0;
      const rankIndex = proximityOrder.indexOf(id);
      const bonus = rankIndex >= 0 ? (PROXIMITY_BONUSES[rankIndex] ?? 0) : 0;
      return {
        player,
        paletsRemaining: palets,
        basePoints: palets,
        proximityBonus: bonus,
        totalGained: palets + bonus,
      };
    });
  }

  applyRoundResults(results: RoundResult[]): void {
    this.players.update(players =>
      players.map(p => {
        const result = results.find(r => r.player.animal.id === p.animal.id);
        return result ? { ...p, score: p.score + result.totalGained } : p;
      })
    );

    const updated = this.players();
    const maxScore = Math.max(...updated.map(p => p.score));
    if (maxScore >= VICTORY_SCORE) {
      this.winners.set(updated.filter(p => p.score === maxScore));
    }

    this.round.update(r => r + 1);
  }

  resolveTie(winner: Player): void {
    this.winners.set([winner]);
  }

  resetGame(): void {
    this.players.set([]);
    this.round.set(1);
    this.winners.set([]);
  }

  // ── Persistance ────────────────────────────────────────────

  private loadState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved: SavedState = JSON.parse(raw);
      if (!Array.isArray(saved.players) || saved.players.length < 2) return;

      const players: Player[] = saved.players
        .map(sp => {
          const animal = ANIMALS.find(a => a.id === sp.animalId);
          if (!animal || typeof sp.score !== 'number') return null;
          return { animal, pseudo: String(sp.pseudo), score: sp.score };
        })
        .filter((p): p is Player => p !== null);

      if (players.length < 2) return;

      this.players.set(players);
      this.round.set(typeof saved.round === 'number' && saved.round > 0 ? saved.round : 1);

      // Restaurer les vainqueurs si la partie est terminée
      const maxScore = Math.max(...players.map(p => p.score));
      if (maxScore >= VICTORY_SCORE) {
        this.winners.set(players.filter(p => p.score === maxScore));
      }
    } catch {
      // En cas de données corrompues, on ignore silencieusement
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private persist(players: Player[], round: number): void {
    if (players.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const state: SavedState = {
      players: players.map(p => ({
        animalId: p.animal.id,
        pseudo: p.pseudo,
        score: p.score,
      })),
      round,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
