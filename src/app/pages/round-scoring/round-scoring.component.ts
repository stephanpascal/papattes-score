import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RoundResult } from '../../models/game.model';
import { AnimalId } from '../../models/animal.model';

type Phase = 'count' | 'rank' | 'summary';

@Component({
  selector: 'app-round-scoring',
  imports: [],
  templateUrl: './round-scoring.component.html',
  styleUrl: './round-scoring.component.scss',
})
export class RoundScoringComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  players = this.gameService.players;
  round = this.gameService.round;

  phase = signal<Phase>('count');
  paletsMap = signal<Record<AnimalId, number>>({} as Record<AnimalId, number>);
  proximityOrder = signal<AnimalId[]>([]);
  roundResults = signal<RoundResult[]>([]);

  // Joueurs ayant au moins 1 palet sur le terrain
  playersWithPalets = computed(() => {
    const palets = this.paletsMap();
    return this.players().filter(p => (palets[p.animal.id] ?? 0) > 0);
  });

  // Nombre de rangs à attribuer : min(joueurs avec palets, 3)
  maxRanks = computed(() => Math.min(this.playersWithPalets().length, 3));

  // Rang actuel à attribuer (1, 2 ou 3 — affiché dans le titre)
  nextRankLabel = computed(() => {
    const labels = ['1er', '2ème', '3ème'];
    return labels[this.proximityOrder().length] ?? '';
  });

  nextRankBonus = computed(() => {
    const bonuses = [3, 2, 1];
    return bonuses[this.proximityOrder().length] ?? 0;
  });

  // Tous les rangs nécessaires sont attribués → Valider disponible
  canValidate = computed(
    () => this.proximityOrder().length === this.maxRanks()
  );

  isRanked = (id: AnimalId) => this.proximityOrder().includes(id);

  getRankLabel(id: AnimalId): string {
    const labels = ['1er', '2ème', '3ème'];
    return labels[this.proximityOrder().indexOf(id)] ?? '';
  }

  // Carte inactive : rang max atteint et non encore classée
  isLocked = (id: AnimalId) =>
    !this.isRanked(id) && this.proximityOrder().length >= this.maxRanks();

  ngOnInit(): void {
    if (this.players().length === 0) {
      this.router.navigate(['/selection']);
      return;
    }
    const initial: Record<AnimalId, number> = {} as Record<AnimalId, number>;
    this.players().forEach(p => (initial[p.animal.id] = 0));
    this.paletsMap.set(initial);
  }

  incrementPalets(id: AnimalId): void {
    this.paletsMap.update(m => ({ ...m, [id]: Math.min(4, (m[id] ?? 0) + 1) }));
  }

  decrementPalets(id: AnimalId): void {
    this.paletsMap.update(m => ({ ...m, [id]: Math.max(0, (m[id] ?? 0) - 1) }));
  }

  validateCount(): void {
    const withPalets = this.playersWithPalets();
    if (withPalets.length === 0) {
      this.finalizeRound();
      return;
    }
    // 1 seul joueur avec des palets → auto-classé 1er, pas besoin de l'UI
    if (withPalets.length === 1) {
      this.proximityOrder.set([withPalets[0].animal.id]);
      this.finalizeRound();
      return;
    }
    this.proximityOrder.set([]);
    this.phase.set('rank');
  }

  // Tap sur une carte : assigne le rang suivant, ou retire le rang si déjà classée
  tapCard(id: AnimalId): void {
    if (this.isRanked(id)) {
      // Retire ce rang → les suivants décalent automatiquement (ordre du tableau)
      this.proximityOrder.update(o => o.filter(x => x !== id));
    } else if (this.proximityOrder().length < this.maxRanks()) {
      // Assigne le rang suivant disponible
      this.proximityOrder.update(o => [...o, id]);
    }
  }

  confirmRanks(): void {
    if (!this.canValidate()) return;
    this.finalizeRound();
  }

  private finalizeRound(): void {
    const results = this.gameService.computeRoundResults(
      this.paletsMap(),
      this.proximityOrder()
    );
    this.roundResults.set(results);
    this.phase.set('summary');
  }

  confirmSummary(): void {
    this.gameService.applyRoundResults(this.roundResults());
    if (this.gameService.hasWinner()) {
      this.router.navigate(['/victory']);
    } else {
      this.router.navigate(['/game']);
    }
  }
}
