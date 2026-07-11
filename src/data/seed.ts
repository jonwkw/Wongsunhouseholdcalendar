import type { AppData, ChecklistItem, Dish } from '../types'

// Sample dishes spread across food types and cuisines so the library
// grouping/filter has something to show. Added to existing data once (v3).
export const SAMPLE_DISHES: Dish[] = [
  { id: 'd-1', name: 'Chicken rice', nameZh: '海南鸡饭', emoji: '🍗', slot: 'lunch', foodType: 'meat', cuisine: 'chinese' },
  { id: 'd-2', name: 'Fish porridge', nameZh: '鱼片粥', emoji: '🐟', slot: 'dinner', foodType: 'soup', cuisine: 'chinese' },
  { id: 'd-3', name: 'Stir-fried veggies', nameZh: '炒青菜', emoji: '🥬', slot: 'any', foodType: 'veg', cuisine: 'chinese' },
  { id: 'd-4', name: 'Noodle soup', nameZh: '汤面', emoji: '🍜', slot: 'lunch', foodType: 'carb', cuisine: 'chinese' },
  { id: 'd-5', name: 'Fruit platter', nameZh: '水果拼盘', emoji: '🍉', slot: 'snack', foodType: 'fruit', cuisine: 'other' },
  { id: 'd-6', name: 'Steamed egg', nameZh: '蒸水蛋', emoji: '🥚', slot: 'dinner', foodType: 'other', cuisine: 'chinese' },
  { id: 'd-7', name: 'Garlic broccoli', nameZh: '蒜蓉西兰花', emoji: '🥦', slot: 'any', foodType: 'veg', cuisine: 'chinese' },
  { id: 'd-8', name: 'Beef rendang', nameZh: '仁当牛肉', emoji: '🍛', slot: 'dinner', foodType: 'meat', cuisine: 'malay' },
  { id: 'd-9', name: 'Roti prata', nameZh: '印度煎饼', emoji: '🥞', slot: 'breakfast', foodType: 'carb', cuisine: 'indian' },
  { id: 'd-10', name: 'Chicken curry', nameZh: '咖喱鸡', emoji: '🍲', slot: 'dinner', foodType: 'meat', cuisine: 'indian' },
  { id: 'd-11', name: 'Spaghetti bolognese', nameZh: '肉酱意面', emoji: '🍝', slot: 'dinner', foodType: 'carb', cuisine: 'italian' },
  { id: 'd-12', name: 'Teriyaki salmon', nameZh: '照烧三文鱼', emoji: '🍣', slot: 'dinner', foodType: 'meat', cuisine: 'japanese' },
  { id: 'd-13', name: 'Miso soup', nameZh: '味噌汤', emoji: '🥣', slot: 'any', foodType: 'soup', cuisine: 'japanese' },
  { id: 'd-14', name: 'Bibimbap', nameZh: '韩式拌饭', emoji: '🍚', slot: 'lunch', foodType: 'carb', cuisine: 'korean' },
  { id: 'd-15', name: 'Pad thai', nameZh: '泰式炒河粉', emoji: '🍤', slot: 'lunch', foodType: 'carb', cuisine: 'thai' },
  { id: 'd-16', name: 'Nyonya laksa', nameZh: '娘惹叻沙', emoji: '🍜', slot: 'lunch', foodType: 'soup', cuisine: 'peranakan' },
  { id: 'd-17', name: 'Beef pho', nameZh: '越南牛肉河粉', emoji: '🍜', slot: 'dinner', foodType: 'soup', cuisine: 'vietnamese' },
  { id: 'd-18', name: 'Grilled cheese toast', nameZh: '烤芝士吐司', emoji: '🍞', slot: 'breakfast', foodType: 'carb', cuisine: 'western' },
]

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c-teeth-am', emoji: '🪥', text: 'Brush teeth in the morning', textZh: '早上刷牙' },
  { id: 'c-breakfast', emoji: '🥣', text: 'Eat a good breakfast', textZh: '好好吃早餐' },
  { id: 'c-bag', emoji: '🎒', text: 'Pack your school bag', textZh: '收拾书包' },
  { id: 'c-read', emoji: '📖', text: 'Read for 15 minutes', textZh: '阅读15分钟' },
  { id: 'c-tidy', emoji: '🧸', text: 'Tidy up your toys', textZh: '收好玩具' },
  { id: 'c-teeth-pm', emoji: '🌙', text: 'Brush teeth before bed', textZh: '睡前刷牙' },
]

// Minimal starter data: one example of each thing so the logic is easy to verify.
export function seedData(): AppData {
  return {
    version: 4,
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
    // clean slate from v4 — the family adds their own dishes
    dishes: [],
    menuEntries: [],
    boardItems: [],
    kidChecklist: DEFAULT_CHECKLIST,
    kidChecks: {},
    kidSkips: {},
    kidChallenges: {},
    starDays: [],
  }
}
