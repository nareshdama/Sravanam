/**
 * Session copy for each template + ambient bed combination.
 * Separates contemplative (śruti / nāda-inspired) language from modern psychoacoustic framing.
 */

import type { BinauralTemplate, Brainwave } from './binauralTemplates'
import type { SoundLibraryMode } from './vedicSoundLibrary'
import { getSoundLibraryEntry } from './vedicSoundLibrary'

export interface SessionGuideContent {
  headline: string
  vedicParagraphs: string[]
  modernParagraphs: string[]
  benefits: string[]
  practice: string
}

const BW_LABEL: Record<Brainwave, string> = {
  delta: 'Delta-range beat',
  theta: 'Theta-range beat',
  alpha: 'Alpha-range beat',
  'alpha-beta': 'Low beta / high alpha-range beat',
  beta: 'Beta-range beat',
  gamma: 'Gamma-range beat',
  'gamma-peak': 'High-gamma tonal pair (60–100 Hz)',
}

/** Rough band when the user is in Custom (manual) mode — not a clinical EEG claim. */
export function inferBrainwaveBand(beatHz: number): Brainwave {
  if (beatHz < 4) return 'delta'
  if (beatHz < 8) return 'theta'
  if (beatHz < 12) return 'alpha'
  if (beatHz < 15) return 'alpha-beta'
  if (beatHz < 35) return 'beta'
  return 'gamma'
}

const VEDIC_BY_BAND: Record<Brainwave, string> = {
  delta:
    'In contemplative traditions, very slow, steady listening is sometimes associated with deep rest and letting the mind settle—analogy only, not a śāstra prescription for this app.',
  theta:
    'Texts on nāda and attentive listening (śravaṇa) often praise a receptive, inward-turned mind. Slow pulses in this range are sometimes used as a gentle support for that mood—your tradition and teacher remain authoritative for practice.',
  alpha:
    'Calm, unhurried awareness appears in many manuals of posture and breath. A relaxed pulse can be imagined as a quiet “metronome for attention,” not a sacred syllable or mantra substitute.',
  'alpha-beta':
    'Brighter attention without harshness is a common theme in skillful practice. Use sound as a neutral support for steady focus rather than as a claim about kuṇḍalinī or cakras.',
  beta:
    'Alert, wakeful listening fits active contemplation or study. Keep sessions short; loud or anxious listening is the opposite of śānti.',
  gamma:
    'Very fast beats are a modern exploration; classical śāstra do not map neatly onto “gamma.” Treat as experimental listening only.',
  'gamma-peak':
    'High-gamma tonal pairs (60–100 Hz) exceed classical binaural-beat fusion; two separate tones are perceived. Used in advanced Turiya practice as cortical stimulation rather than beat entrainment. Experimental — treat with care and stop if any discomfort arises.',
}

const MODERN_BY_BAND: Record<Brainwave, string> = {
  delta:
    'Psychoacoustically, a slow binaural difference can feel soporific or “heavy” to some listeners; evidence for sleep or health benefits from apps is limited and individual.',
  theta:
    'Subjectively, many people report relaxation, imagery, or drowsiness. That is experience, not proof of brain-state entrainment at home.',
  alpha:
    'Often described as a “relaxed but awake” feel. Headphones preserve channel separation; speakers usually blur the effect.',
  'alpha-beta':
    'May feel like a slightly more alert or “bright” focus band—self-report varies widely.',
  beta:
    'Higher beat rates can feel stimulating; some find them unpleasant or fatiguing. Stop if you feel tense, dizzy, or odd.',
  gamma:
    'High beat frequencies are understudied for casual use; start quiet and brief.',
  'gamma-peak':
    'Beyond the 35–50 Hz binaural-fusion limit, two distinct tones are heard. Cortical entrainment at 60–80 Hz is speculative — this is advanced sound-design, not a clinical tool. Start very quiet; stop at any sign of tension or headache.',
}

