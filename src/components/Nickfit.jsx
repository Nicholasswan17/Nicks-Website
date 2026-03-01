import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'
import './Nickfit.css'

// ─── Exercise Data ────────────────────────────────────────────────────────────

const EXERCISES = {
  PUSH: {
    label: 'PUSH', icon: '🔺', color: '#e84040',
    sections: [
      {
        muscle: 'Chest', exercises: [
          { name: 'Bench Press', muscle: 'Chest', videoId: 'hWbUlkb5Ms4', isShort: true, notes: ['Set your arch before unracking', 'Grip 1.5× shoulder width', 'Elbows tucked at 45°', 'Soft contact with chest — no bouncing'] },
          { name: 'Incline Bench Press', muscle: 'Upper Chest', videoId: 'L9UKMQw1Nss', isShort: true, notes: ['Arch your back', 'Set bench to 30–45°', 'Bar travels to upper chest'] },
          { name: 'Cable Fly', muscle: 'Chest', videoId: '4mfLHnFL0Uw', isShort: false, notes: ['Lean forward to counteract the weight', 'Open deep at the bottom for full stretch', 'High-to-Low targets lower chest', 'Low-to-High targets upper chest'] },
          { name: 'Pec Deck', muscle: 'Chest', videoId: 'g3T7LsEeDWQ', isShort: true, notes: ['Slight bend in elbows throughout', 'Squeeze pecs at peak contraction', "Don't let the weight fly back", 'Handles at mid-chest level'] },
        ]
      },
      {
        muscle: 'Shoulders', exercises: [
          { name: 'Overhead Press', muscle: 'Front Delts', videoId: '4LBVP2Oe7fg', isShort: true, notes: ['Brace core and glutes throughout', 'Bar arcs slightly around the face', "Don't hyperextend lower back at lockout"] },
          { name: 'Lateral Raise (Cable)', muscle: 'Side Delts', videoId: 'lnvQGCNwGfk', isShort: true, notes: ['Cable height at knee for horizontal tension', 'Lead with elbow, not wrist', 'Slight forward lean isolates lateral head'] },
          { name: 'Rear Delt Cable Fly', muscle: 'Rear Delts', videoId: 'FeERX9UwspY', isShort: true, notes: ['Cross cables, pull from opposite sides', 'Arms nearly parallel to ground', 'Squeeze rear delts at full extension'] },
        ]
      },
      {
        muscle: 'Triceps', exercises: [
          { name: 'Tricep Pushdown (Triangle)', muscle: 'Triceps', videoId: 'fkvCU26tbus', isShort: true, notes: ['Great form breakdown in this video', 'Elbows pinned to sides', 'Full extension at the bottom'] },
          { name: 'Lying Skull Crushers', muscle: 'Triceps (Long Head)', videoId: 'K3mFeNz4e3w', isShort: true, notes: ['Lower bar to forehead with control', 'Keep upper arms vertical', 'EZ-bar is easier on wrists'] },
          { name: 'Rope Pushdown', muscle: 'Triceps', videoId: '-xa-6cQaZKY', isShort: false, notes: ['Split the rope at bottom for full contraction', 'Slight forward lean for constant tension', "Don't let elbows flare out"] },
        ]
      },
    ]
  },
  PULL: {
    label: 'PULL', icon: '🔻', color: '#4080e8',
    sections: [
      {
        muscle: 'Back', exercises: [
          { name: 'Lat Pulldown', muscle: 'Lats', videoId: 'hnSqbBk15tw', isShort: true, notes: ['Great advice in this video', 'Pull to upper chest, slight lean back', 'Drive elbows down to pockets'] },
          { name: 'Barbell Row', muscle: 'Back / Lats', videoId: 'Nqh7q3zDCoQ', isShort: true, notes: ['Back roughly parallel to floor', 'Pull to lower chest / upper abdomen', 'Squeeze shoulder blades at top'] },
          { name: 'Seated Cable Row', muscle: 'Mid Back', videoId: 'UyI7Sc7ZVdU', isShort: true, notes: ["Don't use momentum", 'Full stretch front, full squeeze back', 'Drive elbows behind your body'] },
          { name: 'Pull Ups', muscle: 'Lats / Biceps', videoId: 'OEXosPwzFdc', isShort: true, notes: ['Start from dead hang', 'Drive elbows down and back', 'Chin clears the bar at top'] },
        ]
      },
      {
        muscle: 'Biceps', exercises: [
          { name: 'Barbell Curl', muscle: 'Biceps', videoId: 'ZQWL7omZh94', isShort: false, notes: ['Elbows pinned at sides', 'Supinate wrist at top for peak contraction', 'Slow and controlled on the way down'] },
          { name: 'Hammer Curl', muscle: 'Brachialis / Brachioradialis', videoId: 'BRVDS6HVR9Q', isShort: false, notes: ['Neutral grip (palms facing each other)', 'Adds thickness and forearm size', "Don't swing — control the rep"] },
          { name: 'Incline Dumbbell Curl', muscle: 'Biceps (Long Head)', videoId: 'fXFN8_1Bh6k', isShort: true, notes: ['Set bench to ~45–60°', 'Arms hang behind for max stretch', 'Great for building the bicep peak'] },
        ]
      },
      {
        muscle: 'Neck', exercises: [
          { name: 'Neck Harness Extensions', muscle: 'Neck', videoId: 'zO_z9EbZ7o0', isShort: true, notes: ['Start light, build gradually', 'Full ROM — chin to chest then extend', 'Control every rep — no jerking'] },
        ]
      },
    ]
  },
  LEGS: {
    label: 'LEGS', icon: '⚡', color: '#40c870',
    sections: [
      {
        muscle: 'Quads', exercises: [
          { name: 'Squat', muscle: 'Quads (Prime Mover)', videoId: 'xE9K4T5siT4', isShort: true, notes: ['"Use the quads! I want the quads to be the prime mover, even if you use less weight, even the bar." — Tom Platz', 'Drive knees out over toes', "Don't good-morning the squat", 'Hit depth before loading heavy'] },
          { name: 'Hack Squat', muscle: 'Quads', videoId: '-p8HjTDJlq8', isShort: true, notes: ['Feet high = more glute/ham', 'Feet low = more quad emphasis', 'Lower back pressed against pad throughout'] },
          { name: 'Leg Press', muscle: 'Quads / Glutes', videoId: 'nDh_BlnLCGc', isShort: true, notes: ['Never lock out knees at top', 'Lower until knees at 90° minimum', 'Foot placement changes emphasis'] },
          { name: 'Leg Extension', muscle: 'Quads (Isolation)', videoId: 'uM86QE59Tgc', isShort: true, notes: ['Squeeze at the top of every rep', "Control the eccentric — don't drop", 'Excellent quad finisher'] },
        ]
      },
      {
        muscle: 'Hamstrings / Glutes', exercises: [
          { name: 'Romanian Deadlift', muscle: 'Hamstrings / Glutes', videoId: '5rIqP63yWFg', isShort: true, notes: ['Hip hinge — push hips back, not down', 'Feel the hamstring stretch at bottom', 'Keep bar close to legs', 'Stop when back starts rounding'] },
          { name: 'Leg Curl', muscle: 'Hamstrings', videoId: '_lgE0gPvbik', isShort: true, notes: ['Point toes for more hamstring activation', 'Full range from straight to curled', 'Slow negative for max hypertrophy'] },
        ]
      },
      {
        muscle: 'Calves', exercises: [
          { name: 'Calf Raise', muscle: 'Gastrocnemius / Soleus', videoId: '95itLfMBG40', isShort: true, notes: ['Full stretch at bottom — heels below platform', 'Pause at top for 1–2 seconds', 'Calves respond well to high reps (15–25)', 'Bent knee = more soleus; straight = more gastrocnemius'] },
        ]
      },
    ]
  },
}

const ALL_EXERCISES = []
Object.entries(EXERCISES).forEach(([day, { sections, color }]) => {
  sections.forEach(({ muscle, exercises }) => {
    exercises.forEach(ex => ALL_EXERCISES.push({ ...ex, day, dayColor: color, primaryMuscle: muscle }))
  })
})

