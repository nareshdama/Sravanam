/**
 * 32 Vedic frequencies with rich metadata (sources, chakras, mantras, breathing patterns, postures).
 * Carriers use the authentic Saptaswar/Natya Shastra just-intonation grid at Sa=432:
 *   Sa 432, Ri 486, Ga 540, Ma 576, Pa 648, Dha 720, Ni 810, SA-octave 864.
 * Plus 136.1 Hz (AUM M-kara drone, Mandukya Upanishad) and 200 Hz default binaural carrier.
 * 528 Hz and 480 Hz are retained as sound-design carriers with explicit non-Vedic framing.
 * Complements the 14 existing binaural templates.
 */

import type { BinauralTemplate } from './binauralTemplates'

export const VEDIC_FREQUENCIES: readonly BinauralTemplate[] = [
  // 1. Delta Seed
  {
    id: 'vedic-delta-seed-0.5-4',
    hzLabel: '0.5–4 Hz',
    brainwave: 'delta',
    useCase: 'Deepest subconscious reprogramming',
    effect: 'Sushupti state; ego dissolves; subconscious fully open',
    beatHzMin: 0.5,
    beatHzMax: 4,
    defaultBeatHz: 2,
    recommendedCarrierHz: 200,
    vedicSources: [{ text: 'Mandukya Upanishad', tradition: 'Advaita' }],
    vedaVerification:
      'Sushupti — ego dissolves; subconscious fully open. The deepest state of consciousness where the individual self merges with the absolute.',
    postures: ['Shavasana (flat on back, arms at sides, palms up)'],
    mantras: ['Om Tat Sat (3x before sleep — "That alone is Truth")'],
    practiceNotes:
      'Pillow speaker during sleep; state Sankalpa 3x aloud before lying down. This frequency supports the subconscious reprogramming through sleep.',
    timeOfDay: 'Before sleep',
  },

  // 2. Lipton Theta
  {
    id: 'vedic-lipton-theta-6',
    hzLabel: '6 Hz',
    brainwave: 'theta',
    useCase: '"I AM" affirmation planting',
    effect:
      'Madhyama-vak — thought-vibration meets subconscious mind for deep integration',
    beatHzMin: 6,
    beatHzMax: 6,
    defaultBeatHz: 6,
    recommendedCarrierHz: 200,
    vedicSources: [{ text: 'Rigveda', verse: '4 levels of Vak' }],
    vedaVerification:
      'Madhyama-vak — thought-vibration meets subconscious. This is the level where intention becomes manifest thought.',
    postures: ['Sukhasana (easy cross-legged sit); spine erect'],
    mantras: ['Aham Brahmasmi — "I AM the infinite" (108x on mala)'],
    breathingPattern: {
      name: 'Rhythmic slow breathing',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      'Eyes closed; whisper mantra in sync with beat; feel it vibrate in the chest',
  },

  // 3. Sankalpa Theta
  {
    id: 'vedic-sankalpa-theta-4-8',
    hzLabel: '4–8 Hz',
    brainwave: 'theta',
    useCase: 'Sacred intention; dissolves poverty blocks',
    effect:
      'Sankalpa Shakti — "One becomes what one deeply intends". Deep theta integration of intention.',
    beatHzMin: 4,
    beatHzMax: 8,
    defaultBeatHz: 6,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Chandogya Upanishad', verse: '3.14.1', tradition: 'Vedanta' },
    ],
    vedaVerification:
      'Sankalpa Shakti — "One becomes what one deeply intends". The creative power of sacred intention.',
    postures: [
      'Yoga Nidra position — Shavasana with light blanket; body scan from feet to crown',
    ],
    mantras: ['Sankalpa [your intention] — stated in present tense 3x'],
    breathingPattern: {
      name: 'Natural breath with body awareness',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      'Sankalpa Mudra (left palm up, right over it); state wealth intention at start and end of session',
  },

  // 4. Jupiter Prosperity
  {
    id: 'vedic-jupiter-prosperity-7-8',
    hzLabel: '7–8 Hz',
    brainwave: 'theta',
    useCase: 'Abundance attraction; deep theta prosperity',
    effect:
      'Jupiter (Brihaspati) — lord of wisdom and Riddhi (divine wealth). Attracts abundance consciousness.',
    beatHzMin: 7,
    beatHzMax: 8,
    defaultBeatHz: 7.5,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Brihaspati Stotram', tradition: 'Vedic hymns' },
      { text: 'Rigveda', tradition: 'Planetary wisdom' },
    ],
    vedaVerification:
      'Jupiter (Brihaspati) — lord of wisdom and Riddhi. Associated with expansion, prosperity, and the fulfillment of desires.',
    postures: ['Sukhasana; face North-East (auspicious Vedic direction)'],
    mantras: ['Om Brim Brihaspataye Namaha (108x)'],
    breathingPattern: {
      name: 'Slow rhythmic breathing',
      inhaleSec: 5,
      holdSec: 0,
      exhaleSec: 5,
    },
    practiceNotes:
      'Thursday at sunrise; yellow cloth to sit on; offer yellow flowers; 108 repetitions',
    seasonalAlignment: ['Spring', 'Summer'],
  },

  // 5. Alpha Clarity
  {
    id: 'vedic-alpha-clarity-10',
    hzLabel: '10 Hz',
    brainwave: 'alpha',
    useCase: 'Creative visualization; financial alignment',
    effect:
      'Bhavana — conscious visualization creates reality. The power of focused imagination.',
    beatHzMin: 10,
    beatHzMax: 10,
    defaultBeatHz: 10,
    recommendedCarrierHz: 200,
    vedicSources: [{ text: 'Yoga Vasistha', tradition: 'Advaita Vedanta' }],
    vedaVerification:
      'Bhavana — conscious visualization creates reality. What you hold in mind becomes manifest through attention and belief.',
    postures: [
      'Siddhasana (adept\'s pose) or chair with spine straight; Jnana Mudra (index + thumb; palms on knees facing up)',
    ],
    mantras: ['Shreem — Lakshmi\'s Bija seed sound (silent repetition)'],
    breathingPattern: {
      name: 'Vivid mental cinema breathing',
      inhaleSec: 5,
      holdSec: 2,
      exhaleSec: 5,
    },
    practiceNotes:
      'Eyes closed; 15–20 min of pure visualization; engage all 5 senses; journal insights after',
  },

  // 6. Billionaire Brain Wave
  {
    id: 'vedic-billionaire-brain-10',
    hzLabel: '10 Hz Alpha',
    brainwave: 'alpha',
    useCase: 'Wealth blueprint; intuitive decisions',
    effect:
      'Viveka — unobstructed discriminative intellect. The power of clear insight into right action.',
    beatHzMin: 10,
    beatHzMax: 10,
    defaultBeatHz: 10,
    recommendedCarrierHz: 200,
    vedicSources: [{ text: 'Bhagavad Gita', verse: 'Ch. 18', tradition: 'Yoga' }],
    vedaVerification:
      'Viveka — unobstructed discriminative intellect. The faculty that sees clearly what serves evolution vs. what creates stagnation.',
    postures: [
      'Upright seated in chair or Vajrasana; Gyan Mudra (index + thumb); both hands on knees',
    ],
    mantras: ['Om Gam Ganapataye Namaha — Ganesha mantra removing obstacles (21x)'],
    breathingPattern: {
      name: 'Mindful breathing',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      'After morning pranayama; no phone; journal wealth decisions and insights that arise',
  },

  // 7. Beta Execution
  {
    id: 'vedic-beta-execution-12-30',
    hzLabel: '12–30 Hz',
    brainwave: 'beta',
    useCase: 'Active productivity; real-world goal pursuit',
    effect:
      'Karma Yoga — disciplined action as material power. The yoga of action without attachment to results.',
    beatHzMin: 12,
    beatHzMax: 30,
    defaultBeatHz: 20,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Arthashastra', tradition: 'Material wisdom' },
      { text: 'Bhagavad Gita', verse: 'Ch. 3', tradition: 'Yoga' },
    ],
    vedaVerification:
      'Karma Yoga — disciplined action as material power. The fruit of all action comes from right effort without fear or attachment.',
    postures: [
      'Seated at work desk; upright posture; Abhaya Mudra (right hand raised, palm outward) during breaks',
    ],
    mantras: ['Kriyat Shakthi Pradayini — "May action-power be granted" (silent)'],
    breathingPattern: {
      name: 'Energizing breath',
      inhaleSec: 4,
      holdSec: 1,
      exhaleSec: 4,
    },
    practiceNotes:
      'Low volume background during work; combine with Nishkama Karma — act without attachment to outcomes',
  },

  // 8. Spanda Power
  {
    id: 'vedic-spanda-power-40',
    hzLabel: '40 Hz Gamma',
    brainwave: 'gamma',
    useCase: 'Flow state; leadership mastery',
    effect:
      'Spanda — divine tremor; Shiva\'s consciousness in action. The vibration of pure consciousness manifesting in the world.',
    beatHzMin: 40,
    beatHzMax: 40,
    defaultBeatHz: 40,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Spanda Karika', tradition: 'Kashmir Shaivism' },
    ],
    vedaVerification:
      'Spanda — divine tremor; Shiva\'s consciousness in action. The fundamental vibration from which all creation arises.',
    postures: [
      'Virasana (hero pose) or power seated posture; Kali Mudra (fingers interlaced, index fingers pointing up)',
    ],
    mantras: ['Om Namah Shivaya (5-syllable Shiva mantra, 11x)'],
    breathingPattern: {
      name: 'Ujjayi breath',
      inhaleSec: 3,
      holdSec: 0,
      exhaleSec: 3,
    },
    practiceNotes:
      'Use during creative problem-solving; board meetings; key decisions; begin with Ujjayi breath ritual',
  },

  // 9. Gamma Sovereignty
  {
    id: 'vedic-gamma-sovereignty-30-100',
    hzLabel: '30–40 Hz',
    brainwave: 'gamma',
    useCase: 'Spiritual power; peak awareness',
    effect:
      'Pashyanti-vak — visionary sound; realm of Rishis. Beat capped at 40 Hz — binaural fusion breaks down above ~40 Hz; higher values are perceived as two separate tones rather than an entraining beat.',
    beatHzMin: 30,
    beatHzMax: 40,
    defaultBeatHz: 40,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Mandukya Upanishad', tradition: 'Vedanta' },
      { text: 'Rigveda', tradition: 'Rig Veda' },
    ],
    vedaVerification:
      'Pashyanti-vak — visionary sound; realm of Rishis. The level of speech that perceives truth directly, beyond words.',
    postures: [
      'Padmasana (lotus pose) or Siddhasana; Shambhavi Mudra (soft upward gaze between eyebrows)',
    ],
    mantras: ['Ajna Chakra Bija — Om (silent, visualized as indigo flame between brows)'],
    breathingPattern: {
      name: 'Trataka breath',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      'Fixed candle 2 ft away at eye level; no blinking; tears are normal and cleansing; do in darkness',
  },

  // 10. Lakshmi Nada (432 Hz carrier + 10 Hz alpha)
  {
    id: 'vedic-lakshmi-nada-432',
    hzLabel: '432 Hz · 10 Hz α',
    brainwave: 'alpha',
    useCase: 'Natural universal resonance; cosmic abundance',
    effect:
      'Natural tuning of Sa (Shadja) — aligned with Lakshmi Tattva. 432 Hz carrier with 10 Hz alpha entrainment for relaxed receptive abundance.',
    beatHzMin: 8,
    beatHzMax: 12,
    defaultBeatHz: 10,
    recommendedCarrierHz: 432,
    vedicSources: [
      { text: 'Gandharva Veda', tradition: 'Vedic music' },
      { text: 'Sama Veda', tradition: 'Vedic chants' },
    ],
    vedaVerification:
      'Natural tuning of Sa (Shadja) — aligned with Lakshmi Tattva. The universal frequency that aligns human consciousness with cosmic order.',
    postures: [
      'Face East at dawn; Padmasana or Sukhasana; Varada Mudra (right palm open facing outward — gesture of giving/receiving)',
    ],
    mantras: ['Om Shreem Mahalakshmiyei Namaha (108x on mala)'],
    breathingPattern: {
      name: 'Deep rhythmic breathing',
      inhaleSec: 6,
      holdSec: 0,
      exhaleSec: 6,
    },
    practiceNotes:
      'Dawn practice; light ghee lamp; place Shri Yantra; chant Sri Sukta (16 Rigvedic verses) over frequency',
    timeOfDay: 'Brahma Muhurta (dawn)',
  },

  // 11. Agni Transformation (528 Hz carrier + 10 Hz alpha)
  {
    id: 'vedic-agni-transformation-528',
    hzLabel: '528 Hz · 10 Hz α',
    brainwave: 'alpha',
    useCase: 'Pranic fire; transformation; manifestation',
    effect:
      'Agni Bija — fire seed of Manipura; invokes Tejas. 528 Hz carrier with 10 Hz alpha entrainment for transformation in a calm, focused state.',
    beatHzMin: 8,
    beatHzMax: 12,
    defaultBeatHz: 10,
    recommendedCarrierHz: 528,
    vedicSources: [
      { text: 'Atharva Veda', tradition: 'Fire rituals' },
      { text: 'Hatha Yoga Pradipika', verse: 'Ch. 3', tradition: 'Tantra' },
    ],
    vedaVerification:
      '528 Hz is used here as a carrier for energizing breath practice, not a Vedic-authenticated frequency — the Solfeggio set has no traceable Sanskrit textual source. Carrier-evidence is limited but usable for a bright, activating mood; the Vedic content lies in the Agni bija (RAM) and Kapalabhati practice layered over it.',
    postures: [
      'Sukhasana; right hand in Agni Mudra (thumb over bent ring finger, other fingers extended); left palm on solar plexus',
    ],
    mantras: ['RAM — Fire Bija of Manipura (chant aloud rhythmically with pumps)'],
    breathingPattern: {
      name: 'Kapalabhati',
      inhaleSec: 1,
      holdSec: 0,
      exhaleSec: 1,
    },
    practiceNotes:
      'Focus awareness on solar plexus; feel heat building; visualize golden sun radiating power outward',
  },

  // 12. Manifestation (480 Hz midpoint carrier + 10 Hz alpha)
  {
    id: 'vedic-manifestation-stack-432-528',
    hzLabel: '480 Hz · 10 Hz α',
    brainwave: 'alpha',
    useCase: 'Combined cosmic + transformation carrier',
    effect:
      'Shiva-Shakti — cosmic stillness + active creation. 480 Hz carrier (midpoint of 432 and 528) with 10 Hz alpha entrainment balances being and becoming.',
    beatHzMin: 8,
    beatHzMax: 12,
    defaultBeatHz: 10,
    recommendedCarrierHz: 480,
    vedicSources: [
      { text: 'Samkhya Karika', tradition: 'Philosophy' },
      { text: 'Devi Bhagavata Purana', tradition: 'Tantra' },
    ],
    vedaVerification:
      '480 Hz = Ni(15/8) at Sa=256, or Ri(9/8) × 2 at Sa=256 (Natya Shastra microtonal grid). Used here as a mid-register neutral carrier; the Shiva-Shakti framing is interpretive, not a Hz-scriptural claim.',
    postures: [
      'Padmasana; Hakini Mudra (all 5 fingertips touching partner fingertips, both hands) at heart level',
    ],
    mantras: ['Shreem Hreem Kleem — triple Bija stack (108x)'],
    breathingPattern: {
      name: 'Nadi Shodhana (alternate nostril)',
      inhaleSec: 5,
      holdSec: 5,
      exhaleSec: 5,
    },
    practiceNotes:
      'Visualize golden light expanding from heart as you chant; hold each Bija for one full breath',
  },

  // 13. Heart Bridge (Pa 648 Hz carrier + 10 Hz alpha)
  {
    id: 'vedic-heart-bridge-pa-648',
    hzLabel: '648 Hz · 10 Hz α',
    brainwave: 'alpha',
    useCase: 'Emotional harmony; heart-centered alignment',
    effect:
      'Pa (Panchama) — the perfect fifth (3/2 × Sa), described in the Natya Shastra as the inviolable sacred tone. 648 Hz carrier with 10 Hz alpha entrainment supports heart opening and receptive mood.',
    beatHzMin: 8,
    beatHzMax: 12,
    defaultBeatHz: 10,
    recommendedCarrierHz: 648,
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S13 — Pa 3/2', tradition: 'Bharata Muni' },
      { text: 'Gandharva Veda', tradition: 'Vedic music' },
    ],
    vedaVerification:
      'Pa = 3/2 × Sa(432) = 648 Hz. Natya Shastra S13; the only svara explicitly called inviolable and never altered in any raga or ritual chant. The harmonic fifth is used here as a warm heart-themed carrier (CSV-supported sound-design choice).',
    postures: [
      'Sukhasana; both palms over heart center; Hridaya Mudra (index finger at base of thumb, middle + ring on thumb tip, pinky extended)',
    ],
    mantras: ['YAM — Heart Bija (soft chant) + Om Mani Padme Hum (compassion activation)'],
    breathingPattern: {
      name: 'Heart-centered breathing',
      inhaleSec: 5,
      holdSec: 0,
      exhaleSec: 5,
    },
    practiceNotes:
      'Send loving-kindness to 3 people you hold resentment toward; feel forgiveness dissolve the block',
  },

  // 14. Love Fusion (Pa 648 Hz heart carrier + 10 Hz alpha)
  {
    id: 'vedic-love-fusion-pa-648',
    hzLabel: '648 Hz · 10 Hz α',
    brainwave: 'alpha',
    useCase: 'Heart-centered bhakti; love and devotion',
    effect:
      'Pa (Panchama) as the sacred fifth anchors bhakti practice. 648 Hz carrier with 10 Hz alpha entrainment holds attention at the heart center.',
    beatHzMin: 8,
    beatHzMax: 12,
    defaultBeatHz: 10,
    recommendedCarrierHz: 648,
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S13 — Pa 3/2', tradition: 'Bharata Muni' },
      { text: 'Narada Bhakti Sutra', tradition: 'Bhakti' },
    ],
    vedaVerification:
      'Pa = 3/2 × Sa(432) = 648 Hz (Natya Shastra S13). Historically-attested tuning; the 639 Hz Solfeggio carrier used in earlier versions has no Vedic textual source and has been replaced with the authentic perfect-fifth ratio.',
    postures: [
      'Padmasana; Yoni Mudra (interlaced fingers, index + thumb form triangle over lower abdomen)',
    ],
    mantras: ['Om Shreem Kleem Maha Lakshmiyei Namaha (108x)'],
    breathingPattern: {
      name: 'Dual visualization breathing',
      inhaleSec: 5,
      holdSec: 2,
      exhaleSec: 5,
    },
    practiceNotes:
      'Visualize pink (love) and gold (wealth) light merging at the heart as one unified field',
  },

  // 15. Fortune Gate (Dha 720 Hz carrier + 40 Hz gamma)
  {
    id: 'vedic-fortune-gate-dha-720',
    hzLabel: '720 Hz · 40 Hz γ',
    brainwave: 'gamma',
    useCase: 'Active recognition; opportunity orientation',
    effect:
      'Dha (Dhaivata) — the major sixth (5/3 × Sa), upper-register resonance in the Natya Shastra. 720 Hz carrier with 40 Hz gamma entrainment for alert recognition.',
    beatHzMin: 35,
    beatHzMax: 40,
    defaultBeatHz: 40,
    recommendedCarrierHz: 720,
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S16 — Dha 5/3', tradition: 'Bharata Muni' },
      { text: 'Rigveda', verse: 'Sapta Rishis' },
    ],
    vedaVerification:
      'Dha = 5/3 × Sa(432) = 720 Hz. Natya Shastra S16. The 777 Hz carrier used in earlier versions was pure numerology (7×7×7) with no Vedic textual basis; replaced with the authentic Dha just-intonation ratio.',
    postures: [
      'Sukhasana; spine straight; Prithvi Mudra (ring finger + thumb; grounding into material world)',
    ],
    mantras: ['Lam Vam Ram Yam Ham Om AUM — all 7 Bija mantras sequentially'],
    breathingPattern: {
      name: '7-chakra body scan breath',
      inhaleSec: 7,
      holdSec: 0,
      exhaleSec: 7,
    },
    practiceNotes:
      'Weekly practice (Fridays — Venus day of fortune); take 49 breaths total (7x7)',
  },

  // 16. Aishwarya Octave (864 Hz carrier + 8 Hz alpha)
  {
    id: 'vedic-aishwarya-octave-864',
    hzLabel: '864 Hz · 8 Hz α',
    brainwave: 'alpha',
    useCase: 'Receptive opulence practice; Lakshmi ritual',
    effect:
      'Upper octave of Sa (2 × 432) completes the Saptaswar cycle. 864 Hz carrier with 8 Hz alpha entrainment for receptive ritual practice.',
    beatHzMin: 8,
    beatHzMax: 8,
    defaultBeatHz: 8,
    recommendedCarrierHz: 864,
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S22 — 2/1 octave', tradition: 'Bharata Muni' },
      { text: 'Brihat Parashara Hora Shastra', tradition: 'Jyotisha' },
    ],
    vedaVerification:
      '864 Hz = 2 × Sa(432). Natya Shastra S22 (perfect octave doubling). The 888 Hz Saturn numerology used previously has no Vedic textual source and has been replaced with the authentic octave.',
    postures: [
      'Vajrasana (thunderbolt/kneeling pose); Shani Mudra (middle finger extended, others folded)',
    ],
    mantras: ['Om Sham Shanicharaya Namaha (108x)'],
    breathingPattern: {
      name: 'Deliberate 8-count breath',
      inhaleSec: 8,
      holdSec: 8,
      exhaleSec: 8,
    },
    practiceNotes:
      'Saturdays at sunset; sesame oil lamp; black sesame seeds offered; face West (Saturn\'s direction)',
  },

  // 17. Lakshmi Octave Stack (864 Hz carrier + 8 Hz alpha)
  {
    id: 'vedic-lakshmi-stack-octave-864',
    hzLabel: '864 Hz · 8 Hz α',
    brainwave: 'alpha',
    useCase: 'Full Sri Sukta recitation; Lakshmi practice',
    effect:
      'Upper octave of Sa (2 × 432) encompasses the full Saptaswar cycle; used here as the carrier for a complete Lakshmi ritual stack.',
    beatHzMin: 8,
    beatHzMax: 8,
    defaultBeatHz: 8,
    recommendedCarrierHz: 864,
    vedicSources: [
      { text: 'Sri Sukta', verse: 'Rigveda 5 Khila (16 verses)', tradition: 'Vedic hymn' },
      { text: 'Lakshmi Tantra', tradition: 'Tantric' },
    ],
    vedaVerification:
      '864 Hz = 2 × Sa(432). Natya Shastra S22; Rigvedic Sri Sukta is traditionally chanted in the Sa–Pa range, and the upper octave provides a bright carrier for its 16 verses.',
    postures: [
      'Padmasana; Lotus Mudra — both hands at heart, wrists touching, fingers open like a blooming lotus',
    ],
    mantras: ['Full Sri Sukta recitation (16 Rigvedic verses)'],
    breathingPattern: {
      name: 'Three-phase breath',
      inhaleSec: 8,
      holdSec: 0,
      exhaleSec: 8,
    },
    practiceNotes:
      'Place Shri Yantra in front; offer lotus or yellow flowers; recite all 16 verses of Sri Sukta',
  },

  // 19. Vāk Siddhi (Pa 648 Hz — Vishuddha, 40 Hz gamma)
  {
    id: 'vedic-vak-siddhi-pa-648',
    hzLabel: '648 Hz · 40 Hz γ',
    brainwave: 'gamma',
    useCase: 'Speech clarity practice; Saraswati sadhana',
    effect:
      'Pa (Panchama) — Vishuddha chakra\'s svara in the Gandharva/chakra mapping. 648 Hz throat-centered carrier with 40 Hz gamma entrainment for alert articulation work.',
    beatHzMin: 35,
    beatHzMax: 40,
    defaultBeatHz: 40,
    recommendedCarrierHz: 648,
    associatedChakra: 'Vishuddha — Throat',
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S13 — Pa 3/2', tradition: 'Bharata Muni' },
      { text: 'Rigveda', verse: '4 levels of Vak', tradition: 'Vedic' },
      { text: 'Saraswati Rahasya Upanishad', tradition: 'Shakta' },
    ],
    vedaVerification:
      'Pa = 3/2 × Sa(432) = 648 Hz. Natya Shastra S13; the Gandharva Veda chakra-svara mapping assigns Pa to Vishuddha (throat). The 741 Hz Solfeggio carrier used previously has no Vedic textual source.',
    postures: [
      'Siddhasana; Chin Mudra (index + thumb — consciousness union); spine perfectly vertical',
    ],
    mantras: ['Om Aim Saraswatyai Namaha (108x on mala — Saraswati Bija for knowledge)'],
    breathingPattern: {
      name: 'Silence then Ujjayi',
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 4,
    },
    practiceNotes:
      '1 hour of mauna (silence) before practice; chant Om Aim Saraswatyai 108× then sit in stillness; what arises in mind afterward is Vāk Siddhi guidance',
    timeOfDay: 'Brahma Muhurta (4–6 AM) after mauna',
  },

  // 20. Ajna Vision (Dha 720 Hz — Ajna, 7.83 Hz Schumann theta)
  {
    id: 'vedic-ajna-vision-dha-720',
    hzLabel: '720 Hz · 7.83 Hz θ',
    brainwave: 'theta',
    useCase: 'Third eye practice; inner attention',
    effect:
      'Dha (Dhaivata) — the Gandharva/chakra mapping assigns Dha to Ajna (third eye). 720 Hz upper-register carrier with 7.83 Hz Schumann theta for receptive inner attention.',
    beatHzMin: 7.83,
    beatHzMax: 7.83,
    defaultBeatHz: 7.83,
    recommendedCarrierHz: 720,
    associatedChakra: 'Ajna — Third Eye',
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S16 — Dha 5/3', tradition: 'Bharata Muni' },
      { text: 'Sat Chakra Nirupana', tradition: 'Tantra' },
    ],
    vedaVerification:
      'Dha = 5/3 × Sa(432) = 720 Hz. Natya Shastra S16; the Gandharva chakra-svara mapping places Dha at Ajna. The 852 Hz Solfeggio carrier used previously has no Vedic textual source. Schumann 7.83 Hz is a real geophysical ELF phenomenon, used here only as a binaural beat analogy.',
    postures: [
      'Padmasana; Shambhavi Mudra (soft upward gaze between eyebrows; eyes half-open)',
    ],
    mantras: ['Om (silent AUM felt as vibration at the third eye point — between eyebrows)'],
    breathingPattern: {
      name: 'Trataka breath (candle-gaze synchronized)',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 6,
    },
    practiceNotes:
      'Face East at dawn; Trataka (candle gaze) 10 min first; then close eyes and visualize indigo light at Ajna; Shambhavi Mudra throughout',
    timeOfDay: 'Dawn; face East',
  },

  // 21. Parabrahman (864 Hz upper octave + 4.84 Hz theta-phi)
  {
    id: 'vedic-parabrahman-octave-864',
    hzLabel: '864 Hz · 4.84 Hz θ',
    brainwave: 'theta',
    useCase: 'Witness-consciousness practice; silent inquiry',
    effect:
      'Upper octave of Sa (2 × 432) — perfect doubling; in Vedic cosmology the octave represents completion transcending the individual notes. 864 Hz carrier with 4.84 Hz (Schumann ÷ Φ) deep theta.',
    beatHzMin: 4.84,
    beatHzMax: 4.84,
    defaultBeatHz: 4.84,
    recommendedCarrierHz: 864,
    associatedChakra: 'Sahasrara — Crown (Beyond Form)',
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S22 — 2/1 octave', tradition: 'Bharata Muni' },
      { text: 'Mandukya Upanishad', verse: 'Turiya', tradition: 'Advaita' },
      { text: 'Ashtavakra Gita', tradition: 'Advaita Vedanta' },
    ],
    vedaVerification:
      '864 Hz = 2 × Sa(432). Natya Shastra S22 (perfect octave). The 999 Hz carrier used previously was numerology; replaced with the authentic octave doubling. Turiya is a state (Mandukya Upanishad) — no specific Hz is scripturally prescribed; the carrier is a symbolic anchor, not a metaphysical claim.',
    postures: [
      'Padmasana or Siddhasana; Khechari Mudra (tongue folded to palate); hands in lap, palms up',
    ],
    mantras: ['Neti Neti — "not this, not this" (inquiry, not repetition) — then pure silence'],
    practiceNotes:
      'Absolute silence; complete solitude; no mantra, no effort, no goal — pure witness consciousness only; the practice is non-practice; 45 min minimum',
    timeOfDay: 'Any time; complete silence and solitude required',
  },

  // 22. Delta Seed (0.98 Hz — Schumann ÷ 8)
  {
    id: 'vedic-delta-seed-0.98',
    hzLabel: '0.98 Hz',
    brainwave: 'delta',
    useCase: 'Deep sleep onset; subconscious access',
    effect:
      'Delta Seed — Schumann ÷ Ashtanga (7.83 ÷ 8). Earth\'s heartbeat at the deepest division; sleep onset trigger.',
    beatHzMin: 0.98,
    beatHzMax: 0.98,
    defaultBeatHz: 0.98,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Mandukya Upanishad', tradition: 'Advaita' },
      { text: 'Atharva Veda', verse: 'Ashtanga — 8 directions of cosmic power', tradition: 'Vedic' },
    ],
    vedaVerification:
      'Schumann ÷ 8: 7.83 ÷ 8 = 0.98 Hz. Atharva Veda Ashtanga multiplier applied to Earth\'s base resonance. The slowest pulsation aligned with subconscious opening.',
    postures: ['Shavasana — pillow speaker; low volume; begin 20 min before sleep'],
    mantras: ['Om Tat Sat (3x aloud before lying down — "That alone is Truth")'],
    breathingPattern: {
      name: 'Natural sleep breath',
      inhaleSec: 5,
      holdSec: 0,
      exhaleSec: 7,
    },
    practiceNotes:
      'Pillow speaker or low-volume room speaker; state Sankalpa in present tense 3× before lying down; allow sleep to arrive naturally',
    timeOfDay: 'Begin 20 min before sleep',
  },

  // 23. Delta Healing (3.00 Hz)
  {
    id: 'vedic-delta-healing-3',
    hzLabel: '3.00 Hz',
    brainwave: 'delta',
    useCase: 'REM sleep; physical tissue repair',
    effect:
      'Delta Healing — clinically validated range for maximum physical regeneration and REM sleep enhancement.',
    beatHzMin: 3,
    beatHzMax: 3,
    defaultBeatHz: 3,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Charaka Samhita', tradition: 'Ayurveda' },
      { text: 'Mandukya Upanishad', tradition: 'Advaita' },
    ],
    vedaVerification:
      '3 Hz — digit sum 3 = Brahma (creation/structure). Universal delta standard for REM and tissue repair. The Charaka Samhita prescribes deep sleep as the foundation of all healing (Arogya).',
    postures: ['Shavasana — no headphones; room speaker at low volume throughout night'],
    mantras: ['Om Dhanvantre Namaha — Vedic healing deity mantra (silent before sleep)'],
    breathingPattern: {
      name: 'Natural sleep breath',
      inhaleSec: 5,
      holdSec: 0,
      exhaleSec: 7,
    },
    practiceNotes:
      'Play through room speaker at low volume all night; no headphones needed for delta entrainment during sleep',
    timeOfDay: 'During sleep (all night)',
  },

  // 24. Deep Delta (3.20 Hz)
  {
    id: 'vedic-deep-delta-3.2',
    hzLabel: '3.20 Hz',
    brainwave: 'delta',
    useCase: 'Deepest unconscious reprogramming',
    effect:
      'Deep Delta — clinically validated for deepest unconscious access; Sushupti state at its peak depth.',
    beatHzMin: 3.2,
    beatHzMax: 3.2,
    defaultBeatHz: 3.2,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Mandukya Upanishad', verse: 'Sushupti', tradition: 'Advaita' },
    ],
    vedaVerification:
      'Sushupti (deep dreamless sleep) — the third state of consciousness; ego fully dissolved; subconscious reprogramming is maximally effective here. The individual self rests in Brahman without knowing it.',
    postures: ['Shavasana — flat on back, arms at sides, palms facing upward'],
    mantras: ['Sankalpa [your intention] — state in present tense 3× aloud before sleep'],
    breathingPattern: {
      name: 'Pre-sleep Shavasana breath',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 6,
    },
    practiceNotes:
      'State Sankalpa 3× aloud in present tense before lying down; complete muscle relaxation via progressive body scan; allow deep sleep to receive the intention',
    timeOfDay: 'During sleep (all night)',
  },

  // 25. Theta Phi (4.84 Hz — Schumann ÷ Φ)
  {
    id: 'vedic-theta-phi-4.84',
    hzLabel: '4.84 Hz',
    brainwave: 'theta',
    useCase: 'Stress and anxiety relief; Prajna border state',
    effect:
      'Theta Phi — Schumann ÷ Φ (7.83 ÷ 1.618). Golden ratio sub-theta; the precise border of Prajna consciousness.',
    beatHzMin: 4.84,
    beatHzMax: 4.84,
    defaultBeatHz: 4.84,
    recommendedCarrierHz: 200,
    vedicSources: [
      { text: 'Mandukya Upanishad', verse: 'Prajna state', tradition: 'Advaita' },
      { text: 'Vastu Shastra', tradition: 'Sacred geometry' },
    ],
    vedaVerification:
      'Schumann (7.83) ÷ Golden Ratio (Φ = 1.618) = 4.84 Hz. Prajna border state — twilight consciousness where ego loosens and deep peace arises. Vastu Shastra encodes Φ as the proportion of sacred creation.',
    postures: ['Sukhasana or Shavasana; Chin Mudra (index + thumb)'],
    mantras: ['So Hum — inhale "So", exhale "Hum" (natural breath mantra)'],
    breathingPattern: {
      name: '4-count coherence breath',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      'Headphones; 4-count inhale, 4-count exhale; allow thoughts to pass without engagement; 20–30 min minimum for anxiety relief',
    timeOfDay: 'Evening; anytime stress arises',
  },

  // 26. Sankalpa (6.33 Hz — Schumann × Φ ÷ 2)
  {
    id: 'vedic-sankalpa-6.32',
    hzLabel: '6.33 Hz',
    brainwave: 'theta',
    useCase: 'Intention planting; Sankalpa Shakti activation',
    effect:
      'Sankalpa — Schumann × Φ ÷ 2 (7.83 × 1.618 ÷ 2 ≈ 6.33). The precise frequency of Sankalpa Shakti: creative intention power.',
    beatHzMin: 6.33,
    beatHzMax: 6.33,
    defaultBeatHz: 6.33,
    recommendedCarrierHz: 432,
    vedicSources: [
      { text: 'Chandogya Upanishad', verse: '3.14.1 — Sankalpa Brahman', tradition: 'Vedanta' },
    ],
    vedaVerification:
      'Schumann × Φ ÷ 2 = 7.83 × 1.618 ÷ 2 ≈ 6.33 Hz. Chandogya Upanishad: "One becomes what one deeply intends (Sankalpa)." The creative power of sacred intention planted in deep theta.',
    postures: ['Sukhasana; Chin Mudra; or Nadi Shodhana breathing position'],
    mantras: ['[Your Sankalpa] — state in present tense as vibration, not words'],
    breathingPattern: {
      name: 'Nadi Shodhana (alternate nostril)',
      inhaleSec: 4,
      holdSec: 4,
      exhaleSec: 4,
    },
    practiceNotes:
      'Nadi Shodhana (9 rounds) while listening; at the end of each round, pulse the Sankalpa like a signal into deep mind; emotional release is normal and welcome',
    timeOfDay: 'Evening; pre-sleep programming',
  },

  // 27. Theta AUM (7.83 Hz — Pure Schumann)
  {
    id: 'vedic-theta-aum-7.83',
    hzLabel: '7.83 Hz',
    brainwave: 'theta',
    useCase: 'Pure AUM resonance; Vedic Earth heartbeat meditation',
    effect:
      'Theta AUM — Schumann × 1 (pure). The most Vedically authentic frequency: Earth\'s own heartbeat; primordial AUM in electromagnetic form.',
    beatHzMin: 7.83,
    beatHzMax: 7.83,
    defaultBeatHz: 7.83,
    recommendedCarrierHz: 432,
    vedicSources: [
      { text: 'Mandukya Upanishad', tradition: 'Advaita' },
      { text: 'Rigveda', verse: 'Nada Brahma — universe is sound', tradition: 'Vedic' },
    ],
    vedaVerification:
      '7.83 Hz — digit sum: 7+8+3=18→9 (Family of 9, Brahman). The Schumann Resonance confirmed by W.O. Schumann (1952): Earth\'s electromagnetic cavity vibrates at 7.83 Hz — the same frequency encoded in the Mandukya Upanishad\'s AUM as the alpha-theta border state.',
    postures: ['Sukhasana; Chin Mudra; let mind float without direction'],
    mantras: ['AUM — chant once, then listen to the silence as the real sound'],
    practiceNotes:
      'Sukhasana; Chin Mudra; let the mind float without forcing stillness; 30 min; this is pure Pratyahara (withdrawal of senses into awareness)',
    timeOfDay: 'Afternoon recovery; evening decompression',
  },

  // 28. Alpha Phi (12.67 Hz — Schumann × Φ)
  {
    id: 'vedic-alpha-phi-12.67',
    hzLabel: '12.67 Hz',
    brainwave: 'alpha',
    useCase: 'Flow state entry; creative aligned intelligence',
    effect:
      'Alpha Phi — Schumann × Φ (7.83 × 1.618). Creative intelligence aligned with cosmic proportion; Bhavana (visualization) power amplified.',
    beatHzMin: 12.67,
    beatHzMax: 12.67,
    defaultBeatHz: 12.67,
    recommendedCarrierHz: 432,
    vedicSources: [
      { text: 'Yoga Vasistha', tradition: 'Advaita Vedanta' },
      { text: 'Vastu Shastra', tradition: 'Sacred geometry' },
    ],
    vedaVerification:
      'Schumann × Φ = 7.83 × 1.618 = 12.67 Hz. Phi (1.618) is encoded throughout Vastu Shastra as the proportion of creation itself — from the nautilus shell to the Milky Way. At 12.67 Hz the mind enters the flow state that Vedic seers described as Bhavana.',
    postures: ['Upright seated; 3 Ujjayi breaths before beginning work'],
    mantras: ['Om Gam Ganapataye Namaha — Ganesha removes all obstacles (silent)'],
    breathingPattern: {
      name: 'Ujjayi (ocean breath)',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      '3 Ujjayi breaths before starting; then work naturally with low background volume; 90-min sessions optimal; journal breakthroughs after',
    timeOfDay: 'Morning creative work; afternoon focused creation',
  },

  // 29. Beta Execution (23.49 Hz — Schumann × 3)
  {
    id: 'vedic-beta-execution-23.49',
    hzLabel: '23.49 Hz',
    brainwave: 'beta',
    useCase: 'Active focus; Karma Yoga mindset; productive execution',
    effect:
      'Beta Execution — Schumann × 3 (7.83 × 3). Brahma\'s triple creation force: the Trimurti of action, intention, and result.',
    beatHzMin: 23.49,
    beatHzMax: 23.49,
    defaultBeatHz: 23.49,
    recommendedCarrierHz: 432,
    vedicSources: [
      { text: 'Bhagavad Gita', verse: 'Ch. 3 — Karma Yoga', tradition: 'Yoga' },
      { text: 'Arthashastra', tradition: 'Material wisdom' },
    ],
    vedaVerification:
      'Schumann × 3 = 7.83 × 3 = 23.49 Hz. Digit sum: 2+3+4+9=18→9 (Family of 9). Brahma\'s triple creative force. Bhagavad Gita Ch. 3: "Niyatam kuru karma tvam" — perform your prescribed action with the Schumann-aligned mind.',
    postures: ['Upright seated at work desk; Gyan Mudra (index + thumb) during breaks'],
    mantras: ['Om Gam Ganapataye Namaha (silent background invocation)'],
    breathingPattern: {
      name: 'Energizing 4-1-4 breath',
      inhaleSec: 4,
      holdSec: 1,
      exhaleSec: 4,
    },
    practiceNotes:
      'Low background volume during work hours; Karma Yoga mindset — act without attachment to outcomes; take 5-min Ujjayi breaks every 90 min',
    timeOfDay: 'Work hours (8 AM – 6 PM)',
  },

  // 30. Beta Sharp (33.18 Hz — Schumann × Φ³)
  {
    id: 'vedic-beta-sharp-33.18',
    hzLabel: '33.18 Hz',
    brainwave: 'beta',
    useCase: 'Decision making; executive function; complex problems',
    effect:
      'Beta Sharp — Schumann × Φ³ (7.83 × 4.236). Cube of the golden ratio applied to AUM; the frequency of highest executive intelligence.',
    beatHzMin: 33.18,
    beatHzMax: 33.18,
    defaultBeatHz: 33.18,
    recommendedCarrierHz: 528,
    vedicSources: [
      { text: 'Arthashastra', tradition: 'Kautilya — statecraft' },
      { text: 'Vastu Shastra', tradition: 'Sacred geometry — Φ³' },
    ],
    vedaVerification:
      'Schumann × Φ³ = 7.83 × 4.236 = 33.18 Hz. Digit sum: 3+3+1+8=15→6 (Family of 6, Shukra/intellect). Φ³ (golden ratio cubed) — the proportion of the highest cognitive structures encoded in Vastu Shastra.',
    postures: ['Virasana (hero pose) or power-seated; Kali Mudra (fingers interlaced, index fingers pointing up)'],
    mantras: ['Om Namah Shivaya (11x before session — Shiva: destroyer of confusion)'],
    breathingPattern: {
      name: 'Bhastrika (bellows breath)',
      inhaleSec: 2,
      holdSec: 0,
      exhaleSec: 2,
    },
    practiceNotes:
      'Use for key decisions, negotiations, complex strategic problems; begin with 11× Om Namah Shivaya; then enter deep work; decision made during this state carries Shiva\'s clarity',
    timeOfDay: 'As needed for decisions; Ultra Focus work sessions',
  },

  // 31. Gamma Ashta (62.64 Hz — Schumann × 8)
  {
    id: 'vedic-gamma-ashta-62.64',
    hzLabel: '62.64 Hz',
    brainwave: 'gamma',
    useCase: 'Visionary breakthrough thinking; Vedic Ashtanga power',
    effect:
      'Gamma Ashta — Schumann × 8 (7.83 × 8). Ashtanga: the 8 directions of cosmic power amplified through Earth\'s resonance.',
    beatHzMin: 62.64,
    beatHzMax: 62.64,
    defaultBeatHz: 62.64,
    recommendedCarrierHz: 432,
    vedicSources: [
      { text: 'Atharva Veda', verse: 'Ashtanga — 8-fold cosmic power', tradition: 'Vedic' },
      { text: 'Spanda Karika', tradition: 'Kashmir Shaivism' },
    ],
    vedaVerification:
      'Schumann × 8 = 7.83 × 8 = 62.64 Hz. Atharva Veda: Ashta = 8 directions of cosmic power. 62.64 → 6+2+6+4=18→9 (Family of 9, Brahman). The 8-fold amplification of Earth\'s heartbeat — Spanda (divine tremor) at its most expanded.',
    postures: ['Virasana or power-seated; Kali Mudra (fingers interlaced, index fingers pointing up)'],
    mantras: ['Om Namah Shivaya (11x before session)'],
    breathingPattern: {
      name: 'Trataka breath (pre-session candle gaze)',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 4,
    },
    practiceNotes:
      '5 min Trataka (candle gaze) before starting; then enter state of visionary breakthrough; use for inventions, creative solutions, spiritual insight; 90-min sessions',
    timeOfDay: 'Ultra Focus sessions; mid-day peak energy',
  },

  // 18. Brahmarandhra Crown (Ni 810 Hz — Sahasrara, 7.83 Hz Schumann theta)
  {
    id: 'vedic-brahmarandhra-crown-ni-810',
    hzLabel: '810 Hz · 7.83 Hz θ',
    brainwave: 'theta',
    useCase: 'Crown practice; non-dual witness sadhana',
    effect:
      'Ni (Nishada) — the major seventh (15/8 × Sa), the highest svara before the octave. Gandharva/chakra mapping assigns Ni to Sahasrara. 810 Hz carrier with 7.83 Hz Schumann theta for quiet witness-attention.',
    beatHzMin: 7.83,
    beatHzMax: 7.83,
    defaultBeatHz: 7.83,
    recommendedCarrierHz: 810,
    associatedChakra: 'Sahasrara — Crown',
    vedicSources: [
      { text: 'Natya Shastra', verse: 'Shruti S20 — Ni 15/8', tradition: 'Bharata Muni' },
      { text: 'Sat Chakra Nirupana', tradition: 'Tantra' },
      { text: 'Brihadaranyaka Upanishad', tradition: 'Vedanta' },
    ],
    vedaVerification:
      'Ni = 15/8 × Sa(432) = 810 Hz. Natya Shastra S20; the Gandharva chakra-svara mapping places Ni at Sahasrara. The 963 Hz Solfeggio carrier used previously has no Vedic textual source. Schumann 7.83 Hz is a geophysical ELF reference, used here only as a binaural-beat analogy.',
    postures: [
      'Shavasana or Padmasana; Mahamudra of consciousness — Khechari Mudra (tongue folded back toward palate)',
    ],
    mantras: ['AUM — primordial sound (silent, felt as vibration from base of spine to crown)'],
    breathingPattern: {
      name: 'Pure witnessing breath',
      inhaleSec: 4,
      holdSec: 4,
      exhaleSec: 4,
    },
    practiceNotes:
      'Experience the silence between the beats as the true frequency; remain as pure witness. This is the state of non-duality.',
  },

  // 32. AUM M-kara Drone (136.1 Hz carrier + 1 Hz delta) — Mandukya Upanishad
  {
    id: 'vedic-aum-drone-136.1',
    hzLabel: '136.1 Hz · 1 Hz δ',
    brainwave: 'delta',
    useCase: 'Sleep drone; M-kara hum anchor',
    effect:
      'M-kara — the nasal "mmm" of AUM as described in the Mandukya Upanishad, traditionally associated with the Prajna (deep sleep) state. 136.1 Hz is the low-register hum commonly used in cranial-resonance studies and temple drone practice.',
    beatHzMin: 1,
    beatHzMax: 1,
    defaultBeatHz: 1,
    recommendedCarrierHz: 136.1,
    vedicSources: [
      { text: 'Mandukya Upanishad', verse: 'M-kara / Prajna state', tradition: 'Advaita' },
    ],
    vedaVerification:
      'The Mandukya Upanishad describes AUM as four matras (A-U-M-silence); M-kara corresponds to Prajna (deep sleep). 136.1 Hz is not scripturally specified but is the widely-used nasal-drone pitch attested in cranial-bone acoustic studies and traditional temple bell/Om-drone tuning.',
    postures: ['Shavasana — flat on back, arms at sides, palms up'],
    mantras: ['AUM — rest on the M-kara hum; let the "mmm" settle in the nasal cavity'],
    breathingPattern: {
      name: 'Slow sleep breath',
      inhaleSec: 4,
      holdSec: 0,
      exhaleSec: 6,
    },
    practiceNotes:
      'Room speaker at low volume; lie down 20 min before sleep; let the drone carry attention into the M-kara hum and on into Prajna.',
    timeOfDay: 'Pre-sleep; night-long drone',
  },
] as const

// Build index map for O(1) lookup
const VEDIC_INDEX = new Map(VEDIC_FREQUENCIES.map((f) => [f.id, f]))

export function getVedicFrequencyById(id: string): BinauralTemplate | undefined {
  return VEDIC_INDEX.get(id)
}
