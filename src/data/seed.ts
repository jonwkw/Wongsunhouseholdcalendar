import type { AppData, ChecklistItem } from '../types'
import { todayKey } from '../utils/dates'

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c-teeth-am', emoji: '🪥', text: 'Brush teeth in the morning' },
  { id: 'c-breakfast', emoji: '🥣', text: 'Eat a good breakfast' },
  { id: 'c-bag', emoji: '🎒', text: 'Pack your school bag' },
  { id: 'c-read', emoji: '📖', text: 'Read for 15 minutes' },
  { id: 'c-tidy', emoji: '🧸', text: 'Tidy up your toys' },
  { id: 'c-teeth-pm', emoji: '🌙', text: 'Brush teeth before bed' },
]

// Minimal starter data: one example of each thing so the logic is easy to verify.
export function seedData(): AppData {
  const today = todayKey()

  return {
    version: 2,
    members: [
      { id: 'jonathan', name: 'Jonathan', emoji: '👨', color: '#3b82c4', avatar: { age: 'adult', skin: 1, hair: 2, hairColor: 0, facialHair: 0 } },
      { id: 'lilian', name: 'Lilian', emoji: '👩', color: '#c45b9d', avatar: { age: 'adult', skin: 0, hair: 9, hairColor: 0, facialHair: 0, gender: 'female' } },
      { id: 'jenny', name: 'Jenny', emoji: '🧑‍🍳', color: '#2f9e77', avatar: { age: 'adult', skin: 2, hair: 10, hairColor: 0, facialHair: 0, gender: 'female' } },
      { id: 'waipo', name: 'Waipo', emoji: '👵', color: '#8a6bbf', avatar: { age: 'grandparent', skin: 1, hair: 8, hairColor: 3, facialHair: 0, gender: 'female' } },
      { id: 'rosco', name: 'Rosco', emoji: '🧒', color: '#e08a2e', isChild: true, avatar: { age: 'kid', skin: 1, hair: 4, hairColor: 0, facialHair: 0 } },
      { id: 'casper', name: 'Casper', emoji: '👶', color: '#d95d5d', isChild: true, avatar: { age: 'baby', skin: 0, hair: 19, hairColor: 0, facialHair: 0 } },
    ],
    activities: [],
    activityTemplates: [],
    dayNotes: [],
    dishes: [
      { id: 'd-1', name: 'Chicken rice', emoji: '🍗', slot: 'lunch' },
      { id: 'd-2', name: 'Fish porridge', emoji: '🐟', slot: 'dinner' },
      { id: 'd-3', name: 'Stir-fried veggies', emoji: '🥬', slot: 'any' },
      { id: 'd-4', name: 'Noodle soup', emoji: '🍜', slot: 'lunch' },
      { id: 'd-5', name: 'Fruit platter', emoji: '🍉', slot: 'snack' },
    ],
    menuEntries: [
      { id: 'm-1', date: today, slot: 'dinner', dishName: 'Fish porridge', emoji: '🐟', memberIds: [] },
    ],
    boardItems: [
      {
        id: 'b-1',
        kind: 'reminder',
        text: 'Clean the balcony this weekend',
        byMemberId: 'lilian',
        assignedToId: 'jonathan',
        status: 'open',
        createdAt: today,
      },
    ],
    kidChecklist: DEFAULT_CHECKLIST,
    kidChecks: {},
    starDays: [],
  }
}
