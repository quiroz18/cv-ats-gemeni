function DeltaBadge({ delta }) {
  if (delta === 0) return <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 6 }}>—</span>
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, marginLeft: 6,
      background: delta > 0 ? 'rgba(99,153,34,0.15)' : 'rgba(226,75,74,0.15)',
      color: delta > 0 ? '#7bc144' : '#f87171',
    }}>
      {delta > 0 ? '+' : ''}{delta}
    </span>
  )
}

function CategoryCompare({ name, before, after }) {
  const delta = after - before
  const color = after >= 80 ? 'var(--green)' : after >= 65 ? 'var(--amber)' : 'var(--red)'
  const oldColor = before >= 80 ? 'var(--green)' : before >= 65 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--text3)', width: 36 }}>Before</span>
        <div style={{ flex: 1, height: 4, background: 'var(--bg2)', borderRadius: 2 }}>
          <div style={{ height: 4, width: `${before}%`, background: oldColor, borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 11, color: oldColor, width: 28, textAlign: 'right' }}>{before}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text3)', width: 36 }}>After</span>
        <div style={{ flex: 1, height: 4, background: 'var(--bg2)', borderRadius: 2 }}>
          <div style={{ height: 4, width: `${after}%`, background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
        </div>
        <span style={{ fontSize: 11, color, width: 28, textAlign: 'right' }}>{after}<DeltaBadge delta={delta} /></span>
      </div>
    </div>
  )
}

function downloadTxt(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function RescoredReport({ original, updated, cvText, onReset }) {
  const delta = updated.newScore - original.overallScore
  const color = updated.newScore >= 80 ? 'var(--green)' : updated.newScore >= 65 ? 'var(--amber)' : 'var(--red)'
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (updated.newScore / 100) * circ

  const categoryMap = {}
  original.categories.forEach(c => { categoryMap[c.name] = c.score })

  return (
    <div>
      {/* Score comparison header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32,
        background: 'var(--bg2)', borderRadius: 14, padding: '24px', border: '1px solid var(--border)' }}>

        {/* Before */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Before</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text3)' }}>{original.overallScore}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>/ 100</div>
        </div>

        <div style={{ fontSize: 24, color: 'var(--text3)' }}>→</div>

        {/* After ring */}
        <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg3)" strokeWidth="10" />
            <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{updated.newScore}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>/ 100</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,153,34,0.15)', color: '#7bc144',
            border: '1px solid rgba(99,153,34,0.3)', borderRadius: 20, padding: '4px 14px',
            fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            {delta > 0 ? '+' : ''}{delta} pts improvement
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Updated CV Generated
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{updated.verdict}</p>
        </div>

        <button
          onClick={() => downloadTxt(cvText, 'CV_Updated.txt')}
          style={{
            background: 'linear-gradient(135deg, var(--green), #7bc144)',
            color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(99,153,34,0.3)', whiteSpace: 'nowrap',
          }}>
          ↓ Download CV
        </button>
      </div>

      {/* Category before/after */}
      <Section title="Category Breakdown — Before vs After">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {updated.categories.map(c => (
            <CategoryCompare key={c.name} name={c.name} before={categoryMap[c.name] || 0} after={c.score} />
          ))}
        </div>
      </Section>

      {/* Closed gaps */}
      {updated.closedGaps?.length > 0 && (
        <Section title="Gaps Closed">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {updated.closedGaps.map(g => (
              <span key={g} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                background: 'rgba(99,153,34,0.12)', color: '#7bc144',
                border: '1px solid rgba(99,153,34,0.25)',
              }}>
                ✓ {g}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* What changed */}
      {updated.improvements?.length > 0 && (
        <Section title="What Changed">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {updated.improvements.map((imp, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--bg3)',
                borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0',
                fontSize: 13, lineHeight: 1.5 }}>
                {imp}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Updated CV preview */}
      <Section title="Updated CV Text">
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '20px', fontSize: 12, lineHeight: 1.7, color: 'var(--text2)',
          maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace',
        }}>
          {cvText}
        </div>
      </Section>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        <button
          onClick={() => downloadTxt(cvText, 'CV_Updated.txt')}
          style={{
            background: 'linear-gradient(135deg, var(--green), #7bc144)',
            color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
          ↓ Download Updated CV
        </button>
        <button onClick={onReset} style={{
          background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 28px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Start over
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--text3)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
