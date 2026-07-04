import { useState } from 'react'
import type { Activity } from '../types'
import { useApp, uid } from '../store'
import { Modal, MemberToggle, EmojiPicker } from './shared'
import { DAY_SHORT, prettyDate, todayKey } from '../utils/dates'

interface Props {
  /** Existing activity to edit, or null to create */
  activity: Activity | null
  /** Day the modal was opened from (drop target / quick add) */
  date: string
  /** Prefill for new activities created from a template */
  prefill?: Partial<Activity>
  onClose: () => void
}

export function ActivityModal({ activity, date, prefill, onClose }: Props) {
  const { update } = useApp()
  const [title, setTitle] = useState(activity?.title ?? prefill?.title ?? '')
  const [emoji, setEmoji] = useState(activity?.emoji ?? prefill?.emoji ?? '🗓️')
  const [memberIds, setMemberIds] = useState<string[]>(activity?.memberIds ?? prefill?.memberIds ?? [])
  const [time, setTime] = useState(activity?.time ?? prefill?.time ?? '')
  const [endTime, setEndTime] = useState(activity?.endTime ?? prefill?.endTime ?? '')
  const [location, setLocation] = useState(activity?.location ?? prefill?.location ?? '')
  const [notes, setNotes] = useState(activity?.notes ?? '')
  const [recurring, setRecurring] = useState(Boolean(activity?.recurrence))
  const [days, setDays] = useState<number[]>(activity?.recurrence?.days ?? [new Date(date + 'T00:00').getDay()])
  const [from, setFrom] = useState(activity?.recurrence?.from ?? date)
  const [until, setUntil] = useState(activity?.recurrence?.until ?? '')
  const [oneOffDate, setOneOffDate] = useState(activity?.date ?? date)

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))

  const save = () => {
    if (!title.trim()) return
    const base: Activity = {
      id: activity?.id ?? uid('a'),
      title: title.trim(),
      emoji,
      memberIds,
      time: time || undefined,
      endTime: endTime || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      exceptions: activity?.exceptions ?? [],
      ...(recurring
        ? { recurrence: { days: days.length ? days : [new Date(date + 'T00:00').getDay()], from: from || date, until: until || undefined } }
        : { date: oneOffDate }),
    }
    update((d) => ({
      ...d,
      activities: activity
        ? d.activities.map((a) => (a.id === activity.id ? base : a))
        : [...d.activities, base],
    }))
    onClose()
  }

  const deleteSeries = () => {
    if (!activity) return
    update((d) => ({ ...d, activities: d.activities.filter((a) => a.id !== activity.id) }))
    onClose()
  }

  const skipThisDay = () => {
    if (!activity) return
    update((d) => ({
      ...d,
      activities: d.activities.map((a) =>
        a.id === activity.id ? { ...a, exceptions: [...a.exceptions, date] } : a,
      ),
    }))
    onClose()
  }

  return (
    <Modal title={activity ? 'Edit activity' : 'New activity'} onClose={onClose}>
      <div className="form">
        <label>
          What is it?
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Piano lesson"
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </label>

        <label>Pick an icon</label>
        <EmojiPicker value={emoji} onChange={setEmoji} />

        <label>Who is it for?</label>
        <MemberToggle selected={memberIds} onChange={setMemberIds} />

        <div className="form-row">
          <label>
            Starts
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label>
            Ends
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
        </div>

        <label>
          Where?
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="optional" />
        </label>

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="optional" />
        </label>

        <label className="check-row">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          🔁 Repeat
        </label>

        {recurring ? (
          <>
            <div className="kind-toggle">
              <button type="button" className="btn subtle" onClick={() => setDays([1, 2, 3, 4, 5])}>
                Every weekday
              </button>
              <button type="button" className="btn subtle" onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}>
                Every day
              </button>
              <button type="button" className="btn subtle" onClick={() => setDays([0, 6])}>
                Weekends
              </button>
              <button type="button" className="btn subtle" onClick={() => setDays([new Date(date + 'T00:00').getDay()])}>
                Weekly on {DAY_SHORT[new Date(date + 'T00:00').getDay()]}
              </button>
            </div>
            <label>Or pick the days yourself</label>
            <div className="weekday-picker">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`weekday-btn ${days.includes(d) ? 'on' : ''}`}
                  onClick={() => toggleDay(d)}
                >
                  {DAY_SHORT[d]}
                </button>
              ))}
            </div>
            <div className="form-row">
              <label>
                Starts on
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                Stops after (optional)
                <input type="date" value={until} min={from || todayKey()} onChange={(e) => setUntil(e.target.value)} />
              </label>
            </div>
          </>
        ) : (
          <label>
            On which day?
            <input type="date" value={oneOffDate} onChange={(e) => setOneOffDate(e.target.value)} />
          </label>
        )}

        <div className="form-actions">
          {activity && activity.recurrence && (
            <button className="btn subtle" onClick={skipThisDay}>
              Skip {prettyDate(date)} only
            </button>
          )}
          {activity && (
            <button className="btn danger" onClick={deleteSeries}>
              Delete{activity.recurrence ? ' series' : ''}
            </button>
          )}
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!title.trim()}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
