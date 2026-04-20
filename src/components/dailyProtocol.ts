/**
 * Daily Protocol panel — collapsible reference showing the Nāda Brahma
 * 13-row time schedule from the guide. Highlights the current time slot.
 */

interface ProtocolSlot {
  startHour: number
  endHour: number
  label: string
  mode: string
  freqStack: string
  duration: string
}

const DAILY_PROTOCOL: readonly ProtocolSlot[] = [
  {
    startHour: 4,
    endHour: 4.5,
    label: '4:00–4:30 AM (Brahma Muhurta)',
    mode: 'Spiritual + Knowledge',
    freqStack: '963 Hz → 852 Hz + 432 Hz',
    duration: '30 min',
  },
  {
    startHour: 4.5,
    endHour: 5,
    label: '4:30–5:00 AM',
    mode: 'Wealth Intention',
    freqStack: '7.83 Hz + Sankalpa',
    duration: '20 min',
  },
  {
    startHour: 5,
    endHour: 6,
    label: '5:00–6:00 AM',
    mode: 'Health + Energy',
    freqStack: '528 Hz + Kapalabhati',
    duration: '20 min',
  },
  {
    startHour: 6,
    endHour: 8,
    label: '6:00–8:00 AM',
    mode: 'Morning Relax + Nourishment',
    freqStack: '432 Hz carrier + breakfast',
    duration: '2 hours',
  },
  {
    startHour: 8,
    endHour: 12,
    label: '8:00 AM–12:00 PM',
    mode: 'Focus Mode',
    freqStack: '10 Hz Alpha → 23.49 Hz Beta',
    duration: 'Work hours',
  },
  {
    startHour: 12,
    endHour: 13,
    label: '12:00–1:00 PM',
    mode: 'Ultra Focus',
    freqStack: '40 Hz Gamma',
    duration: 'Deep work',
  },
  {
    startHour: 13,
    endHour: 14,
    label: '1:00–2:00 PM',
    mode: 'Relax + Recovery',
    freqStack: '7.83 Hz + 396 Hz',
    duration: 'Break',
  },
  {
    startHour: 14,
    endHour: 18,
    label: '2:00–6:00 PM',
    mode: 'Focus / Create',
    freqStack: '10 Hz or 12.67 Hz Alpha',
    duration: 'Afternoon work',
  },
  {
    startHour: 18,
    endHour: 19,
    label: '6:00–7:00 PM',
    mode: 'Relax + Decompress',
    freqStack: '7.83 Hz + 396 Hz carrier',
    duration: '30 min',
  },
  {
    startHour: 19,
    endHour: 20,
    label: '7:00–8:00 PM',
    mode: 'Love + Wealth',
    freqStack: '528 Hz + 639 Hz',
    duration: '20 min',
  },
  {
    startHour: 20,
    endHour: 21,
    label: '8:00–9:00 PM',
    mode: 'Wind Down',
    freqStack: '432 Hz + 174 Hz',
    duration: '30 min',
  },
  {
    startHour: 21,
    endHour: 22,
    label: '9:00–10:00 PM',
    mode: 'Pre-Sleep Programming',
    freqStack: '6.33 Hz Theta + Sankalpa',
    duration: '20 min',
  },
  {
    startHour: 22,
    endHour: 28, // wraps past midnight (28 = 4 AM next day)
    label: '10:00 PM onward',
    mode: 'Deep Sleep',
    freqStack: '3 Hz Delta + 396 Hz carrier',
    duration: 'All night',
  },
]

function isCurrentSlot(slot: ProtocolSlot, hour: number): boolean {
  // hour is 0–23; endHour > 24 means it wraps past midnight
  if (slot.endHour > 24) {
    return hour >= slot.startHour || hour < slot.endHour - 24
  }
  return hour >= slot.startHour && hour < slot.endHour
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderDailyProtocol(): string {
  const currentHour = new Date().getHours()

  const rows = DAILY_PROTOCOL.map((slot) => {
    const active = isCurrentSlot(slot, currentHour)
    const rowClass = active ? ' daily-protocol__row--active' : ''
    const currentBadge = active ? ' <span class="daily-protocol__now">now</span>' : ''
    return `
      <tr class="daily-protocol__row${rowClass}">
        <td class="daily-protocol__time">${esc(slot.label)}${currentBadge}</td>
        <td class="daily-protocol__mode">${esc(slot.mode)}</td>
        <td class="daily-protocol__freq">${esc(slot.freqStack)}</td>
        <td class="daily-protocol__dur">${esc(slot.duration)}</td>
      </tr>
    `
  }).join('')

  return `
    <details class="disclosure daily-protocol" id="daily-protocol">
      <summary>N\u0101da Brahma daily schedule</summary>
      <div class="daily-protocol__body">
        <p class="caption" style="margin-bottom: var(--space-3)">
          Time-based protocol from the guide. Current slot highlighted.
        </p>
        <div class="daily-protocol__scroll">
          <table class="daily-protocol__table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Mode</th>
                <th>Frequency Stack</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </details>
  `
}
