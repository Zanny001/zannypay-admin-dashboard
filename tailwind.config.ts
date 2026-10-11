import type { Config } from 'tailwindcss';

// Design direction: this is an internal operations tool, not a marketing
<<<<<<< HEAD
// site — density and legibility matter more than flourish. Navy pulls from
// the ZannyPay mobile app's own brand color so the two feel like one
// product; the warm gold accent (used sparingly — active nav state, key
// numbers) is the one deliberate "premium fintech" touch rather than
// another blue-on-blue SaaS dashboard. Severity colors are deliberately
// distinct from the brand palette so a CRITICAL fraud alert is never
// mistaken for a neutral UI accent.
const config: Config = {
=======
// site — density and legibility matter more than flourish. Navy is a
// deliberately distinct identity from the mobile app's actual brand
// color (confirmed purple, matching its real app icon) — not a mistaken
// attempt to match it. An earlier version of this comment claimed navy
// was pulled from "the mobile app's own brand color," which turned out
// to be based on an unverified assumption about a config value that was
// never reconciled with the mobile app's real in-app theme. Correcting
// the record rather than the color: realigning this dashboard's palette
// was explicitly declined as more disruption than the inconsistency is
// worth — an internal ops tool having its own distinct identity from the
// consumer app is a reasonable, common choice on its own terms, not a
// bug that merely hadn't been caught yet. The warm gold accent (used
// sparingly — active nav state, key numbers) is the one deliberate
// "premium fintech" touch rather than another blue-on-blue SaaS
// dashboard. Severity colors are deliberately distinct from the brand
// palette so a CRITICAL fraud alert is never mistaken for a neutral UI
// accent.
const config: Config = {
  darkMode: 'class',
>>>>>>> cc343e15 (Upgrade to v8 commit)
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
<<<<<<< HEAD
          navy: '#0D2261',
          navyLight: '#16316E',
          gold: '#C99B3D',
=======
          navy: '#0A1B4D',
          navyLight: '#16307A',
          navyDeep: '#050F30',
          gold: '#D4A445',
          goldLight: '#EBC887',
>>>>>>> cc343e15 (Upgrade to v8 commit)
        },
        severity: {
          low: '#64748B',
          medium: '#D97706',
          high: '#EA580C',
          critical: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
<<<<<<< HEAD
=======
      boxShadow: {
        // Layered, low-opacity shadows — the "printed on the canvas" look
        // from premium dashboard kits, instead of one flat grey shadow.
        card: '0 1px 2px rgba(13, 25, 68, 0.05), 0 6px 20px -6px rgba(13, 25, 68, 0.08)',
        lift: '0 2px 4px rgba(13, 25, 68, 0.06), 0 14px 34px -10px rgba(13, 25, 68, 0.16)',
        glowGold: '0 6px 24px -6px rgba(212, 164, 69, 0.45)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeInUp: 'fadeInUp 0.4s ease-out both',
      },
>>>>>>> cc343e15 (Upgrade to v8 commit)
    },
  },
  plugins: [],
};

export default config;