const getExercise = (name) => ALL_EXERCISES.find(e => e.name === name)
const fmt = (n) => n != null ? `${n}` : '—'
const timeAgo = (ts) => {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Comments ─────────────────────────────────────────────────────────────────

function ExerciseComments({ exerciseName, user }) {
  const [comments, setComments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('exercise_comments')
      .select('*')
      .eq('exercise_name', exerciseName)
      .order('created_at', { ascending: false })
    if (!data) return
    setComments(data)
    const ids = [...new Set(data.map(c => c.user_id))]
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p.display_name || 'Nicktopian' })
      setProfiles(map)
    }
    setLoading(false)
  }, [exerciseName])

  useEffect(() => { load() }, [load])

  const post = async () => {
    if (!text.trim() || !user?.id) return
    setPosting(true)
    await supabase.from('exercise_comments').insert({ user_id: user.id, exercise_name: exerciseName, comment: text.trim() })
    setText('')
    await load()
    setPosting(false)
  }

  const remove = async (id) => {
    await supabase.from('exercise_comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="nkf-comments">
      <div className="nkf-comments-header">💬 Community ({comments.length})</div>
      {user && (
        <div className="nkf-comment-input-row">
          <input
            className="nkf-comment-input"
            placeholder="Share tips, PRs, or questions..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && post()}
          />
          <button className="nkf-comment-post-btn" onClick={post} disabled={posting || !text.trim()}>
            {posting ? '...' : 'Post'}
          </button>
        </div>
      )}
      {loading ? (
        <div className="nkf-comments-loading">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="nkf-comments-empty">No comments yet. Be the first!</div>
      ) : (
        <div className="nkf-comments-list">
          {comments.map(c => (
            <div key={c.id} className="nkf-comment-item">
              <div className="nkf-comment-meta">
                <span className="nkf-comment-name">{profiles[c.user_id] || 'Nicktopian'}</span>
                <span className="nkf-comment-time">{timeAgo(c.created_at)}</span>
                {c.user_id === user?.id && (
                  <button className="nkf-comment-delete" onClick={() => remove(c.id)}>✕</button>
                )}
              </div>
              <div className="nkf-comment-text">{c.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, accentColor, user }) {
  const [open, setOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <div className={`nkf-exercise-card${open ? ' expanded' : ''}`}>
      <div className="nkf-exercise-header" onClick={() => setOpen(o => !o)}>
        <div className="nkf-exercise-main">
          <span className="nkf-exercise-name">{exercise.name}</span>
          <span className="nkf-exercise-muscle" style={{ color: accentColor }}>{exercise.muscle}</span>
        </div>
        <div className="nkf-exercise-controls">
          <button
            className="nkf-video-btn"
            style={{ borderColor: accentColor, color: accentColor }}
            onClick={e => { e.stopPropagation(); setVideoOpen(v => !v) }}
          >
            {videoOpen ? '✕ Close' : '▶ Video'}
          </button>
          <span className="nkf-chevron" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </div>
      </div>

      {videoOpen && (
        <div className="nkf-video-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${exercise.videoId}`}
            title={exercise.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={exercise.isShort ? 'nkf-video-short' : 'nkf-video-wide'}
          />
        </div>
      )}

      {open && (
        <div className="nkf-exercise-body">
          <div className="nkf-notes-label">Form Cues</div>
          <ul className="nkf-notes-list">
            {exercise.notes.map((note, i) => (
              <li key={i} className="nkf-note-item">
                <span className="nkf-note-dot" style={{ background: accentColor }} />
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <ExerciseComments exerciseName={exercise.name} user={user} />
        </div>
      )}
    </div>
  )
}

// ─── Program Builder ──────────────────────────────────────────────────────────

function ProgramBuilder({ user, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const [activeDay, setActiveDay] = useState('PUSH')
  const [showNameWarning, setShowNameWarning] = useState(false)

  const toggle = (exName) => {
    setSelected(prev => prev.includes(exName) ? prev.filter(n => n !== exName) : [...prev, exName])
  }
  const moveUp = (i) => { if (i === 0) return; setSelected(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a }) }
  const moveDown = (i) => { setSelected(prev => { if (i === prev.length - 1) return prev; const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a }) }

  const save = async () => {
    if (!name.trim() || selected.length === 0) return
    setSaving(true)
    await supabase.from('programs').insert({ user_id: user.id, name: name.trim(), exercises: selected })
    setSaving(false)
    onSave()
  }

  const day = EXERCISES[activeDay]

  return (
    <div className="nkf-builder">
      <div className="nkf-builder-header">
        <button className="nkf-back-btn" onClick={onCancel}>← Back</button>
        <h2 className="nkf-builder-title">Build New Program</h2>
      </div>

      <input
        className="nkf-program-name-input"
        placeholder="Program name (e.g. Monday Push, PPL Pull Day)"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <div className="nkf-builder-layout">
        <div className="nkf-builder-left">
          <div className="nkf-builder-section-label">Select Exercises</div>
          <div className="nkf-day-tabs">
            {Object.entries(EXERCISES).map(([key, val]) => (
              <button
                key={key}
                className={`nkf-day-tab${activeDay === key ? ' active' : ''}`}
                style={activeDay === key ? { background: val.color, borderColor: val.color, color: '#000' } : { borderColor: val.color, color: val.color }}
                onClick={() => setActiveDay(key)}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>
          {day.sections.map(sec => (
            <div key={sec.muscle} className="nkf-builder-muscle">
              <div className="nkf-builder-muscle-name" style={{ color: day.color }}>{sec.muscle}</div>
              {sec.exercises.map(ex => (
                <label key={ex.name} className={`nkf-picker-row${selected.includes(ex.name) ? ' checked' : ''}`} style={selected.includes(ex.name) ? { borderColor: day.color } : {}}>
                  <input type="checkbox" checked={selected.includes(ex.name)} onChange={() => toggle(ex.name)} className="nkf-picker-checkbox" />
                  <span className="nkf-picker-name">{ex.name}</span>
                  <span className="nkf-picker-muscle" style={{ color: day.color }}>{ex.muscle}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="nkf-builder-right">
          <div className="nkf-builder-section-label">Exercise Order ({selected.length})</div>
          {selected.length === 0 ? (
            <div className="nkf-builder-empty">Select exercises from the left to build your program</div>
          ) : (
            <div className="nkf-order-list">
              {selected.map((exName, i) => {
                const ex = getExercise(exName)
                return (
                  <div key={exName} className="nkf-order-item">
                    <span className="nkf-order-num">{i + 1}</span>
                    <div className="nkf-order-info">
                      <span className="nkf-order-name">{exName}</span>
                      {ex && <span className="nkf-order-muscle" style={{ color: ex.dayColor }}>{ex.primaryMuscle}</span>}
                    </div>
                    <div className="nkf-order-btns">
                      <button onClick={() => moveUp(i)} disabled={i === 0}>↑</button>
                      <button onClick={() => moveDown(i)} disabled={i === selected.length - 1}>↓</button>
                      <button onClick={() => toggle(exName)}>✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <button
            className="nkf-save-program-btn"
            onClick={() => {
              if (!name.trim()) { setShowNameWarning(true); return }
              save()
            }}
            disabled={saving || selected.length === 0}
          >
            {saving ? 'Saving...' : `💾 Save Program (${selected.length} exercises)`}
          </button>
        </div>
      </div>

      {/* Bruno warning */}
      {showNameWarning && (
        <div className="nkf-bruno-overlay" onClick={() => setShowNameWarning(false)}>
          <div className="nkf-bruno-popup" onClick={e => e.stopPropagation()}>
            <img src="/BootBruno-removebg-preview.png" alt="Bruno" className="nkf-bruno-img" />
            <div className="nkf-bruno-bubble">
              <p className="nkf-bruno-msg">Bro... you really gonna save a program called <em>nothing</em>? Give it a name mate 💀</p>
              <button className="nkf-bruno-btn" onClick={() => setShowNameWarning(false)}>
                ok ok fine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Program History ─────────────────────────────────────────────────────────

function ProgramHistory({ program, user, onBack }) {
  const [sessions, setSessions] = useState([])
  const [sessionSets, setSessionSets] = useState({})
  const [expandedSession, setExpandedSession] = useState(null)
  const [expandedProgress, setExpandedProgress] = useState(null) // exercise name
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState({}) // { exName: [{date, best}] }

  useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', program.id)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false })
      if (!sess?.length) { setLoading(false); return }
      setSessions(sess)

      // Load all sets for this program's sessions at once
      const ids = sess.map(s => s.id)
      const { data: sets } = await supabase
        .from('session_sets')
        .select('*')
        .in('session_id', ids)
        .order('set_number')

      // Group by session
      const bySession = {}
      sets?.forEach(row => {
        if (!bySession[row.session_id]) bySession[row.session_id] = {}
        if (!bySession[row.session_id][row.exercise_name]) bySession[row.session_id][row.exercise_name] = []
        bySession[row.session_id][row.exercise_name].push(row)
      })
      setSessionSets(bySession)

      // Build progress over time per exercise (newest first → reverse for chart)
      const progress = {}
      program.exercises.forEach(exName => {
        const points = sess
          .map(s => {
            const exSets = bySession[s.id]?.[exName] || []
            if (!exSets.length) return null
            const best = Math.max(...exSets.map(r => r.weight || 0))
            const vol = exSets.reduce((a, r) => a + (r.weight || 0) * (r.reps || 0), 0)
            return { date: s.started_at, best, vol, sets: exSets.length }
          })
          .filter(Boolean)
          .reverse() // oldest first for progress view
        if (points.length) progress[exName] = points
      })
      setProgressData(progress)
      setLoading(false)
    }
    load()
  }, [program.id, user.id])

  const loadSets = (sessionId) => {
    setExpandedSession(s => s === sessionId ? null : sessionId)
  }

  const deleteSession = async (sessionId) => {
    await supabase.from('session_sets').delete().eq('session_id', sessionId)
    await supabase.from('workout_sessions').delete().eq('id', sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    setSessionSets(prev => { const n = { ...prev }; delete n[sessionId]; return n })
    if (expandedSession === sessionId) setExpandedSession(null)
  }

  const shareSession = async (session) => {
    const sets = sessionSets[session.id] || {}
    const date = new Date(session.started_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    const duration = session.completed_at
      ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 60000) : null
    let text = `💪 ${session.program_name || 'Workout'} — ${date}\n`
    if (session.bodyweight) text += `⚖️ Bodyweight: ${session.bodyweight}kg\n`
    if (duration) text += `⏱ Duration: ${duration}min\n`
    if (session.notes) text += `📝 ${session.notes}\n`
    text += '\n'
    Object.entries(sets).forEach(([exName, exSets]) => {
      const best = Math.max(...exSets.map(s => s.weight || 0))
      text += `${exName} (best: ${best}kg)\n`
      exSets.forEach(s => { text += `  Set ${s.set_number}: ${s.weight > 0 ? s.weight + 'kg' : '—'} × ${s.reps || '—'}\n` })
    })
    text += '\n— via Nicktopia 🏋️'
    try { await navigator.clipboard.writeText(text); alert('✓ Results copied to clipboard!') }
    catch { prompt('Copy your results:', text) }
  }

  // Stats
  const totalSessions = sessions.length
  const totalVolume = Object.values(sessionSets).reduce((total, exMap) => {
    return total + Object.values(exMap).reduce((t, sets) => {
      return t + sets.reduce((s, r) => s + (r.weight || 0) * (r.reps || 0), 0)
    }, 0)
  }, 0)
  const avgDuration = sessions.length ? Math.round(
    sessions.filter(s => s.completed_at).reduce((sum, s) =>
      sum + (new Date(s.completed_at) - new Date(s.started_at)) / 60000, 0
    ) / sessions.filter(s => s.completed_at).length
  ) : 0

  if (loading) return (
    <div className="nkf-prog-history">
      <button className="nkf-back-btn" onClick={onBack}>← Back</button>
      <div className="nkf-loading-msg">Loading program history...</div>
    </div>
  )

  return (
    <div className="nkf-prog-history">
      <div className="nkf-prog-history-header">
        <button className="nkf-back-btn" onClick={onBack}>← Back</button>
        <div>
          <h2 className="nkf-section-title">{program.name}</h2>
          <p className="nkf-section-sub">{program.exercises.length} exercises · program history</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="nkf-prog-hist-stats">
        <div className="nkf-prog-hist-stat">
          <span className="nkf-prog-hist-stat-num">{totalSessions}</span>
          <span className="nkf-prog-hist-stat-label">Sessions</span>
        </div>
        <div className="nkf-prog-hist-stat">
          <span className="nkf-prog-hist-stat-num">{(totalVolume / 1000).toFixed(1)}t</span>
          <span className="nkf-prog-hist-stat-label">Total Volume</span>
        </div>
        <div className="nkf-prog-hist-stat">
          <span className="nkf-prog-hist-stat-num">{avgDuration}m</span>
          <span className="nkf-prog-hist-stat-label">Avg Duration</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="nkf-empty-state">
          <div className="nkf-empty-icon">📅</div>
          <p>No completed sessions for this program yet.</p>
        </div>
      ) : (
        <>
          {/* Progress per exercise */}
          <div className="nkf-prog-hist-section-label">📈 Exercise Progress</div>
          <div className="nkf-prog-hist-progress">
            {program.exercises.map(exName => {
              const points = progressData[exName]
              if (!points?.length) return null
              const info = getExercise(exName)
              const isOpen = expandedProgress === exName
              const latest = points[points.length - 1]
              const first = points[0]
              const improvement = latest.best - first.best
              return (
                <div key={exName} className={`nkf-prog-hist-ex-row${isOpen ? ' open' : ''}`}>
                  <div className="nkf-prog-hist-ex-header" onClick={() => setExpandedProgress(isOpen ? null : exName)}>
                    <div className="nkf-prog-hist-ex-info">
                      <span className="nkf-prog-hist-ex-name">{exName}</span>
                      <span className="nkf-prog-hist-ex-best" style={{ color: info?.dayColor }}>Best: {latest.best}kg</span>
                    </div>
                    <div className="nkf-prog-hist-ex-right">
                      {improvement > 0 && (
                        <span className="nkf-prog-hist-improvement">+{improvement}kg</span>
                      )}
                      <span className="nkf-hist-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="nkf-prog-hist-ex-body">
                      <table className="nkf-ex-hist-table">
                        <thead><tr><th>Date</th><th>Best</th><th>Sets</th><th>Volume</th></tr></thead>
                        <tbody>
                          {[...points].reverse().map((pt, i) => {
                            const d = new Date(pt.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                            const isPR = pt.best === Math.max(...points.map(p => p.best))
                            return (
                              <tr key={i} className={isPR ? 'nkf-ex-hist-pr-row' : ''}>
                                <td>{d}</td>
                                <td>{pt.best}kg</td>
                                <td>{pt.sets}</td>
                                <td>{pt.vol.toFixed(0)}kg</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Past sessions */}
          <div className="nkf-prog-hist-section-label" style={{ marginTop: '28px' }}>📋 Past Sessions</div>
          <div className="nkf-history-view">
            {sessions.map(session => {
              const date = new Date(session.started_at)
              const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
              const duration = session.completed_at
                ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 60000) : null
              const isOpen = expandedSession === session.id
              const sets = sessionSets[session.id]
              return (
                <div key={session.id} className={`nkf-hist-session-card${isOpen ? ' open' : ''}`}>
                  <div className="nkf-hist-session-header" onClick={() => loadSets(session.id)}>
                    <div className="nkf-hist-session-info">
                      <span className="nkf-hist-session-name">{dateStr}</span>
                      {session.notes && <span className="nkf-hist-session-note">📝 {session.notes}</span>}
                    </div>
                    <div className="nkf-hist-session-meta">
                      {session.bodyweight && <span className="nkf-hist-meta-chip">⚖️ {session.bodyweight}kg</span>}
                      {duration && <span className="nkf-hist-meta-chip">⏱ {duration}min</span>}
                      <button
                        className="nkf-hist-action-btn nkf-hist-share-btn"
                        title="Share results"
                        onClick={e => { e.stopPropagation(); shareSession(session) }}
                      >↑ Share</button>
                      <button
                        className="nkf-hist-action-btn nkf-hist-delete-btn"
                        title="Delete session"
                        onClick={e => { e.stopPropagation(); if (window.confirm('Delete this workout session?')) deleteSession(session.id) }}
                      >✕</button>
                      <span className="nkf-hist-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </div>
                  </div>
                  {isOpen && sets && (
                    <div className="nkf-hist-session-body">
                      {Object.entries(sets).map(([exName, exSets]) => {
                        const info = getExercise(exName)
                        const best = Math.max(...exSets.map(s => s.weight || 0))
                        const totalVol = exSets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0)
                        return (
                          <div key={exName} className="nkf-hist-ex-block">
                            <div className="nkf-hist-ex-header">
                              <span className="nkf-hist-ex-name">{exName}</span>
                              <div className="nkf-hist-ex-stats">
                                <span style={{ color: info?.dayColor || '#aaa' }}>Best: {best}kg</span>
                                <span>Vol: {totalVol}kg</span>
                              </div>
                            </div>
                            <table className="nkf-ex-hist-table">
                              <thead><tr><th>Set</th><th>Weight</th><th>Reps</th><th>Volume</th></tr></thead>
                              <tbody>
                                {exSets.map((s, i) => (
                                  <tr key={i} className={s.weight === best && best > 0 ? 'nkf-ex-hist-pr-row' : ''}>
                                    <td>{s.set_number}</td>
                                    <td>{s.weight > 0 ? `${s.weight}kg` : '—'}</td>
                                    <td>{s.reps || '—'}</td>
                                    <td>{s.weight && s.reps ? `${(s.weight * s.reps).toFixed(0)}kg` : '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Programs View ────────────────────────────────────────────────────────────

// ─── Community Programs ───────────────────────────────────────────────────────

function CommunityPrograms({ user, onCopy }) {
  const [programs, setPrograms] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      if (!data?.length) { setLoading(false); return }
      setPrograms(data)
      const ids = [...new Set(data.map(p => p.user_id))]
      const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p.display_name || 'Nicktopian' })
      setProfiles(map)
      setLoading(false)
    }
    load()
  }, [])

  const copyProgram = async (p) => {
    if (!user?.id) return
    setCopying(p.id)
    await supabase.from('programs').insert({
      user_id: user.id,
      name: `${p.name} (copy)`,
      exercises: p.exercises,
      notes: p.notes || null,
      is_public: false,
    })
    setCopying(null)
    onCopy()
  }

  if (loading) return <div className="nkf-loading-msg">Loading community programs...</div>
  if (!programs.length) return (
    <div className="nkf-empty-state">
      <div className="nkf-empty-icon">🌐</div>
      <p>No shared programs yet. Be the first to share yours!</p>
    </div>
  )

  return (
    <div className="nkf-community-programs">
      {programs.map(p => {
        const isOpen = expandedId === p.id
        const isOwn = p.user_id === user?.id
        return (
          <div key={p.id} className={`nkf-community-card${isOpen ? ' open' : ''}`}>
            <div className="nkf-community-card-header" onClick={() => setExpandedId(isOpen ? null : p.id)}>
              <div className="nkf-community-card-info">
                <span className="nkf-community-card-name">{p.name}</span>
                <span className="nkf-community-card-author">by {profiles[p.user_id] || 'Nicktopian'} · {timeAgo(p.created_at)}</span>
              </div>
              <div className="nkf-community-card-meta">
                <span className="nkf-community-ex-count">{p.exercises.length} exercises</span>
                <span className="nkf-hist-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
            </div>

            {isOpen && (
              <div className="nkf-community-card-body">
                <div className="nkf-community-exercises">
                  {p.exercises.map((ex, i) => {
                    const info = getExercise(ex)
                    return <span key={i} className="nkf-program-ex-tag" style={{ borderColor: info?.dayColor || '#444' }}>{ex}</span>
                  })}
                </div>
                {p.notes && (
                  <div className="nkf-community-notes">
                    <span className="nkf-community-notes-label">📝 Notes</span>
                    <p className="nkf-community-notes-text">{p.notes}</p>
                  </div>
                )}
                {!isOwn && (
                  <button
                    className="nkf-copy-program-btn"
                    onClick={() => copyProgram(p)}
                    disabled={copying === p.id}
                  >
                    {copying === p.id ? 'Copying...' : '📋 Copy to My Programs'}
                  </button>
                )}
                {isOwn && <div className="nkf-community-own-badge">✓ Your program</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Workout History View ─────────────────────────────────────────────────────

function WorkoutHistoryView({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState(null)
  const [sessionSets, setSessionSets] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [sharingId, setSharingId] = useState(null)
  const [shareToast, setShareToast] = useState(null) // 'copied' | null

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false })
      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  const loadSets = async (sessionId) => {
    if (sessionSets[sessionId]) { setExpandedSession(s => s === sessionId ? null : sessionId); return }
    const { data } = await supabase
      .from('session_sets')
      .select('*')
      .eq('session_id', sessionId)
      .order('exercise_name')
      .order('set_number')
    const grouped = {}
    data?.forEach(row => {
      if (!grouped[row.exercise_name]) grouped[row.exercise_name] = []
      grouped[row.exercise_name].push(row)
    })
    setSessionSets(prev => ({ ...prev, [sessionId]: grouped }))
    setExpandedSession(s => s === sessionId ? null : sessionId)
  }

  const deleteSession = async (sessionId) => {
    setDeletingId(sessionId)
    await supabase.from('session_sets').delete().eq('session_id', sessionId)
    await supabase.from('workout_sessions').delete().eq('id', sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (expandedSession === sessionId) setExpandedSession(null)
    setDeletingId(null)
  }

  const shareSession = async (session) => {
    setSharingId(session.id)
    // Ensure sets are loaded
    let sets = sessionSets[session.id]
    if (!sets) {
      const { data } = await supabase
        .from('session_sets')
        .select('*')
        .eq('session_id', session.id)
        .order('exercise_name')
        .order('set_number')
      const grouped = {}
      data?.forEach(row => {
        if (!grouped[row.exercise_name]) grouped[row.exercise_name] = []
        grouped[row.exercise_name].push(row)
      })
      sets = grouped
      setSessionSets(prev => ({ ...prev, [session.id]: grouped }))
    }

    const date = new Date(session.started_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    const duration = session.completed_at
      ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 60000) : null

    let text = `💪 ${session.program_name || 'Workout'} — ${date}\n`
    if (session.bodyweight) text += `⚖️ Bodyweight: ${session.bodyweight}kg\n`
    if (duration) text += `⏱ Duration: ${duration}min\n`
    if (session.notes) text += `📝 ${session.notes}\n`
    text += '\n'

    Object.entries(sets).forEach(([exName, exSets]) => {
      const best = Math.max(...exSets.map(s => s.weight || 0))
      text += `${exName} (best: ${best}kg)\n`
      exSets.forEach(s => {
        text += `  Set ${s.set_number}: ${s.weight > 0 ? s.weight + 'kg' : '—'} × ${s.reps || '—'}\n`
      })
    })
    text += '\n— via Nicktopia 🏋️'

    try {
      await navigator.clipboard.writeText(text)
      setShareToast('copied')
      setTimeout(() => setShareToast(null), 2500)
    } catch {
      // Fallback: show in prompt
      prompt('Copy your results:', text)
    }
    setSharingId(null)
  }

  if (loading) return <div className="nkf-loading-msg">Loading history...</div>
  if (!sessions.length) return (
    <div className="nkf-empty-state">
      <div className="nkf-empty-icon">📅</div>
      <p>No completed workouts yet. Finish a session to see it here.</p>
    </div>
  )

  return (
    <div className="nkf-history-view">
      {shareToast === 'copied' && (
        <div className="nkf-share-toast">✓ Results copied to clipboard — paste anywhere!</div>
      )}

      {sessions.map(session => {
        const date = new Date(session.started_at)
        const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        const duration = session.completed_at
          ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 60000)
          : null
        const isOpen = expandedSession === session.id
        const sets = sessionSets[session.id]

        return (
          <div key={session.id} className={`nkf-hist-session-card${isOpen ? ' open' : ''}`}>
            <div className="nkf-hist-session-header" onClick={() => loadSets(session.id)}>
              <div className="nkf-hist-session-info">
                <span className="nkf-hist-session-name">{session.program_name || 'Workout'}</span>
                <span className="nkf-hist-session-date">{dateStr}</span>
              </div>
              <div className="nkf-hist-session-meta">
                {session.bodyweight && <span className="nkf-hist-meta-chip">⚖️ {session.bodyweight}kg</span>}
                {duration && <span className="nkf-hist-meta-chip">⏱ {duration}min</span>}
                <button
                  className="nkf-hist-action-btn nkf-hist-share-btn"
                  title="Share results"
                  disabled={sharingId === session.id}
                  onClick={e => { e.stopPropagation(); shareSession(session) }}
                >
                  {sharingId === session.id ? '...' : '↑ Share'}
                </button>
                <button
                  className="nkf-hist-action-btn nkf-hist-delete-btn"
                  title="Delete session"
                  disabled={deletingId === session.id}
                  onClick={e => { e.stopPropagation(); if (window.confirm('Delete this workout session?')) deleteSession(session.id) }}
                >
                  {deletingId === session.id ? '...' : '✕'}
                </button>
                <span className="nkf-hist-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </div>
            </div>

            {isOpen && (
              <div className="nkf-hist-session-body">
                {session.notes && (
                  <div className="nkf-hist-session-notes">📝 {session.notes}</div>
                )}
                {!sets ? (
                  <div className="nkf-loading-msg" style={{ padding: '16px 0' }}>Loading...</div>
                ) : Object.entries(sets).map(([exName, exSets]) => {
                  const info = getExercise(exName)
                  const best = Math.max(...exSets.map(s => s.weight || 0))
                  const totalVol = exSets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0)
                  return (
                    <div key={exName} className="nkf-hist-ex-block">
                      <div className="nkf-hist-ex-header">
                        <span className="nkf-hist-ex-name">{exName}</span>
                        <div className="nkf-hist-ex-stats">
                          <span style={{ color: info?.dayColor || '#aaa' }}>Best: {best}kg</span>
                          <span>Vol: {totalVol}kg</span>
                        </div>
                      </div>
                      <table className="nkf-ex-hist-table">
                        <thead>
                          <tr><th>Set</th><th>Weight</th><th>Reps</th><th>Volume</th></tr>
                        </thead>
                        <tbody>
                          {exSets.map((s, i) => (
                            <tr key={i} className={s.weight === best && best > 0 ? 'nkf-ex-hist-pr-row' : ''}>
                              <td>{s.set_number}</td>
                              <td>{s.weight > 0 ? `${s.weight}kg` : '—'}</td>
                              <td>{s.reps || '—'}</td>
                              <td>{s.weight && s.reps ? `${(s.weight * s.reps).toFixed(0)}kg` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


// ─── Programs View ────────────────────────────────────────────────────────────

function ProgramsView({ user, onTrain }) {
  const [programs, setPrograms] = useState([])
  const [building, setBuilding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('programs')
  const [viewingHistory, setViewingHistory] = useState(null) // program object
  const [editingNotes, setEditingNotes] = useState(null) // program id being edited
  const [notesInput, setNotesInput] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [togglingShare, setTogglingShare] = useState(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('programs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setPrograms(data || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  const [confirmDelete, setConfirmDelete] = useState(null) // program id pending delete

  const deleteProgram = async (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteYes = async () => {
    await supabase.from('programs').delete().eq('id', confirmDelete)
    setPrograms(p => p.filter(x => x.id !== confirmDelete))
    setConfirmDelete(null)
  }

  const saveNotes = async (id) => {
    setSavingNotes(true)
    await supabase.from('programs').update({ notes: notesInput }).eq('id', id)
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, notes: notesInput } : p))
    setEditingNotes(null)
    setSavingNotes(false)
  }

  const toggleShare = async (p) => {
    setTogglingShare(p.id)
    const newVal = !p.is_public
    await supabase.from('programs').update({ is_public: newVal }).eq('id', p.id)
    setPrograms(prev => prev.map(x => x.id === p.id ? { ...x, is_public: newVal } : x))
    setTogglingShare(null)
  }

  if (building) return <ProgramBuilder user={user} onSave={() => { setBuilding(false); load() }} onCancel={() => setBuilding(false)} />
  if (viewingHistory) return <ProgramHistory program={viewingHistory} user={user} onBack={() => setViewingHistory(null)} />

  return (
    <div className="nkf-programs-view">
      <div className="nkf-programs-top">
        <h2 className="nkf-section-title">My Programs</h2>
        {activeTab === 'programs' && (
          <button className="nkf-new-program-btn" onClick={() => setBuilding(true)}>+ New Program</button>
        )}
      </div>

      <div className="nkf-prog-tabs">
        <button className={`nkf-prog-tab${activeTab === 'programs' ? ' active' : ''}`} onClick={() => setActiveTab('programs')}>📋 My Programs</button>
        <button className={`nkf-prog-tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>📅 History</button>
        <button className={`nkf-prog-tab${activeTab === 'community' ? ' active' : ''}`} onClick={() => setActiveTab('community')}>🌐 Community</button>
      </div>

      {/* DeathStare Bruno delete confirm */}
      {confirmDelete && (
        <div className="nkf-bruno-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="nkf-bruno-popup" onClick={e => e.stopPropagation()}>
            <img src="/DeathStareBrunie-removebg-preview.png" alt="Bruno" className="nkf-bruno-img nkf-deathstare-img" />
            <div className="nkf-bruno-bubble">
              <p className="nkf-bruno-msg">
                You sure about that? 👁️👁️<br /><br />
                That program is gone forever mate. Bruno doesn't forget. Bruno doesn't forgive.
              </p>
              <div className="nkf-bruno-btns">
                <button className="nkf-bruno-btn" style={{ background: '#333', color: '#aaa', border: '1px solid #444' }} onClick={() => setConfirmDelete(null)}>Actually no</button>
                <button className="nkf-bruno-btn" onClick={confirmDeleteYes}>Delete it</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' ? (
        <WorkoutHistoryView user={user} />
      ) : activeTab === 'community' ? (
        <CommunityPrograms user={user} onCopy={() => { setActiveTab('programs'); load() }} />
      ) : loading ? (
        <div className="nkf-loading-msg">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="nkf-empty-state">
          <div className="nkf-empty-icon">📋</div>
          <p>No programs yet. Create one to start tracking your workouts.</p>
          <button className="nkf-new-program-btn" style={{ marginTop: '16px' }} onClick={() => setBuilding(true)}>Create Your First Program</button>
        </div>
      ) : (
        <div className="nkf-programs-grid">
          {programs.map(p => (
            <div key={p.id} className="nkf-program-card">
              <div className="nkf-program-card-header">
                <span className="nkf-program-card-name">{p.name}</span>
                <button className="nkf-program-delete-btn" onClick={() => deleteProgram(p.id)}>✕</button>
              </div>
              <div className="nkf-program-card-exercises">
                {p.exercises.slice(0, 5).map((ex, i) => {
                  const info = getExercise(ex)
                  return <span key={i} className="nkf-program-ex-tag" style={{ borderColor: info?.dayColor || '#444' }}>{ex}</span>
                })}
                {p.exercises.length > 5 && <span className="nkf-program-ex-more">+{p.exercises.length - 5} more</span>}
              </div>
              {/* Notes section */}
              {editingNotes === p.id ? (
                <div className="nkf-program-notes-edit">
                  <textarea
                    className="nkf-program-notes-input"
                    placeholder="Add notes, goals, or anything about this program..."
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    rows={3}
                  />
                  <div className="nkf-program-notes-btns">
                    <button className="nkf-notes-save-btn" onClick={() => saveNotes(p.id)} disabled={savingNotes}>
                      {savingNotes ? 'Saving...' : 'Save'}
                    </button>
                    <button className="nkf-notes-cancel-btn" onClick={() => setEditingNotes(null)}>Cancel</button>
                  </div>
                </div>
              ) : p.notes ? (
                <div className="nkf-program-notes-display" onClick={() => { setEditingNotes(p.id); setNotesInput(p.notes) }}>
                  <span className="nkf-program-notes-label">📝</span>
                  <span className="nkf-program-notes-text">{p.notes}</span>
                </div>
              ) : null}

              <div className="nkf-program-card-footer">
                <div className="nkf-program-card-actions">
                  <button
                    className="nkf-program-notes-btn"
                    onClick={() => { setEditingNotes(p.id); setNotesInput(p.notes || '') }}
                    title="Add notes"
                  >📝</button>
                  <button
                    className={`nkf-program-share-btn${p.is_public ? ' shared' : ''}`}
                    onClick={() => toggleShare(p)}
                    disabled={togglingShare === p.id}
                    title={p.is_public ? 'Shared publicly — click to unshare' : 'Share to community'}
                  >
                    {p.is_public ? '🌐 Shared' : '↑ Share'}
                  </button>
                </div>
                <div className="nkf-card-right-btns">
                  <button className="nkf-hist-btn" onClick={() => setViewingHistory(p)}>📊 History</button>
                  <button className="nkf-train-btn" onClick={() => onTrain(p)}>▶ Train This</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Post Workout Note ────────────────────────────────────────────────────────

function PostWorkoutNote({ sessionId }) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!note.trim() || !sessionId) return
    setSaving(true)
    await supabase.from('workout_sessions').update({ notes: note.trim() }).eq('id', sessionId)
    setSaved(true)
    setSaving(false)
  }

  if (saved) return (
    <div className="nkf-postnote-saved">✓ Note saved</div>
  )

  return (
    <div className="nkf-postnote">
      <div className="nkf-postnote-label">📝 Session Notes <span>(optional)</span></div>
      <textarea
        className="nkf-postnote-input"
        placeholder="How did it feel? Any PRs? Things to improve next time..."
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
      />
      <button className="nkf-postnote-btn" onClick={save} disabled={saving || !note.trim()}>
        {saving ? 'Saving...' : 'Save Note'}
      </button>
    </div>
  )
}

// ─── Workout Tracker ──────────────────────────────────────────────────────────

function WorkoutTracker({ program, user, onComplete, savedState }) {
  const [phase, setPhase] = useState(savedState?.phase || 'bodyweight')
  const [bodyweight, setBodyweight] = useState(savedState?.bodyweight || '')
  const [currentIdx, setCurrentIdx] = useState(savedState?.currentIdx || 0)
  const [allSets, setAllSets] = useState(savedState?.allSets || {})
  const [history, setHistory] = useState({})
  const [sessionId, setSessionId] = useState(savedState?.sessionId || null)
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const exercises = program.exercises
  const currentExName = exercises[currentIdx]
  const currentEx = getExercise(currentExName)
  const currentSets = allSets[currentExName] || []

  // Always keep a ref to latest state so beforeunload never has stale closure
  const stateRef = useRef({})
  useEffect(() => {
    stateRef.current = { program, phase, currentIdx, allSets, bodyweight, sessionId }
  })

  // Save to localStorage on every meaningful change during training
  useEffect(() => {
    if (phase !== 'training') return
    const state = { program, phase, currentIdx, allSets, bodyweight, sessionId }
    localStorage.setItem(`nickfit_session_${user.id}`, JSON.stringify(state))
  }, [phase, currentIdx, allSets, sessionId])

  // Also save on beforeunload as a last resort
  useEffect(() => {
    const handleUnload = () => {
      const s = stateRef.current
      if (s.phase !== 'training') return
      localStorage.setItem(`nickfit_session_${user.id}`, JSON.stringify(s))
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [user.id])

  // Clear saved session when workout completes
  const clearSaved = () => localStorage.removeItem(`nickfit_session_${user.id}`)

  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase
        .from('session_sets')
        .select('exercise_name, weight, reps, set_number, session_id, created_at')
        .eq('user_id', user.id)
        .in('exercise_name', exercises)
        .order('created_at', { ascending: false })
      if (!data?.length) return
      const hist = {}
      exercises.forEach(exName => {
        const exSets = data.filter(s => s.exercise_name === exName)
        if (!exSets.length) return
        const lastSessionId = exSets[0].session_id
        hist[exName] = exSets.filter(s => s.session_id === lastSessionId).sort((a, b) => a.set_number - b.set_number)
      })
      setHistory(hist)
      // Prefill first exercise on history load
      const firstEx = exercises[0]
      const firstPrefill_sets = hist[firstEx] || []
      if (firstPrefill_sets.length > 0) {
        setWeightInput(String(firstPrefill_sets[0].weight || ''))
        setRepsInput(String(firstPrefill_sets[0].reps || ''))
      }
    }
    loadHistory()
  }, [exercises, user.id])

  const startSession = async () => {
    if (!bodyweight) return
    const { data } = await supabase
      .from('workout_sessions')
      .insert({ user_id: user.id, program_id: program.id, program_name: program.name, bodyweight: parseFloat(bodyweight) })
      .select().single()
    setSessionId(data.id)
    // Prefill first exercise from last session
    const firstExName = exercises[0]
    const firstHist = {}
    // We'll set inputs after history loads — use empty for now, useEffect will handle
    setPhase('training')
  }

  const [showFunnyBruno, setShowFunnyBruno] = useState(false)
  const [prMessage, setPrMessage] = useState('')

  const PR_MSGS = [
    "WAIT. IS THAT A PR?? Bruno is losing his mind right now 🤯",
    "NEW PR DETECTED. Bruno just knocked over his water bottle in excitement.",
    "That's a personal record!! Bruno is literally sprinting around the room.",
    "PR ALERT 🚨 Bruno saw that and immediately texted the group chat.",
  ]

  const addSet = () => {
    if (!weightInput && !repsInput) return
    const set = { weight: parseFloat(weightInput) || 0, reps: parseInt(repsInput) || 0 }
    // Check if this is a PR (beats last session best)
    const lastBest = (history[currentExName] || []).reduce((max, s) => Math.max(max, s.weight || 0), 0)
    const currentBest = (allSets[currentExName] || []).reduce((max, s) => Math.max(max, s.weight || 0), 0)
    if (set.weight > 0 && lastBest > 0 && set.weight > lastBest && set.weight > currentBest) {
      setPrMessage(PR_MSGS[Math.floor(Math.random() * PR_MSGS.length)])
      setShowFunnyBruno(true)
      setTimeout(() => setShowFunnyBruno(false), 3500)
    }
    setAllSets(prev => {
      const updated = { ...prev, [currentExName]: [...(prev[currentExName] || []), set] }
      setWeightInput(String(set.weight || ''))
      setRepsInput(String(set.reps || ''))
      return updated
    })
  }

  // When exercise changes, pre-fill from last session's set 1
  const getPrefilledInputs = (exName, currentSetsForEx, hist) => {
    const lastSets = hist[exName] || []
    const setIndex = currentSetsForEx.length // 0-based index of the NEXT set to be added
    if (setIndex === 0) {
      // Set 1: prefill from last session's set 1
      const lastSet1 = lastSets[0]
      return { w: lastSet1 ? String(lastSet1.weight || '') : '', r: lastSet1 ? String(lastSet1.reps || '') : '' }
    } else {
      // Set 2+: prefill from the CURRENT workout's last set
      const prevSet = currentSetsForEx[setIndex - 1]
      return { w: prevSet ? String(prevSet.weight || '') : '', r: prevSet ? String(prevSet.reps || '') : '' }
    }
  }

  const [showSickBruno, setShowSickBruno] = useState(false)

  const removeSet = (exName, idx) => {
    setAllSets(prev => ({ ...prev, [exName]: prev[exName].filter((_, i) => i !== idx) }))
    setShowSickBruno(true)
    setTimeout(() => setShowSickBruno(false), 2800)
  }

  const nextExercise = async () => {
    if (currentSets.length > 0 && sessionId) {
      const rows = currentSets.map((s, i) => ({
        session_id: sessionId, user_id: user.id, exercise_name: currentExName,
        set_number: i + 1, weight: s.weight, reps: s.reps,
      }))
      await supabase.from('session_sets').insert(rows)
    }
    setShowTips(false); setShowVideo(false); setShowComments(false)
    if (currentIdx < exercises.length - 1) {
      const nextExName = exercises[currentIdx + 1]
      const nextPrefill = getPrefilledInputs(nextExName, allSets[nextExName] || [], history)
      setWeightInput(nextPrefill.w); setRepsInput(nextPrefill.r)
      setCurrentIdx(i => i + 1)
    } else {
      if (sessionId) await supabase.from('workout_sessions').update({ completed_at: new Date().toISOString() }).eq('id', sessionId)
      clearSaved()
      setPhase('done')
    }
  }

  const totalSets = Object.values(allSets).reduce((s, sets) => s + sets.length, 0)

  // Bodyweight entry
  if (phase === 'bodyweight') {
    return (
      <div className="nkf-tracker-phase nkf-bw-phase">
        <div className="nkf-tracker-header">
          <button className="nkf-back-btn" onClick={onComplete}>← Back</button>
        </div>
        <div className="nkf-bw-card">
          <div className="nkf-bw-icon">⚖️</div>
          <h2 className="nkf-bw-title">Starting <span>{program.name}</span></h2>
          <p className="nkf-bw-subtitle">What's your bodyweight today?</p>
          <div className="nkf-bw-input-row">
            <input className="nkf-bw-input" type="number" placeholder="e.g. 82" value={bodyweight}
              onChange={e => setBodyweight(e.target.value)} onKeyDown={e => e.key === 'Enter' && startSession()} autoFocus />
            <span className="nkf-bw-unit">kg</span>
          </div>
          <div className="nkf-bw-exercises">
            {exercises.map((ex, i) => {
              const info = getExercise(ex)
              return <span key={i} className="nkf-bw-ex-chip" style={{ borderColor: info?.dayColor || '#444' }}>{ex}</span>
            })}
          </div>
          <button className="nkf-start-btn" onClick={startSession} disabled={!bodyweight}>Start Workout →</button>
        </div>
      </div>
    )
  }

  // Done
  if (phase === 'done') {
    const exercisesDone = Object.keys(allSets).filter(k => allSets[k].length > 0)
    const BRUNO_QUIPS = [
      "Just finished his set too. He's in the pool cooling down and definitely not just floating around doing nothing.",
      "Nailed every rep. Now he's in the pool recovering like the professional athlete he absolutely is.",
      "Did the whole program without checking his phone once. Currently celebrating in the pool, pool noodle in hand.",
      "Spotted you the whole way. Now he's doing laps to cool down — well, one lap. Very slowly.",
    ]
    const quip = BRUNO_QUIPS[Math.floor(Math.random() * BRUNO_QUIPS.length)]
    return (
      <div className="nkf-tracker-phase nkf-done-phase">
        <div className="nkf-done-card">
          <div className="nkf-pool-bruno-section">
            <img src="/PoolBrunie.png" alt="Pool Bruno" className="nkf-pool-bruno" />
            <div className="nkf-pool-bruno-text">
              <p className="nkf-bruno-congrats-title">WORKOUT COMPLETE! 💪</p>
              <p className="nkf-pool-program-name">{program.name}</p>
              <p className="nkf-bruno-congrats-quip">Bruno {quip}</p>
            </div>
          </div>
          <div className="nkf-done-stats">
            <div className="nkf-done-stat"><span className="nkf-done-stat-num">{totalSets}</span><span>Total Sets</span></div>
            <div className="nkf-done-stat"><span className="nkf-done-stat-num">{exercisesDone.length}</span><span>Exercises</span></div>
            <div className="nkf-done-stat"><span className="nkf-done-stat-num">{bodyweight}kg</span><span>Bodyweight</span></div>
          </div>
          <div className="nkf-done-summary">
            {exercisesDone.map(exName => (
              <div key={exName} className="nkf-done-ex">
                <span className="nkf-done-ex-name">{exName}</span>
                <div className="nkf-done-ex-sets">
                  {allSets[exName].map((s, i) => <span key={i} className="nkf-done-set-chip">{s.weight}kg × {s.reps}</span>)}
                </div>
              </div>
            ))}
          </div>
          <PostWorkoutNote sessionId={sessionId} />
          <button className="nkf-start-btn" onClick={onComplete}>← Back to Programs</button>
        </div>
      </div>
    )
  }

  // Active training
  const lastSets = history[currentExName] || []
  const lastMax = lastSets.length ? Math.max(...lastSets.map(s => s.weight)) : null

  return (
    <div className="nkf-tracker-phase nkf-training-phase">
      {showSickBruno && (
        <div className="nkf-sick-bruno-toast">
          <img src="/SickBrunie-removebg-preview.png" alt="Sick Bruno" className="nkf-sick-bruno-img" />
          <span>Bro deleted a set? Are you dying?? 🤢</span>
        </div>
      )}
      {showFunnyBruno && (
        <div className="nkf-funny-bruno-toast">
          <img src="/Funnybrunie-removebg-preview.png" alt="Funny Bruno" className="nkf-funny-bruno-img" />
          <span>{prMessage}</span>
        </div>
      )}
      <div className="nkf-progress-bar">
        <div className="nkf-progress-fill" style={{ width: `${((currentIdx + 1) / exercises.length) * 100}%`, background: currentEx?.dayColor || '#fff' }} />
      </div>
      <div className="nkf-progress-label">{currentIdx + 1} / {exercises.length} — {program.name}</div>

      <div className="nkf-training-layout">
        {/* Main panel */}
        <div className="nkf-training-main">
          <div className="nkf-training-ex-header" style={{ borderLeftColor: currentEx?.dayColor || '#444' }}>
            <div>
              <div className="nkf-training-ex-name">{currentExName}</div>
              <div className="nkf-training-ex-muscle" style={{ color: currentEx?.dayColor }}>{currentEx?.primaryMuscle}</div>
            </div>
            <div className="nkf-training-ex-toggles">
              {lastMax != null && <div className="nkf-training-last-max">Last best: <strong>{lastMax}kg</strong></div>}
              <button
                className={`nkf-toggle-btn${showVideo ? ' active' : ''}`}
                style={showVideo ? { borderColor: currentEx?.dayColor, color: currentEx?.dayColor } : {}}
                onClick={() => { setShowVideo(v => !v); setShowTips(false); setShowComments(false) }}
              >▶ Video</button>
              <button
                className={`nkf-toggle-btn${showTips ? ' active' : ''}`}
                style={showTips ? { borderColor: currentEx?.dayColor, color: currentEx?.dayColor } : {}}
                onClick={() => { setShowTips(t => !t); setShowVideo(false); setShowComments(false) }}
              >📋 Tips</button>
              <button
                className={`nkf-toggle-btn${showComments ? ' active' : ''}`}
                style={showComments ? { borderColor: currentEx?.dayColor, color: currentEx?.dayColor } : {}}
                onClick={() => { setShowComments(c => !c); setShowVideo(false); setShowTips(false) }}
              >💬 Chat</button>
            </div>
          </div>

          {/* Video panel */}
          {showVideo && currentEx && (
            <div className="nkf-training-media">
              <div className="nkf-video-wrap">
                <iframe
                  src={`https://www.youtube.com/embed/${currentEx.videoId}`}
                  title={currentExName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={currentEx.isShort ? 'nkf-video-short' : 'nkf-video-wide'}
                />
              </div>
            </div>
          )}

          {/* Tips panel */}
          {showTips && currentEx && (
            <div className="nkf-training-media">
              <div className="nkf-notes-label">Form Cues</div>
              <ul className="nkf-notes-list">
                {currentEx.notes.map((note, i) => (
                  <li key={i} className="nkf-note-item">
                    <span className="nkf-note-dot" style={{ background: currentEx.dayColor }} />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Live chat panel */}
          {showComments && (
            <div className="nkf-training-media nkf-training-chat">
              <div className="nkf-training-chat-label">
                💬 <span>Live Chat</span>
                <span className="nkf-training-chat-sub">Others training this exercise right now can see this</span>
              </div>
              <ExerciseComments exerciseName={currentExName} user={user} />
            </div>
          )}

          <div className="nkf-set-logger">
            <div className="nkf-set-inputs">
              <div className="nkf-set-input-group">
                <label>Weight (kg)</label>
                <input type="number" className="nkf-set-input" value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="0" />
              </div>
              <div className="nkf-set-input-group">
                <label>Reps</label>
                <input type="number" className="nkf-set-input" value={repsInput} onChange={e => setRepsInput(e.target.value)} placeholder="0"
                  onKeyDown={e => e.key === 'Enter' && addSet()} />
              </div>
              <button className="nkf-add-set-btn" onClick={addSet} style={{ background: currentEx?.dayColor || '#fff' }}>+ Set</button>
            </div>

            {currentSets.length > 0 && (
              <div className="nkf-current-sets">
                <div className="nkf-sets-label">Today's Sets</div>
                <div className="nkf-sets-row">
                  {currentSets.map((s, i) => (
                    <div key={i} className="nkf-set-chip" style={{ borderColor: currentEx?.dayColor || '#fff' }}>
                      <span className="nkf-set-chip-num">Set {i + 1}</span>
                      <span className="nkf-set-chip-val">{s.weight}kg × {s.reps}</span>
                      <button className="nkf-set-chip-remove" onClick={() => removeSet(currentExName, i)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="nkf-nav-btns">
            {currentIdx > 0 && (
              <button className="nkf-prev-btn" onClick={() => { setCurrentIdx(i => i - 1); setWeightInput(''); setRepsInput(''); setShowTips(false); setShowVideo(false) }}>← Prev</button>
            )}
            <button className="nkf-next-btn" onClick={nextExercise} style={{ background: currentEx?.dayColor || '#fff' }}>
              {currentIdx === exercises.length - 1 ? '🏁 Finish Workout' : 'Next →'}
            </button>
          </div>
        </div>

        {/* History sidebar */}
        <div className="nkf-history-panel">
          <div className="nkf-history-title">📋 Last Session</div>
          {lastSets.length === 0 ? (
            <div className="nkf-history-empty">No history yet</div>
          ) : (
            <>
              {lastSets.map((s, i) => (
                <div key={i} className="nkf-history-set">
                  <span className="nkf-history-set-num">Set {s.set_number}</span>
                  <span className="nkf-history-set-val">{fmt(s.weight)}kg × {fmt(s.reps)}</span>
                </div>
              ))}
              <div className="nkf-history-max" style={{ color: currentEx?.dayColor }}>Best: {lastMax}kg</div>
            </>
          )}

          <div className="nkf-history-title" style={{ marginTop: '24px' }}>📍 Queue</div>
          {exercises.map((ex, i) => (
            <div key={i} className={`nkf-queue-item${i === currentIdx ? ' current' : ''}${i < currentIdx ? ' done' : ''}`}
              style={i === currentIdx ? { borderColor: currentEx?.dayColor } : {}}>
              <span className="nkf-queue-num">{i + 1}</span>
              <span className="nkf-queue-name">{ex}</span>
              {i < currentIdx && <span className="nkf-queue-check">✓</span>}
              {i === currentIdx && <span className="nkf-queue-arrow" style={{ color: currentEx?.dayColor }}>◀</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

// ─── PR Comments ─────────────────────────────────────────────────────────────

function PRComments({ exerciseName, user }) {
  const [comments, setComments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('pr_comments')
      .select('*')
      .eq('exercise_name', exerciseName)
      .order('created_at', { ascending: false })
    if (!data) { setLoading(false); return }
    setComments(data)
    const ids = [...new Set(data.map(c => c.user_id))]
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p.display_name || 'Nicktopian' })
      setProfiles(map)
    }
    setLoading(false)
  }, [exerciseName])

  useEffect(() => { load() }, [load])

  const post = async () => {
    if (!text.trim() || !user?.id) return
    setPosting(true)
    await supabase.from('pr_comments').insert({ user_id: user.id, exercise_name: exerciseName, comment: text.trim() })
    setText('')
    await load()
    setPosting(false)
  }

  const remove = async (id) => {
    await supabase.from('pr_comments').delete().eq('id', id)
    setComments(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="nkf-pr-comments">
      {user && (
        <div className="nkf-comment-input-row">
          <input
            className="nkf-comment-input"
            placeholder="Hype someone up, trash talk, or call BS on a PR..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && post()}
          />
          <button className="nkf-comment-post-btn" onClick={post} disabled={posting || !text.trim()}>
            {posting ? '...' : 'Post'}
          </button>
        </div>
      )}
      {loading ? (
        <div className="nkf-comments-loading">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="nkf-comments-empty">No hype yet. Be the first!</div>
      ) : (
        <div className="nkf-pr-comments-list">
          {comments.map(c => (
            <div key={c.id} className="nkf-pr-comment-item">
              <div className="nkf-comment-meta">
                <span className="nkf-comment-name">{profiles[c.user_id] || 'Nicktopian'}</span>
                <span className="nkf-comment-time">{timeAgo(c.created_at)}</span>
                {c.user_id === user?.id && (
                  <button className="nkf-comment-delete" onClick={() => remove(c.id)}>✕</button>
                )}
              </div>
              <div className="nkf-comment-text">{c.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardView({ user }) {
  const [activeTab, setActiveTab] = useState('recent') // 'recent' | 'PUSH' | 'PULL' | 'LEGS'
  const [allPRs, setAllPRs] = useState({}) // { exerciseName: [{user_id, weight, reps, created_at}] }
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('session_sets')
        .select('user_id, exercise_name, weight, reps, created_at')
        .order('weight', { ascending: false })
      if (!data?.length) { setLoading(false); return }

      // Build PR map: per exercise, per user — keep only their best
      const prMap = {} // { exerciseName: { userId: bestRow } }
      data.forEach(row => {
        if (!prMap[row.exercise_name]) prMap[row.exercise_name] = {}
        const existing = prMap[row.exercise_name][row.user_id]
        if (!existing || row.weight > existing.weight) prMap[row.exercise_name][row.user_id] = row
      })

      // Sort each exercise's leaderboard by weight desc
      const result = {}
      Object.entries(prMap).forEach(([exName, userMap]) => {
        result[exName] = Object.values(userMap).sort((a, b) => b.weight - a.weight)
      })
      setAllPRs(result)

      // Load all profiles
      const ids = [...new Set(data.map(r => r.user_id))]
      const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', ids)
      const map = {}
      profs?.forEach(p => { map[p.id] = p.display_name || 'Nicktopian' })
      setProfiles(map)
      setLoading(false)
    }
    load()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  // Recent PRs: latest entry across ALL exercises (1 per exercise, most recent)
  const recentPRs = Object.entries(allPRs)
    .map(([exName, board]) => {
      const latest = [...board].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      return { exName, ...latest }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15)

  const [openComments, setOpenComments] = useState(null) // exercise name with comments open

  const renderBoard = (exName, board) => {
    const ex = getExercise(exName)
    const commentsOpen = openComments === exName
    return (
      <div key={exName} className="nkf-lb-ex-block">
        <div className="nkf-lb-ex-name" style={{ borderLeftColor: ex?.dayColor || '#444' }}>
          {exName}
          <span className="nkf-lb-ex-muscle" style={{ color: ex?.dayColor }}>{ex?.primaryMuscle}</span>
        </div>
        <div className="nkf-board">
          {board.slice(0, 5).map((entry, i) => (
            <div key={entry.user_id} className={`nkf-board-row${i === 0 ? ' podium' : ''}`}
              style={i === 0 ? { borderColor: ex?.dayColor, background: `${ex?.dayColor}10` } : {}}>
              <span className="nkf-board-rank">{medals[i] || `#${i + 1}`}</span>
              <span className="nkf-board-name">{profiles[entry.user_id] || 'Nicktopian'}</span>
              <div className="nkf-board-right">
                <span className="nkf-board-weight" style={{ color: i === 0 ? ex?.dayColor : undefined }}>{entry.weight}kg</span>
                <span className="nkf-board-reps">× {entry.reps}</span>
                <span className="nkf-board-date">{timeAgo(entry.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          className={`nkf-lb-comments-btn${commentsOpen ? ' open' : ''}`}
          style={commentsOpen ? { borderColor: ex?.dayColor, color: ex?.dayColor } : {}}
          onClick={() => setOpenComments(commentsOpen ? null : exName)}
        >
          💬 {commentsOpen ? 'Hide Comments' : 'Comments'}
        </button>
        {commentsOpen && <PRComments exerciseName={exName} user={user} />}
      </div>
    )
  }

  const TABS = [
    { id: 'recent', label: '🕐 Recent' },
    { id: 'PUSH', label: '🔺 Push' },
    { id: 'PULL', label: '🔻 Pull' },
    { id: 'LEGS', label: '⚡ Legs' },
  ]

  return (
    <div className="nkf-leaderboard-view">
      <h2 className="nkf-section-title">🏆 PR Leaderboard</h2>
      <p className="nkf-section-sub">Heaviest weight ever logged per exercise, across all Nicktopians.</p>

      <div className="nkf-prog-tabs" style={{ marginBottom: '24px' }}>
        {TABS.map(t => (
          <button key={t.id} className={`nkf-prog-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="nkf-loading-msg">Loading leaderboard...</div>
      ) : activeTab === 'recent' ? (
        <>
          <div className="nkf-lb-recent-label">Most recently set PRs across all exercises</div>
          <div className="nkf-board">
            {recentPRs.length === 0 ? (
              <div className="nkf-empty-state"><div className="nkf-empty-icon">🏋️</div><p>No PRs logged yet!</p></div>
            ) : recentPRs.map((entry, i) => {
              const ex = getExercise(entry.exName)
              return (
                <div key={`${entry.exName}-${entry.user_id}`} className="nkf-board-row nkf-recent-row">
                  <div className="nkf-recent-ex-info">
                    <span className="nkf-recent-ex-name">{entry.exName}</span>
                    <span className="nkf-recent-ex-muscle" style={{ color: ex?.dayColor }}>{ex?.primaryMuscle}</span>
                  </div>
                  <span className="nkf-board-name">{profiles[entry.user_id] || 'Nicktopian'}</span>
                  <div className="nkf-board-right">
                    <span className="nkf-board-weight" style={{ color: ex?.dayColor }}>{entry.weight}kg</span>
                    <span className="nkf-board-reps">× {entry.reps}</span>
                    <span className="nkf-board-date">{timeAgo(entry.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="nkf-lb-category">
          {EXERCISES[activeTab]?.sections.map(sec =>
            sec.exercises.map(ex => {
              const board = allPRs[ex.name]
              if (!board?.length) return null
              return renderBoard(ex.name, board)
            })
          )}
          {EXERCISES[activeTab]?.sections.every(sec => sec.exercises.every(ex => !allPRs[ex.name]?.length)) && (
            <div className="nkf-empty-state">
              <div className="nkf-empty-icon">🏋️</div>
              <p>No PRs logged for {activeTab} exercises yet. Get training!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Nickfit({ user }) {
  const [view, setView] = useState('library')
  const [activeDay, setActiveDay] = useState('PUSH')
  const [trainingProgram, setTrainingProgram] = useState(null)
  const [savedSession, setSavedSession] = useState(null)
  const [showResume, setShowResume] = useState(false)

  // Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(`nickfit_session_${user?.id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.program && parsed?.phase === 'training') {
          setSavedSession(parsed)
          setShowResume(true)
        }
      } catch { localStorage.removeItem(`nickfit_session_${user?.id}`) }
    }
  }, [user?.id])

  const resumeSession = () => {
    setTrainingProgram(savedSession.program)
    setView('train')
    setShowResume(false)
    // Don't clear savedSession yet — WorkoutTracker needs it to restore state
  }

  const dismissResume = () => {
    localStorage.removeItem(`nickfit_session_${user?.id}`)
    setSavedSession(null)
    setShowResume(false)
  }

  const handleTrain = (program) => {
    setTrainingProgram(program)
    setView('programs')
  }

  const day = EXERCISES[activeDay]

  const NAV = [
    { id: 'library', label: '📚 Library' },
    { id: 'programs', label: '📋 Programs' },
    { id: 'leaderboard', label: '🏆 Leaderboard' },
  ]

  return (
    <div className="nickfit">
      {/* Sleeping Bruno resume prompt */}
      {showResume && savedSession && (
        <div className="nkf-bruno-overlay" onClick={dismissResume}>
          <div className="nkf-bruno-popup" onClick={e => e.stopPropagation()}>
            <img src="/Sleepig_Bruno-removebg-preview.png" alt="Sleeping Bruno" className="nkf-bruno-img" />
            <div className="nkf-bruno-bubble">
              <p className="nkf-bruno-msg">
                zzz... oh! You're back 👀<br />
                I've been here this whole time guarding your <strong>{savedSession.program.name}</strong> session.<br /><br />
                You ghosted your workout harder than your ex ghosted you. Wanna finish what you started?
              </p>
              <div className="nkf-bruno-btns">
                <button className="nkf-bruno-btn" onClick={resumeSession}>Let's go 💪</button>
                <button className="nkf-bruno-btn-secondary" onClick={dismissResume}>Nah I quit</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="nkf-header">
        <div className="nkf-header-bg" />
        <div className="nkf-header-content">
          <div className="nkf-header-eyebrow">NICKTOPIA FITNESS</div>
          <h1 className="nkf-title">NICKFIT 💪</h1>
          <p className="nkf-subtitle">Nick's Personal Training Hub</p>
        </div>
      </div>

      <div className="nkf-main-nav">
        {NAV.map(n => (
          <button key={n.id} className={`nkf-main-nav-btn${view === n.id ? ' active' : ''}`} onClick={() => setView(n.id)}>
            {n.label}
          </button>
        ))}
      </div>

      <div className="nkf-content">
        {view === 'library' && (
          <div className="nkf-library-view">
            <div className="nkf-day-nav">
              {Object.entries(EXERCISES).map(([key, val]) => (
                <button key={key}
                  className={`nkf-day-btn${activeDay === key ? ' active' : ''}`}
                  style={activeDay === key ? { background: val.color, borderColor: val.color, color: '#000' } : { borderColor: val.color, color: val.color }}
                  onClick={() => setActiveDay(key)}>
                  <span>{val.icon}</span><span>{val.label}</span>
                </button>
              ))}
            </div>
            <div className="nkf-day-title-row">
              <div className="nkf-day-accent" style={{ background: day.color }} />
              <h2 className="nkf-day-title" style={{ color: day.color }}>{day.label} DAY</h2>
              {activeDay === 'LEGS' && (
                <div className="nkf-legs-bruno-wrap">
                  <img src="/BrunoButt.png" alt="Bruno Legs Day" className="nkf-legs-bruno" />
                  <span className="nkf-legs-bruno-caption">Leg day. Bruno's favourite. Apparently.</span>
                </div>
              )}
            </div>
            {day.sections.map(section => (
              <div key={section.muscle} className="nkf-muscle-section">
                <div className="nkf-muscle-header">
                  <div className="nkf-muscle-line" style={{ background: day.color }} />
                  <span className="nkf-muscle-label">{section.muscle.toUpperCase()}</span>
                  <div className="nkf-muscle-line" style={{ background: day.color }} />
                </div>
                <div className="nkf-exercises">
                  {section.exercises.map(ex => <ExerciseCard key={ex.name} exercise={ex} accentColor={day.color} user={user} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'programs' && !trainingProgram && <ProgramsView user={user} onTrain={handleTrain} />}
        {view === 'programs' && trainingProgram && (
          <WorkoutTracker
            program={trainingProgram}
            user={user}
            savedState={savedSession?.program?.id === trainingProgram?.id ? savedSession : null}
            onComplete={() => { setTrainingProgram(null); setSavedSession(null); setView('programs') }}
          />
        )}

        {view === 'leaderboard' && <LeaderboardView user={user} />}
      </div>
    </div>
  )
}