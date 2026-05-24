import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { VICTORY_SCORE } from '../../models/game.model';

@Component({
  selector: 'app-game-board',
  imports: [],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  readonly victoryScore = VICTORY_SCORE;
  round = this.gameService.round;
  showConfirm = signal(false);
  showRules = signal(false);

  toggleRules(): void { this.showRules.update(v => !v); }

  scoreboard = computed(() => {
    const sorted = [...this.gameService.players()]
      .map(p => ({
        ...p,
        percent: Math.min(100, Math.round((p.score / VICTORY_SCORE) * 100)),
      }))
      .sort((a, b) => b.score - a.score);

    return sorted.map(p => ({
      ...p,
      rank: sorted.findIndex(s => s.score === p.score) + 1,
    }));
  });

  ngOnInit(): void {
    if (this.gameService.players().length === 0) {
      this.router.navigate(['/selection']);
    } else if (this.gameService.hasWinner()) {
      this.router.navigate(['/victory']);
    }
  }

  endRound(): void {
    this.router.navigate(['/scoring']);
  }

  askRestart(): void {
    this.showConfirm.set(true);
  }

  cancelRestart(): void {
    this.showConfirm.set(false);
  }

  confirmRestart(): void {
    this.gameService.resetGame();
    this.showConfirm.set(false);
    this.router.navigate(['/selection']);
  }
}
