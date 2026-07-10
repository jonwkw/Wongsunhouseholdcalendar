import { useState } from 'react'
import type { Activity } from '../types'
import { useApp, uid } from '../store'
import { Modal, MemberToggle, EmojiPicker, TimeSelect } from './shared'
import { prettyDate, todayKey } from '../utils/dates'
import { t, dayShort } from '../i18n'

interface Props {
  /** Existing activity to edit, or null to create */
  activity: Activity | null
  /** Day the modal was opened from (drop target / quick add) */
  date: string
  /** Prefill for new activities created from an activity card */
  prefill?: Partial<Activity>
  onClose: () => void
}

export function ActivityModal({ activity, date, prefill, onClose }: Props) {
  const { update } = useApp()
  const src = activity ?? prefill
  const [title, setTitle] = useState(src?.title ?? '')
  const [emoji, setEmoji] = useState(src?.emoji ?? '🗓️')
  const [memberIds, setMemberIds] = useState<string[]>(src?.memberIds ?? [])
  // brand-new activities start from a sensible 9am rather than "no time"
  const [time, setTime] = useState(src?.time ?? (activity ? '' : '09:00'))
  const [endTime, setEndTime] = useState(src?.endTime ?? '')
  const [location, setLocation] = useState(src?.location ?? '')
  const [notes, setNotes] = useState(activity?.notes ?? '')
  const [recurring, setRecurring] = useState(Boolean(src?.recurrence))
  const [days, setDays] = useState<number[]>(src?.recurrence?.days ?? [new Date(date + 'T00:00').getDay()])
  const [from, setFrom] = useState(src?.recurrence?.from ?? date)
  const [until, setUntil] = useState(src?.recurrence?.until ?? '')
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
    <Modal title={activity ? t('editActivity') : t('newActivity')} onClose={onClose}>
      <div className="form">
        <label>
          {t('whatIsIt')}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('egPiano')}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </label>

        <label>{t('pickIcon')}</label>
        <EmojiPicker value={emoji} onChange={setEmoji} />

        <label>{t('whoFor')}</label>
        <MemberToggle selected={memberIds} onChange={setMemberIds} />

        <div className="form-row">
          <label>
            {t('starts')}
            <TimeSelect value={time} onChange={setTime} />
          </label>
          <label>
            {t('ends')}
            <TimeSelect value={endTime} onChange={setEndTime} />
          </label>
        </div>

        <label>
          {t('where')}
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('optional')} />
        </label>

        <label>
          {t('notes')}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('optional')} />
        </label>

        <label className="check-row">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          {t('repeat')}
        </label>

        {recurring ? (
          <>
            <div className="kind-toggle">
              <button type="button" className="btn subtle" onClick={() => setDays([1, 2, 3, 4, 5])}>
                {t('everyWeekday')}
              </button>
              <button type="button" className="btn subtle" onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}>
                {t('everyDay')}
              </button>
              <button type="button" className="btn subtle" onClick={() => setDays([0, 6])}>
                {t('weekends')}
              </button>
              <button type="button" className="btn subtle" onClick={() => setDays([new Date(date + 'T00:00').getDay()])}>
                {t('weeklyOn')} {dayShort(new Date(date + 'T00:00').getDay())}
              </button>
            </div>
            <label>{t('pickDays')}</label>
            <div className="weekday-picker">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`weekday-btn ${days.includes(d) ? 'on' : ''}`}
                  onClick={() => toggleDay(d)}
                >
                  {dayShort(d)}
                </button>
              ))}
            </div>
            <div className="form-row">
              <label>
                {t('startsOn')}
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                {t('stopsAfter')}
                <input type="date" value={until} min={from || todayKey()} onChange={(e) => setUntil(e.target.value)} />
              </label>
            </div>
          </>
        ) : (
          <label>
            {t('whichDay')}
            <input type="date" value={oneOffDate} onChange={(e) => setOneOffDate(e.target.value)} />
          </label>
        )}

        <div className="form-actions">
          {activity && activity.recurrence && (
            <button className="btn subtle" onClick={skipThisDay}>
              {t('skipOnly', { d: prettyDate(date) })}
            </button>
          )}
          {activity && (
            <button className="btn danger" onClick={deleteSeries}>
              {activity.recurrence ? t('delSeries') : t('del')}
            </button>
          )}
          <span className="spacer" />
          <button className="btn primary" onClick={save} disabled={!title.trim()}>
            {t('save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
