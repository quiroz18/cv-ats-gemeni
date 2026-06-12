import { useState } from 'react'
import InputStep from './components/InputStep'
import ScoreReport from './components/ScoreReport'
import RescoredReport from './components/RescoredReport'
import Header from './components/Header'

export default function App() {
  const [step, setStep] = useState('input') // input | grading | scored | improving | rescored
  const [jd, setJd] = useState('')
  const [cvText, setCvText] = useState('')
  const [cvFileName, setCvFileName] = useState('')
  const [scoreData, setScoreData] = useState(null)
  const [rescoreData, setRescoreData] = useState(null)
  const [error, setError] = useState('')

  const handleGrade = async ({ jobDescription, cvText: text, fileName }) => {
    setJd(jobDescription)
    setCvText(text)
    setCvFileName(fileName)
    setStep('grading')
    setError('')

    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, cvText: text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScoreData(data)
      setStep('scored')
    } catch (err) {
      setError(err.message)
      setStep('input')
    }
  }

  const handleImprove = async () => {
    setStep('improving')
    setError('')

    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jd,
          cvText,
          originalScore: scoreData.overallScore,
          originalCategories: scoreData.categories,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRescoreData(data)
      setStep('rescored')
    } catch (err) {
      setError(err.message)
      setStep('scored')
    }
  }

  const handleReset = () => {
    setStep('input')
    setJd('')
    setCvText('')
    setCvFileName('')
    setScoreData(null)
    setRescoreData(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onReset={step !== 'input' ? handleReset : null} />
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {error && (
          <div style={{
            background: 'rgba(226,75,74,0.12)', border: '1px solid var(--red)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 24,
            color: '#f87171', fontSize: 14
          }}>
            ⚠ {error}
          </div>
        )}

        {step === 'input' && <InputStep onGrade={handleGrade} />}

        {step === 'grading' && (
          <LoadingState message="Analyzing your CV against the job description…" />
        )}

        {step === 'scored' && scoreData && (
          <ScoreReport
            data={scoreData}
            cvFileName={cvFileName}
            onImprove={handleImprove}
            onReset={handleReset}
          />
        )}

        {step === 'improving' && (
          <LoadingState message="Generating improved CV and rescoring…" />
        )}

        {step === 'rescored' && rescoreData && scoreData && (
          <RescoredReport
            original={scoreData}
            updated={rescoreData}
            cvText={rescoreData.updatedCV}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}

function LoadingState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: 24 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" style={{ animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="4"/>
          <path d="M24 4 A20 20 0 0 1 44 24" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      </div>
      <p style={{ color: 'var(--text2)', fontSize: 16 }}>{message}</p>
    </div>
  )
}
