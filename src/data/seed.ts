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
      { id: 'jonathan', name: 'Jonathan', emoji: '👨', color: '#3b82c4' },
      { id: 'lilian', name: 'Lilian', emoji: '👩', color: '#c45b9d' },
      { id: 'jenny', name: 'Jenny', emoji: '🧑‍🍳', color: '#2f9e77' },
      { id: 'waipo', name: 'Waipo', emoji: '👵', color: '#8a6bbf' },
      { id: 'rosco', name: 'Rosco', emoji: '🧒', color: '#e08a2e', isChild: true },
      { id: 'casper', name: 'Casper', emoji: '👶', color: '#d95d5d', isChild: true },
    ],
    activities: [],
    activityTemplates: [
      { id: 't-school', title: 'School', emoji: '🏫', memberIds: ['rosco'], time: '07:30', endTime: '13:30' },
      { id: 't-enrich', title: 'Enrichment class', emoji: '📚', memberIds: ['rosco'], time: '15:00' },
      { id: 't-swim', title: 'Swimming', emoji: '🏊', memberIds: ['rosco', 'casper'], time: '09:00' },
      { id: 't-playdate', title: 'Playdate', emoji: '🎈', memberIds: ['rosco', 'casper'] },
      { id: 't-doctor', title: 'Doctor appointment', emoji: '🩺', memberIds: [] },
    ],
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
        kind: 'request',
        text: 'Can we add mee goreng to the menu this week?',
        byMemberId: 'jonathan',
        assignedToId: 'jenny',
        status: 'open',
        createdAt: today,
      },
    ],
    kidChecklist: DEFAULT_CHECKLIST,
    kidChecks: {},
    starDays: [],
  }
}
