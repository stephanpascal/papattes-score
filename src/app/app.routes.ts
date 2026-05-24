import { Routes } from '@angular/router';
import { PlayerSelectionComponent } from './pages/player-selection/player-selection.component';
import { GameBoardComponent } from './pages/game-board/game-board.component';
import { RoundScoringComponent } from './pages/round-scoring/round-scoring.component';
import { VictoryComponent } from './pages/victory/victory.component';

export const routes: Routes = [
  { path: '', redirectTo: 'selection', pathMatch: 'full' },
  { path: 'selection', component: PlayerSelectionComponent },
  { path: 'game', component: GameBoardComponent },
  { path: 'scoring', component: RoundScoringComponent },
  { path: 'victory', component: VictoryComponent },
  { path: '**', redirectTo: 'selection' },
];
