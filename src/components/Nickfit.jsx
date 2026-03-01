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

// ─── Programs View ────────────────────────────────────────────────────────────

function ProgramsView({ user, onTrain }) {
  const [programs, setPrograms] = useState([])
  const [building, setBuilding] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('programs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setPrograms(data || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  const deleteProgram = async (id) => {
    if (!confirm('Delete this program?')) return
    await supabase.from('programs').delete().eq('id', id)
    setPrograms(p => p.filter(x => x.id !== id))
  }

  if (building) return <ProgramBuilder user={user} onSave={() => { setBuilding(false); load() }} onCancel={() => setBuilding(false)} />

  return (
    <div className="nkf-programs-view">
      <div className="nkf-programs-top">
        <h2 className="nkf-section-title">My Programs</h2>
        <button className="nkf-new-program-btn" onClick={() => setBuilding(true)}>+ New Program</button>
      </div>
      {loading ? (
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
              <div className="nkf-program-card-footer">
                <span className="nkf-program-ex-count">{p.exercises.length} exercises</span>
                <button className="nkf-train-btn" onClick={() => onTrain(p)}>▶ Train This</button>
              </div>
            </div>
          ))}
        </div>
      )}
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
    setPhase('training')
  }

  const addSet = () => {
    if (!weightInput && !repsInput) return
    const set = { weight: parseFloat(weightInput) || 0, reps: parseInt(repsInput) || 0 }
    setAllSets(prev => ({ ...prev, [currentExName]: [...(prev[currentExName] || []), set] }))
    setRepsInput('')
  }

  const removeSet = (exName, idx) => {
    setAllSets(prev => ({ ...prev, [exName]: prev[exName].filter((_, i) => i !== idx) }))
  }

  const nextExercise = async () => {
    if (currentSets.length > 0 && sessionId) {
      const rows = currentSets.map((s, i) => ({
        session_id: sessionId, user_id: user.id, exercise_name: currentExName,
        set_number: i + 1, weight: s.weight, reps: s.reps,
      }))
      await supabase.from('session_sets').insert(rows)
    }
    setWeightInput(''); setRepsInput(''); setShowTips(false); setShowVideo(false)
    if (currentIdx < exercises.length - 1) {
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
    return (
      <div className="nkf-tracker-phase nkf-done-phase">
        <div className="nkf-done-card">
          <div className="nkf-done-icon">🏆</div>
          <h2 className="nkf-done-title">Workout Complete!</h2>
          <p className="nkf-done-subtitle">{program.name}</p>
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
                onClick={() => { setShowVideo(v => !v); setShowTips(false) }}
              >▶ Video</button>
              <button
                className={`nkf-toggle-btn${showTips ? ' active' : ''}`}
                style={showTips ? { borderColor: currentEx?.dayColor, color: currentEx?.dayColor } : {}}
                onClick={() => { setShowTips(t => !t); setShowVideo(false) }}
              >📋 Tips</button>
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

function LeaderboardView() {
  const [selectedEx, setSelectedEx] = useState(ALL_EXERCISES[0]?.name || '')
  const [board, setBoard] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!selectedEx) return
    setLoading(true)
    const { data } = await supabase
      .from('session_sets')
      .select('user_id, weight, reps, created_at')
      .eq('exercise_name', selectedEx)
      .order('weight', { ascending: false })
    if (!data?.length) { setBoard([]); setLoading(false); return }
    const prMap = {}
    data.forEach(row => {
      if (!prMap[row.user_id] || row.weight > prMap[row.user_id].weight) prMap[row.user_id] = row
    })
    const sorted = Object.values(prMap).sort((a, b) => b.weight - a.weight)
    setBoard(sorted)
    const ids = sorted.map(s => s.user_id)
    const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', ids)
    const map = {}
    profs?.forEach(p => { map[p.id] = p.display_name || 'Nicktopian' })
    setProfiles(map)
    setLoading(false)
  }, [selectedEx])

  useEffect(() => { load() }, [load])

  const ex = getExercise(selectedEx)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="nkf-leaderboard-view">
      <h2 className="nkf-section-title">🏆 PR Leaderboard</h2>
      <p className="nkf-section-sub">Heaviest weight ever logged per exercise, across all Nicktopians.</p>

      <select className="nkf-ex-select" value={selectedEx} onChange={e => setSelectedEx(e.target.value)}
        style={{ borderColor: ex?.dayColor || '#444' }}>
        {Object.entries(EXERCISES).map(([day, { label, sections }]) => (
          <optgroup key={day} label={`── ${label}`}>
            {sections.map(sec => sec.exercises.map(e => (
              <option key={e.name} value={e.name}>{e.name}</option>
            )))}
          </optgroup>
        ))}
      </select>

      {loading ? (
        <div className="nkf-loading-msg">Loading...</div>
      ) : board.length === 0 ? (
        <div className="nkf-empty-state">
          <div className="nkf-empty-icon">🏋️</div>
          <p>No data yet for this exercise. Be the first to log it!</p>
        </div>
      ) : (
        <div className="nkf-board">
          {board.map((entry, i) => (
            <div key={entry.user_id} className={`nkf-board-row${i < 3 ? ' podium' : ''}`}
              style={i === 0 ? { borderColor: ex?.dayColor, background: `${ex?.dayColor}10` } : {}}>
              <span className="nkf-board-rank">{medals[i] || `#${i + 1}`}</span>
              <span className="nkf-board-name">{profiles[entry.user_id] || 'Nicktopian'}</span>
              <div className="nkf-board-right">
                <span className="nkf-board-weight" style={{ color: i === 0 ? ex?.dayColor : undefined }}>{entry.weight}kg</span>
                <span className="nkf-board-reps">× {entry.reps} reps</span>
                <span className="nkf-board-date">{timeAgo(entry.created_at)}</span>
              </div>
            </div>
          ))}
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
    setView('train')
  }

  const day = EXERCISES[activeDay]

  const NAV = [
    { id: 'library', label: '📚 Library' },
    { id: 'programs', label: '📋 Programs' },
    { id: 'train', label: '🏋️ Train' },
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

        {view === 'programs' && <ProgramsView user={user} onTrain={handleTrain} />}

        {view === 'train' && !trainingProgram && <ProgramsView user={user} onTrain={handleTrain} />}
        {view === 'train' && trainingProgram && (
          <WorkoutTracker
            program={trainingProgram}
            user={user}
            savedState={savedSession?.program?.id === trainingProgram?.id ? savedSession : null}
            onComplete={() => { setTrainingProgram(null); setSavedSession(null); setView('programs') }}
          />
        )}

        {view === 'leaderboard' && <LeaderboardView />}
      </div>
    </div>
  )
}