/** Mode-specific Vedic context paragraph keyed by Life Mode intention ID. */
const MODE_VEDIC: Partial<Record<string, string>> = {
  'deep-sleep':
    'Sushupti — the third state of consciousness (Mandukya Upanishad). The ego fully dissolves; the subconscious is maximally open. Delta frequencies support the deepest states of rest and reprogramming that occur during dreamless sleep.',
  relax:
    'Pratyahara — the fifth of Patanjali\'s eight limbs (Yoga Sutras 2.54). The withdrawal of senses from outer objects into pure awareness. Theta frequencies mirror the inward turn that Pratyahara cultivates.',
  focus:
    'Dharana — one-pointed concentration (Yoga Sutras 3.1). The sixth limb: fixing awareness on a single point without wavering. Alpha frequencies support the alert yet relaxed mind state that Dharana requires.',
  'ultra-focus':
    'Spanda — the divine tremor of Kashmir Shaivism (Spanda Karika). Shiva\'s consciousness in its most active creative expression. Gamma frequencies align with the peak cognitive intensity that Spanda describes.',
  knowledge:
    'Jnana — direct knowledge of reality (Adi Shankara, Vivekachudamani). Illumined intelligence beyond mere intellectual understanding. Saraswati\'s domain: the goddess of speech, knowledge, and the arts. These frequencies support deep learning absorption and intuitive knowing.',
  healing:
    'Arogyam — complete freedom from disease (Charaka Samhita, Dhanvantari tradition). Ayurveda teaches that sound vibration is primary medicine. The Solfeggio carrier frequencies (528, 432, 639 Hz) are applied here for cellular harmony and pranic restoration.',
  wealth:
    'Riddhi-Siddhi — the twin powers of Lakshmi (Lakshmi Tantra, Sri Sukta). Riddhi: material prosperity. Siddhi: perfection and attainment. These frequencies are aligned with Lakshmi Tattva (432 Hz = natural Sa, the root of abundance in the Gandharva Veda).',
  love:
    'Prema — unconditional divine love (Narada Bhakti Sutra). The Anahata chakra (unstruck sound) is the seat of all genuine love. 639 Hz aligns with the heart center; when Anahata opens fully, love and prosperity flow together as one unified field.',
  spiritual:
    'Turiya — the fourth state beyond waking, dreaming, and deep sleep (Mandukya Upanishad). The substratum of all three states; pure Sat-Chit-Ananda. Crown frequencies (963, 999 Hz) dissolve the boundary between individual consciousness and Brahman.',
}

const SOUND_VEDIC: Record<SoundLibraryMode, string> = {
  off:
    'You are hearing only the synthesized carrier pair and binaural difference—closest to a plain auditory experiment, without extra symbolic layering.',
  om: 'The optional bed stacks sine partials as a modern nod to praṇava / “Oṃ” discussed in many texts; it is not a recording of traditional chanting and not a substitute for śikṣā with a qualified teacher.',
  cosmic:
    'The airy bed is a metaphor for ākāśa-like spaciousness in contemplative imagination—not an assertion about physics, planets, or scripture.',
  nada:
    'The low detuned pair loosely evokes discussions of nāda (struck/unstruck sound) in darśana; it remains electronic tone, not tanpura or live instruction.',
}

const SOUND_MODERN: Record<SoundLibraryMode, string> = {
  off:
    'No masking noise: you hear the binaural cue most clearly; any effect is from the beat and carrier alone.',
  om: 'Additive tones add partials under the carrier; loudness still obeys your Volume control—keep it conservative.',
  cosmic: 'Filtered noise adds a soft bed that can mask hiss and enrich texture; it does not change the math of the binaural difference.',
  nada: 'A second slow beat in the lows adds warmth; if it feels muddy, lower volume or choose “Binaural only.”',
}

function bandForGuide(
  template: BinauralTemplate | null,
  beatHz: number,
): Brainwave {
  return template ? template.brainwave : inferBrainwaveBand(beatHz)
}

