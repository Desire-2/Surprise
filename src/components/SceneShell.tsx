import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type SceneShellProps = {
  sceneKey: string
  tone?: 'dark' | 'warm' | 'celebrate'
  children: ReactNode
}

export function SceneShell({ sceneKey, tone = 'dark', children }: SceneShellProps) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      key={sceneKey}
      className={`scene scene--${tone}`}
      initial={{ opacity: 0, y: reduce ? 0 : 26, filter: reduce ? 'none' : 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: reduce ? 0 : -18, filter: reduce ? 'none' : 'blur(8px)' }}
      transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="scene-inner">{children}</div>
    </motion.section>
  )
}
