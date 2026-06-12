import { useState, useRef } from 'react'

export default function InputStep({ onGrade }) {
  const [jd, setJd] = useState('')
  const [cvText, setCvText] = useState('')
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const extractTextFromFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // For PDFs we read as text (basic extraction)
        // In production you'd use a proper PDF parser
        const text = e.target.result
        resolve(typeof text === 'string' ? text : 'PDF uploaded — content will be analyzed via Claude vision.')
      }
      reader.readAsText(file)
    })
  }

  const handleFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      // Store as base64 for Claude API
      const base64 = e.target.result.split(',')[1]
      setCvText(JSON.stringify({ type: 'pdf_base64', data: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async () => {
    if (!jd.trim() || !cvText) return
    setLoading(true)

    let payload = { jobDescription: jd, fileName }

    try {
      const parsed = JSON.parse(cvText)
      if (parsed.type === 'pdf_base64') {
        payload.cvBase64 = parsed.data
      } else {
        payload.cvText = cvText
      }
    } catch {
      payload.cvText = cvText
    }

    onGrade(payload)
  }

  const canSubmit = jd.trim().length > 50 && cvText.length > 0

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Grade your CV against any job
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15 }}>
          Paste a job description, upload your CV — get an ATS score and an improved version in seconds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* JD Input */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here…"
            style={{
              width: '100%', height: 340,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px',
              color: 'var(--text)', fontSize: 13, lineHeight: 1.6,
              resize: 'vertical', fontFamily: 'inherit', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
            {jd.length} characters {jd.length < 50 && jd.length > 0 && '— add more detail'}
          </div>
        </div>

        {/* CV Upload */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your CV / Resume
          </label>
          <div
            onClick={() => fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            style={{
              height: 340, border: `2px dashed ${dragOver ? 'var(--accent)' : fileName ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 10, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
              background: dragOver ? 'rgba(91,106,240,0.06)' : fileName ? 'rgba(99,153,34,0.06)' : 'var(--bg2)',
            }}
          >
            {fileName ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--green)', marginBottom: 4 }}>{fileName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Click to replace</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Drop your CV here</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>or click to browse</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 20 }}>
                  PDF supported
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            background: canSubmit ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--bg3)',
            color: canSubmit ? '#fff' : 'var(--text3)',
            border: 'none', borderRadius: 10,
            padding: '14px 40px', fontSize: 15, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
            transition: 'all 0.2s', boxShadow: canSubmit ? '0 4px 20px rgba(91,106,240,0.3)' : 'none',
          }}
        >
          {loading ? 'Analyzing…' : 'Grade my CV →'}
        </button>
        {!canSubmit && (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            {!jd.trim() && 'Add a job description '}
            {!cvText && 'Upload your CV'}
          </div>
        )}
      </div>
    </div>
  )
}