export function buildSessionGuide(
  template: BinauralTemplate | null,
  soundId: SoundLibraryMode,
  beatHz: number,
  carrierHz: number,
  intentionId?: string,
): SessionGuideContent {
  const sound = getSoundLibraryEntry(soundId)
  const bw = bandForGuide(template, beatHz)
  const bandLabel = BW_LABEL[bw]

  const headline = template
    ? `${template.useCase} · ${sound.title} (${bandLabel}, Δ ≈ ${formatHz(beatHz)})`
    : `Custom frequencies · ${sound.title} (${bandLabel}, carrier ≈ ${formatHz(carrierHz)}, Δ ≈ ${formatHz(beatHz)})`

  const vedicParagraphs: string[] = []
  const modernParagraphs: string[] = []

  // Prepend Life Mode context when an intentionId is provided
  if (intentionId && MODE_VEDIC[intentionId]) {
    vedicParagraphs.push(MODE_VEDIC[intentionId]!)
  }

  if (template) {
    vedicParagraphs.push(
      `Preset “${template.hzLabel}” (${template.useCase}): ${template.effect}`,
    )

    // Add Vedic metadata if available
    if (template.vedicSources?.length) {
      const sources = template.vedicSources
        .map((s) => `${s.text}${s.verse ? ` (${s.verse})` : ''}`)
        .join('; ')
      vedicParagraphs.push(`Vedic sources: ${sources}`)
    }

    if (template.vedaVerification) {
      vedicParagraphs.push(`Verification: ${template.vedaVerification}`)
    }

    if (template.associatedChakra) {
      vedicParagraphs.push(`Associated chakra: ${template.associatedChakra}`)
    }

    if (template.mantras?.length) {
      vedicParagraphs.push(`Mantras: ${template.mantras.join(' / ')}`)
    }
  } else {
    vedicParagraphs.push(
      'No preset: classical treatises do not assign fixed virtues to arbitrary Hz pairs—use this as humble personal exploration, not śāstra.',
    )
  }

  vedicParagraphs.push(SOUND_VEDIC[soundId], VEDIC_BY_BAND[bw])

  modernParagraphs.push(SOUND_MODERN[soundId], MODERN_BY_BAND[bw])

  // Add breathing and posture recommendations
  if (template?.breathingPattern) {
    const bp = template.breathingPattern
    modernParagraphs.push(
      `Recommended breathing: ${bp.name} (${bp.inhaleSec}s in, ${bp.holdSec}s hold, ${bp.exhaleSec}s out)`,
    )
  }

  if (template?.postures?.length) {
    modernParagraphs.push(`Suggested postures: ${template.postures.join('; ')}`)
  }

  if (template?.practiceNotes) {
    modernParagraphs.push(`Practice notes: ${template.practiceNotes}`)
  }

  if (!template) {
    modernParagraphs.unshift(
      'You set carrier and beat manually—effects are informal and depend on level, headphones, and your own nervous system.',
    )
  }

  const benefits: string[] = [
    `Intended listening frame: ${template ? template.useCase.toLowerCase() : 'exploratory listening'} with ${sound.subtitle.toLowerCase()}.`,
    `Ancient analogy: attentive listening (śravaṇa) as a gentle support for mood and attention—not mantra initiation, therapy, or jyotiṣa.`,
    `Modern view: headphone stereo difference tones; subjective relaxation or focus reports are common, medical benefits are not established here.`,
  ]

  const practice = template
    ? `Sit comfortably, use stereo headphones, keep volume low. Notice breath and posture; if the pulse or bed feels wrong, stop. Optional mood: ${template.useCase.toLowerCase()}—${sound.note}`
    : `Sit comfortably, use stereo headphones, keep volume low. Manual carrier ${formatHz(carrierHz)}, beat ${formatHz(beatHz)}, bed “${sound.subtitle}”—stay curious and conservative with level and duration.`

  return {
    headline,
    vedicParagraphs,
    modernParagraphs,
    benefits,
    practice,
  }
}

function formatHz(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(3).replace(/\.?0+$/, '')} kHz`
  if (n >= 100) return `${n.toFixed(1)} Hz`
  if (n >= 10) return `${n.toFixed(2)} Hz`
  return `${n.toFixed(3)} Hz`
}

export function renderSessionGuideHtml(g: SessionGuideContent): string {
  const esc = (s: string): string =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const vedicBlocks = g.vedicParagraphs
    .map((p) => `<p>${esc(p)}</p>`)
    .join('')
  const modernBlocks = g.modernParagraphs
    .map((p) => `<p>${esc(p)}</p>`)
    .join('')
  const benefitsLi = g.benefits.map((b) => `<li>${esc(b)}</li>`).join('')

  return `
    <h3 class="session-guide__subhead">${esc(g.headline)}</h3>
    <div class="session-guide__columns">
      <div class="session-guide__column" aria-label="Contemplative frame">
        <h4 class="session-guide__label">Śruti-inspired listening</h4>
        ${vedicBlocks}
      </div>
      <div class="session-guide__column" aria-label="Modern psychoacoustic frame">
        <h4 class="session-guide__label">Modern clarity (sound &amp; mind)</h4>
        ${modernBlocks}
      </div>
    </div>
    <h4 class="session-guide__label session-guide__label--inline">Possible benefits &amp; limits</h4>
    <ul class="session-guide__list">${benefitsLi}</ul>
    <p class="session-guide__practice"><strong>Practice:</strong> ${esc(g.practice)}</p>
  `
}
