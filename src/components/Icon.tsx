import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'play'
  | 'pause'
  | 'volume'
  | 'bluetooth'
  | 'check'
  | 'arrow'
  | 'mic'
  | 'heart'
  | 'sparkle'
  | 'back'
  | 'gear'
  | 'download'
  | 'trash'
  | 'phone'
  | 'replay'
  | 'headphones'

type IconProps = SVGProps<SVGSVGElement> & { name: IconName; size?: number }

const paths: Record<IconName, ReactNode> = {
  play: <path d="M8 5.5v13l11-6.5L8 5.5Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5Z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
      <path d="M18 6.5a7.6 7.6 0 0 1 0 11" />
    </>
  ),
  bluetooth: <path d="M8 7.5 16 16l-4 3.5V4.5L16 8 8 16.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z" />,
  sparkle: <path d="M12 3.5 13.7 9l5.8 1.7-5.8 1.8L12 18l-1.7-5.5L4.5 10.7 10.3 9 12 3.5Z" />,
  back: <path d="m14.5 6-6 6 6 6" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M4.9 7.5l1.8 1M17.3 15.5l1.8 1M4.9 16.5l1.8-1M17.3 8.5l1.8-1" />
    </>
  ),
  download: <path d="M12 4v11m-4-4 4 4 4-4M5 19h14" />,
  trash: <path d="M5 7h14M9 7V5h6v2m-8 0 1 12h8l1-12" />,
  phone: <path d="M7 4.5 9.5 8 8 9.8c1 2.3 2.9 4.2 5.2 5.2l1.8-1.5 3.5 2.5-.8 3c-.3 1-1.3 1.6-2.3 1.4C9.2 19.4 4.6 14.8 4 8.3 3.8 7.2 4.4 6.2 5.4 5.9l1.6-.4Z" />,
  replay: <path d="M5 12a7 7 0 1 0 2-4.9M5 5v4h4" />,
  headphones: (
    <>
      <path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" />
      <rect x="3.5" y="13" width="4" height="7" rx="2" />
      <rect x="16.5" y="13" width="4" height="7" rx="2" />
    </>
  ),
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
