function ScoreRing({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? 'var(--green)' : score >= 65 ? 'var(--amber)' : 'var(--red)'
  const bgColor = score >= 80 ? 'rgba(99,153,34,0.08)' : score >= 65 ? 'rgba(186,117,23,0.08)' : 'rgba(226,75,74,0.08)'

  return (
    <div style={{
      position: 'relative', width: 140, height: 140, flexShrink: 0,
      background: bgColor, borderRadius: '50%',
    }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg3)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color }}>{score}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>/ 100</div>
      </div>
    </div>
  )
}

function VerdictBadge({ verdict }) {
  const colors = {
    'Strong Match': { bg: 'rgba(99,153,34,0.15)', color: '#7bc144', border: 'rgba(99,153,34,0.3)' },
    'Moderate Match': { bg: 'rgba(186,117,23,0.15)', color: '#e8a83a', border: 'rgba(186,117,23,0.3)' },
    'Partial Match': { bg: 'rgba(226,75,74,0.15)', color: '#f87171', border: 'rgba(226,75,74,0.3)' },
    'Weak Match': { bg: 'rgba(226,75,74,0.2)', color: '#f87171', border: 'rgba(226,75,74,0.4)' },
  }
  const c = colors[verdict] || colors['Moderate Match']
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
    }}>{verdict}</span>
  )
}

function CategoryCard({ name, score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 65 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{name}</div>
      <div style={{ height: 6, background: 'var(--bg2)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ height: 6, width: `${score}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color }}>{score} / 100</div>
    </div>
  )
}

function KeywordPill({ word, hit }) {
  return (
    <span style={{
      fontSize: 12, padding: '4px 10px', borderRadius: 20,
      background: hit ? 'rgba(99,153,34,0.12)' : 'rgba(226,75,74,0.1)',
      color: hit ? '#7bc144' : '#f87171',
      border: `1px solid ${hit ? 'rgba(99,153,34,0.25)' : 'rgba(226,75,74,0.25)'}`,
    }}>
      {hit ? '✓' : '✗'} {word}
    </span>
  )
}

export default function ScoreReport({ data, cvFileName, onImprove, onReset }) {
  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32,
        background: 'var(--bg2)', borderRadius: 14, padding: '24px', border: '1px solid var(--border)' }}>
        <ScoreRing score={data.overallScore} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {cvFileName || 'Your CV'}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            ATS Score Report
          </h2>
          <VerdictBadge verdict={data.verdict} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onImprove} style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(91,106,240,0.3)', whiteSpace: 'nowrap',
          }}>
            ✨ Improve CV →
          </button>
          <button onClick={onReset} style={{
            background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Start over
          </button>
        </div>
      </div>

      {/* Categories */}
      <Section title="Category Breakdown">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {data.categories.map(c => <CategoryCard key={c.name} name={c.name} score={c.score} />)}
        </div>
      </Section>

      {/* Keywords */}
      <Section title="Keyword Hits & Gaps">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.keywordHits.map(k => <KeywordPill key={k} word={k} hit />)}
          {data.keywordGaps.map(k => <KeywordPill key={k} word={k} hit={false} />)}
        </div>
      </Section>

      {/* Strengths + Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Section title="Strengths" color="var(--green)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.strengths.map((s, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--bg3)', borderLeft: '3px solid var(--green)', borderRadius: '0 8px 8px 0', fontSize: 13, lineHeight: 1.5 }}>
                {s}
              </div>
            ))}
          </div>
        </Section>
        <Section title="Gaps & Risks" color="var(--red)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.gaps.map((g, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--bg3)', borderLeft: '3px solid var(--red)', borderRadius: '0 8px 8px 0', fontSize: 13, lineHeight: 1.5 }}>
                {g}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Recommendations */}
      <Section title="Recommendations to hit 90+">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.recommendations.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ color: 'var(--accent2)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button onClick={onImprove} style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          color: '#fff', border: 'none', borderRadius: 10, padding: '14px 40px',
          fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 20px rgba(91,106,240,0.3)',
        }}>
          ✨ Generate improved CV →
        </button>
      </div>
    </div>
  )
}

function Section({ title, children, color }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: color || 'var(--text3)', marginBottom: 12,
        borderBottom: '1px solid var(--border)', paddingBottom: 8,
      }}>{title}</h3>
      {children}
    </div>
  )
}
