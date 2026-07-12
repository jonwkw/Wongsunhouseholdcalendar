// Shared data model. All dates are "YYYY-MM-DD" local strings; times are "HH:MM".

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack-am' | 'snack-pm'

export type AvatarAge = 'baby' | 'toddler' | 'kid' | 'adult' | 'grandparent'

/** A designed avatar: indexes into the option lists in avatars.tsx */
export interface AvatarSpec {
  age: AvatarAge
  skin: number
  hair: number
  hairColor: number
  facialHair: number
  glasses?: number
  shirt?: number
  earrings?: number
  gender?: 'male' | 'female'
  accessory?: number
}

export interface Member {
  id: string
  name: string
  emoji: string
  color: string
  isChild?: boolean
  avatar?: AvatarSpec
}

export interface Recurrence {
  /** Weekdays the activity repeats on: 0 = Sunday … 6 = Saturday */
  days: number[]
  from: string
  until?: string
}

export interface Activity {
  id: string
  title: string
  emoji: string
  /** Who the activity is for; empty array = everyone */
  memberIds: string[]
  /** Set for one-off activities */
  date?: string
  /** Set for repeating activities */
  recurrence?: Recurrence
  time?: string
  endTime?: string
  location?: string
  notes?: string
  /** Dates where a recurring activity is skipped */
  exceptions: string[]
}

/** Reusable card in the activity library that can be dragged onto a day */
export interface ActivityTemplate {
  id: string
  title: string
  emoji: string
  memberIds: string[]
  time?: string
  endTime?: string
  location?: string
  /** Cards can carry a full repeat schedule (e.g. school Mon–Fri, Aug–Jun) */
  recurrence?: Recurrence
}

export interface DayNote {
  id: string
  date: string
  text: string
  kind: 'note' | 'reminder'
  memberId?: string
  done: boolean
}

/** Reusable dish in the menu library that can be dragged onto a day */
export interface Dish {
  id: string
  name: string
  /** Optional Chinese name shown when the app is in Chinese */
  nameZh?: string
  emoji: string
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any'
  description?: string
  /** meat / veg / carb / soup / fruit / other */
  foodType?: string
  /** chinese / malay / indian / western / japanese / other */
  cuisine?: string
}

export interface MenuEntry {
  id: string
  date: string
  slot: MealSlot
  dishName: string
  emoji: string
  /** Who the meal is for; empty array = everyone */
  memberIds: string[]
  note?: string
  /** 1–5 stars per family member */
  ratings?: Record<string, number>
}

export interface BoardItem {
  id: string
  kind: 'request' | 'reminder'
  text: string
  /** Who raised it ("Requested by …") */
  byMemberId: string
  /** Who should handle it ("Assigned to …") */
  assignedToId?: string
  forDate?: string
  status: 'open' | 'done'
  createdAt: string
  reply?: string
}

/** A task on the kid's checklist. No date = repeats every day; a date = one-off for that day. */
export interface ChecklistItem {
  id: string
  emoji: string
  text: string
  /** Optional Chinese text shown when the app is in Chinese */
  textZh?: string
  date?: string
}

export interface AppData {
  version: number
  members: Member[]
  activities: Activity[]
  activityTemplates: ActivityTemplate[]
  dayNotes: DayNote[]
  dishes: Dish[]
  menuEntries: MenuEntry[]
  boardItems: BoardItem[]
  /** The kid's daily habits */
  kidChecklist: ChecklistItem[]
  /** Which checklist items were ticked on each date */
  kidChecks: Record<string, string[]>
  /** Checklist items an adult marked "not needed" on each date — excluded from fuel */
  kidSkips: Record<string, string[]>
  /** Daily challenges completed per date: 'word' | 'cnword' | 'math' | 'mission' */
  kidChallenges: Record<string, string[]>
  /** Dates where every checklist item was ticked — one gold star each */
  starDays: string[]
  /** Extra fuel cells awarded by adults for something super special */
  bonusFuel: number
}
