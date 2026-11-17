import { motion, useReducedMotion } from 'framer-motion'

export function Cake({ cut }: { cut: boolean }) {
  const reduce = useReducedMotion()
  return (
    <svg className="cake-svg" viewBox="0 0 360 300" role="img" aria-label="Our 18 November anniversary cake">
      <defs>
        <linearGradient id="cakeSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c1c31" />
          <stop offset="100%" stopColor="#2a0a18" />
        </linearGradient>
        <linearGradient id="cakeTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3dfc4" />
          <stop offset="100%" stopColor="#d9b892" />
        </linearGradient>
        <linearGradient id="cakeGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a47b39" />
          <stop offset="45%" stopColor="#f0d9a8" />
          <stop offset="100%" stopColor="#b98b43" />
        </linearGradient>
        <radialGradient id="flame">
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="60%" stopColor="#efd9a8" />
          <stop offset="100%" stopColor="#b98b43" />
        </radialGradient>
        <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="180" cy="268" rx="148" ry="20" fill="#070305" opacity="0.6" />
      <ellipse cx="180" cy="262" rx="142" ry="17" fill="url(#cakeGold)" opacity="0.5" />
      <ellipse cx="180" cy="258" rx="128" ry="13" fill="#f3dfc4" opacity="0.85" />

      <g>
        <rect x="52" y="158" width="256" height="96" rx="9" fill="url(#cakeSide)" />
        <path d="M52 166c34 14 62-8 92 2s58 12 88 0 52-8 76 2v-14H52v10Z" fill="url(#cakeTop)" />
        <path d="M52 168c16 20 26 4 40 18s22 2 34 14 24-4 36 10 24-2 36 10 26-8 38 6 24-10 40 2 22-16 32-4v-16H52v-40Z" fill="url(#cakeTop)" opacity="0.95" />
        <path d="M52 172c14 4 18 18 30 18s16-14 28-14 18 16 30 16 18-16 30-16 18 16 30 16 18-16 30-16 18 16 30 16 16-14 28-14" fill="none" stroke="url(#cakeGold)" strokeWidth="2.5" opacity="0.8" />
        <path d="M52 246h256" stroke="url(#cakeGold)" strokeWidth="3" opacity="0.75" />
      </g>

      <g>
        <rect x="106" y="104" width="148" height="60" rx="7" fill="url(#cakeSide)" />
        <ellipse cx="180" cy="104" rx="74" ry="15" fill="url(#cakeTop)" />
        <path d="M106 108c18 18 28 2 40 14s22-2 34 10 24-4 36 8 24-14 38-2v-14H106v-16Z" fill="url(#cakeTop)" />
        <path d="M106 112c14 4 16 16 28 16s16-14 28-14 18 16 30 16 18-16 30-16 18 16 28 16 18-14 26-14" fill="none" stroke="url(#cakeGold)" strokeWidth="2" opacity="0.85" />
        <path d="M106 158h148" stroke="url(#cakeGold)" strokeWidth="2.5" opacity="0.7" />
      </g>

      <g filter="url(#softGlow)">
        {[124, 180, 236].map((x, i) => (
          <g key={x}>
            <rect x={x - 1.5} y={74} width="3" height="27" rx="1.5" fill="url(#cakeGold)" />
            <g className="candle-flame" style={{ animationDelay: `${i * 0.4}s` }}>
              <ellipse cx={x} cy={66} rx="4.5" ry="8" fill="url(#flame)" />
            </g>
          </g>
        ))}
      </g>

      <g>
        {[[132, 96], [180, 90], [228, 96]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i === 1 ? 11 : 9} fill="#b04a68" />
            <circle cx={x - 2} cy={y - 2} r={i === 1 ? 6 : 5} fill="#d47a95" opacity="0.85" />
            <circle cx={x + 2} cy={y + 2} r={i === 1 ? 4 : 3} fill="#7d2947" opacity="0.8" />
          </g>
        ))}
      </g>

      <g>
        <rect x="106" y="192" width="148" height="36" rx="7" fill="url(#cakeGold)" opacity="0.95" />
        <rect x="110" y="196" width="140" height="28" rx="5" fill="#2a0a18" opacity="0.9" />
        <text
          x="180"
          y="214"
          textAnchor="middle"
          fill="#f0d9a8"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontSize="15"
          letterSpacing="0.5"
        >
          18/11 — Still My Choice.
        </text>
      </g>

      {cut ? (
        <path d="M252 166h54l-26 88h-54l26-88Z" fill="#18060e" opacity="0.85" />
      ) : null}

      <motion.g
        initial={false}
        animate={cut ? { x: reduce ? 0 : 66, y: reduce ? 0 : -30, rotate: reduce ? 0 : 10, opacity: 1 } : { x: 0, y: 0, rotate: 0, opacity: 0 }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '252px 180px' }}
      >
        <path d="M252 166h54l-26 88h-54l26-88Z" fill="url(#cakeSide)" />
        <path d="M252 166h54l-26 12h-54l26-12Z" fill="url(#cakeTop)" />
        <path d="M280 178v76" stroke="url(#cakeGold)" strokeWidth="2" opacity="0.6" />
        <path d="M252 166l-26 88" stroke="url(#cakeGold)" strokeWidth="2" opacity="0.7" />
      </motion.g>
    </svg>
  )
}
