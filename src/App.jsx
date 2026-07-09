import { useEffect, useRef, useState } from 'react'

const MODES = {
  focus: { label: 'Фокус', minutes: 25 },
  break: { label: 'Перерыв', minutes: 5 },
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export default function App() {
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const finishAt = useRef(null)

  const totalSeconds = MODES[mode].minutes * 60
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  useEffect(() => {
    if (!isRunning) return

    finishAt.current = Date.now() + secondsLeft * 1000

    const interval = window.setInterval(() => {
      const nextSeconds = Math.max(
        0,
        Math.ceil((finishAt.current - Date.now()) / 1000),
      )

      setSecondsLeft(nextSeconds)

      if (nextSeconds === 0) {
        window.clearInterval(interval)
        setIsRunning(false)
        if (mode === 'focus') setSessions((count) => count + 1)
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [isRunning, mode])

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} — ${MODES[mode].label}`
  }, [secondsLeft, mode])

  function selectMode(nextMode) {
    setMode(nextMode)
    setSecondsLeft(MODES[nextMode].minutes * 60)
    setIsRunning(false)
  }

  function resetTimer() {
    setSecondsLeft(totalSeconds)
    setIsRunning(false)
  }

  return (
    <main className="page">
      <section className="timer-card" aria-label="Таймер Помодоро">
        <header className="header">
          <div className="brand-mark" aria-hidden="true">
            ◒
          </div>
          <div>
            <p className="eyebrow">Таймер Помодоро</p>
            <h1>Время сосредоточиться</h1>
          </div>
        </header>

        <div className="mode-switch" role="group" aria-label="Режим таймера">
          {Object.entries(MODES).map(([key, item]) => (
            <button
              className={mode === key ? 'mode-button active' : 'mode-button'}
              key={key}
              onClick={() => selectMode(key)}
              type="button"
              aria-pressed={mode === key}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="timer" aria-live="polite">
          <span>{formatTime(secondsLeft)}</span>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="controls">
          <button
            className="primary-button"
            type="button"
            onClick={() => setIsRunning((running) => !running)}
          >
            {isRunning ? 'Пауза' : 'Начать'}
          </button>
          <button className="reset-button" type="button" onClick={resetTimer}>
            Сбросить
          </button>
        </div>

        <footer className="footer">
          <span>Завершено сегодня</span>
          <strong>
            {sessions} {sessions === 1 ? 'сессия' : 'сессий'}
          </strong>
        </footer>
      </section>
    </main>
  )
}
