export type AnimalId = 'elephant' | 'lion' | 'gazelle' | 'zebre';

export interface Animal {
  id: AnimalId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const ANIMALS: Animal[] = [
  {
    id: 'elephant',
    name: 'Éléphant',
    emoji: '🐘',
    color: '#546E7A',
    bgColor: '#ECEFF1',
    borderColor: '#78909C',
  },
  {
    id: 'lion',
    name: 'Lion',
    emoji: '🦁',
    color: '#E65100',
    bgColor: '#FFF3E0',
    borderColor: '#FB8C00',
  },
  {
    id: 'gazelle',
    name: 'Gazelle',
    emoji: '🦌',
    color: '#33691E',
    bgColor: '#F1F8E9',
    borderColor: '#8BC34A',
  },
  {
    id: 'zebre',
    name: 'Zèbre',
    emoji: '🦓',
    color: '#263238',
    bgColor: '#F5F5F5',
    borderColor: '#607D8B',
  },
];
