import { Animal, AnimalId } from './animal.model';

export interface Player {
  animal: Animal;
  pseudo: string;
  score: number;
}

export interface RoundResult {
  player: Player;
  paletsRemaining: number;
  basePoints: number;
  proximityBonus: number;
  totalGained: number;
}

export const VICTORY_SCORE = 25;
export const PROXIMITY_BONUSES: Record<number, number> = { 0: 3, 1: 2, 2: 1 };
