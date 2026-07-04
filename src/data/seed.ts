import type { AppData } from '../types'
import { todayKey, addDays, mondayOf } from '../utils/dates'

// Starter data so the app is understandable on first open.
// Every member, activity and dish here can be edited or deleted in the app.
export function seedData(): AppData {
  const today = todayKey()
  const monday = mondayOf(today)

  return {
    version: 1,
    members: [
      { id: 'papa', name: 'Papa', emoji: '👨', color: '#3b82c4' },
      { id: 'mama', name: 'Mama', emoji: '👩', color: '#c45b9d' },
      { id: 'ahma', name: 'Ah Ma', emoji: '👵', color: '#8a6bbf' },
      { id: 'auntie', name: 'Auntie', emoji: '🧑‍🍳', color: '#2f9e77' },
      { id: 'gorgor', name: 'Gor Gor', emoji: '🧒', color: '#e08a2e', isChild: true },
      { id: 'meimei', name: 'Mei Mei', emoji: '👧', color: '#d95d5d', isChild: true },
    ],
    activities: [
      {
        id: 'a-school',
        title: 'School',
        emoji: '🏫',
        memberIds: ['gorgor'],
        recurrence: { days: [1, 2, 3, 4, 5], from: monday },
        time: '07:30',
        endTime: '13:30',
        exceptions: [],
      },
      {
        id: 'a-swim',
        title: 'Swimming class',
        emoji: '🏊',
        memberIds: ['gorgor', 'meimei'],
        recurrence: { days: [6], from: monday },
        time: '09:00',
        endTime: '10:00',
        location: 'Community pool',
        exceptions: [],
      },
      {
        id: 'a-market',
        title: 'Wet market run',
        emoji: '🧺',
        memberIds: ['auntie'],
        recurrence: { days: [2, 5], from: monday },
        time: '08:00',
        exceptions: [],
      },
    ],
    activityTemplates: [
      { id: 't-school', title: 'School', emoji: '🏫', memberIds: ['gorgor'], time: '07:30', endTime: '13:30' },
      { id: 't-enrich', title: 'Enrichment class', emoji: '📚', memberIds: ['gorgor'], time: '15:00' },
      { id: 't-swim', title: 'Swimming', emoji: '🏊', memberIds: ['gorgor', 'meimei'], time: '09:00' },
      { id: 't-playdate', title: 'Playdate', emoji: '🎈', memberIds: ['gorgor', 'meimei'] },
      { id: 't-doctor', title: 'Doctor appointment', emoji: '🩺', memberIds: [] },
      { id: 't-grandma', title: 'Visit relatives', emoji: '🏠', memberIds: [] },
    ],
    dayNotes: [
      { id: 'n-1', date: addDays(today, 1), text: 'Pack spelling book', kind: 'reminder', memberId: 'gorgor', done: false },
    ],
    dishes: [
      { id: 'd-1', name: 'Chicken rice', emoji: '🍗', slot: 'lunch' },
      { id: 'd-2', name: 'Fish porridge', emoji: '🐟', slot: 'dinner' },
      { id: 'd-3', name: 'Stir-fried veggies', emoji: '🥬', slot: 'any' },
      { id: 'd-4', name: 'Noodle soup', emoji: '🍜', slot: 'lunch' },
      { id: 'd-5', name: 'Steamed egg', emoji: '🥚', slot: 'any' },
      { id: 'd-6', name: 'Pancakes', emoji: '🥞', slot: 'breakfast' },
      { id: 'd-7', name: 'Fruit platter', emoji: '🍉', slot: 'snack' },
    ],
    menuEntries: [
      { id: 'm-1', date: today, slot: 'dinner', dishName: 'Fish porridge', emoji: '🐟', byMemberId: 'auntie' },
    ],
    boardItems: [
      {
        id: 'b-1',
        kind: 'request',
        text: 'Can we add mee goreng to the menu this week?',
        byMemberId: 'papa',
        status: 'open',
        createdAt: today,
      },
      {
        id: 'b-2',
        kind: 'reminder',
        text: 'Balcony cleaning',
        byMemberId: 'mama',
        forDate: addDays(today, 3),
        status: 'open',
        createdAt: today,
      },
    ],
  }
}
