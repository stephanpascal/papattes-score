import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ANIMALS, Animal } from '../../models/animal.model';
import { GameService } from '../../services/game.service';

interface AnimalCard {
  animal: Animal;
  selected: boolean;
  pseudo: string;
}

@Component({
  selector: 'app-player-selection',
  imports: [FormsModule],
  templateUrl: './player-selection.component.html',
  styleUrl: './player-selection.component.scss',
})
export class PlayerSelectionComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  cards = signal<AnimalCard[]>(
    ANIMALS.map(a => ({ animal: a, selected: false, pseudo: '' }))
  );

  selectedCount = computed(() => this.cards().filter(c => c.selected).length);
  canStart = computed(() => this.selectedCount() >= 2);

  ngOnInit(): void {
    // Reprendre automatiquement si une partie sauvegardée existe
    if (this.gameService.hasSavedGame()) {
      if (this.gameService.hasWinner()) {
        this.router.navigate(['/victory']);
      } else {
        this.router.navigate(['/game']);
      }
    }
  }

  toggleCard(index: number): void {
    this.cards.update(cards =>
      cards.map((c, i) =>
        i === index ? { ...c, selected: !c.selected } : c
      )
    );
  }

  startGame(): void {
    if (!this.canStart()) return;
    const selections = this.cards()
      .filter(c => c.selected)
      .map(c => ({
        animal: c.animal,
        pseudo: c.pseudo.trim() || c.animal.name,
      }));
    this.gameService.startGame(selections);
    this.router.navigate(['/game']);
  }
}
