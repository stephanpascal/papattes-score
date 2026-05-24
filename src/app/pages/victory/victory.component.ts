import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Player } from '../../models/game.model';

@Component({
  selector: 'app-victory',
  imports: [],
  templateUrl: './victory.component.html',
  styleUrl: './victory.component.scss',
})
export class VictoryComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  winners = this.gameService.winners;
  players = this.gameService.players;

  hasTie = computed(() => this.gameService.hasTiedWinners());
  winner = computed(() => this.winners()[0] ?? null);
  tieBreakPhase = signal(false);

  readonly MEDALS = ['🥇', '🥈', '🥉'];

  sortedPlayers = computed(() => {
    const sorted = [...this.players()].sort((a, b) => b.score - a.score);
    return sorted.map(p => {
      // Rang = position du premier joueur avec ce score (gère les ex-aequo)
      const rank = sorted.findIndex(s => s.score === p.score) + 1;
      return { ...p, rank, medal: this.MEDALS[rank - 1] ?? null };
    });
  });

  ngOnInit(): void {
    if (this.players().length === 0) {
      this.router.navigate(['/selection']);
      return;
    }
    if (this.hasTie()) {
      this.tieBreakPhase.set(true);
    }
  }

  resolveTie(winner: Player): void {
    this.gameService.resolveTie(winner);
    this.tieBreakPhase.set(false);
  }

  restart(): void {
    this.gameService.resetGame();
    this.router.navigate(['/selection']);
  }
}
