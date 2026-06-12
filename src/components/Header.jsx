export default function Header({ onReset }) {
  return (
    <header style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#fff'
        }}>A</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>CV ATS Grader</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>AI-powered resume analyzer</div>
        </div>
      </div>
      {onReset && (
        <button
          onClick={onReset}
          style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px', color: 'var(--text2)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← New analysis
        </button>
      )}
    </header>
  )
}
