// Mounts the real CodeMirrorMergeDiff for the merge.mjs check.
import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CodeMirrorMergeDiff, type MergeDiffHandle } from '../../../src/components/aselius-workspace/workspace/ChatSpace/codeworkspace/CodeMirrorMergeDiff'

const OLD = ['import a from "a"', 'const x = 1', 'const y = 2', 'export function f() {', '  return x + y', '}', '', '// keep', 'const z = 3', 'export default f', ''].join('\n')
const NEW = ['import a from "a"', 'const x = 10', 'const y = 2', 'export function f() {', '  return x * y', '}', '', '// keep', 'const z = 3', 'export const extra = true', 'export default f', ''].join('\n')

function App() {
  const handle = useRef<MergeDiffHandle | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const dark = new URLSearchParams(location.search).get('theme') === 'dark'
  document.documentElement.style.background = dark ? '#111' : '#fff'
  ;(window as any).__merge ??= { OLD, NEW, handle, resolved: null as string | null, resolvedCount: 0 }
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div id="remaining" style={{ font: '12px sans-serif', color: dark ? '#aaa' : '#333', padding: 6 }}>{String(remaining)}</div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CodeMirrorMergeDiff
          path="src/app.ts" oldContent={OLD} newContent={NEW} isDark={dark} handleRef={handle}
          onProgress={setRemaining}
          onResolved={(m) => { (window as any).__merge.resolved = m; (window as any).__merge.resolvedCount++ }}
        />
      </div>
    </div>
  )
}
createRoot(document.getElementById('root')!).render(<App />)
