import '../styles/dashboard.css'

const WIDGETS = [
  {
    id: 'gym',
    icon: '💪',
    title: 'Nickfit',
    accent: '#c0392b',
    content: (
      <div className="widget-gym">
        <div className="streak">
          <span className="streak-num">0</span>
          <span className="streak-label">day streak 🔥</span>
        </div>
        <p className="widget-hint">No sessions logged yet. Bruno is judging you.</p>
        <button className="widget-btn">Log a Workout</button>
      </div>
    )
  },
  {
    id: 'movies',
    icon: '🎬',
    title: 'Nickflix',
    accent: '#e67e22',
    content: (
      <div className="widget-movies">
        <p className="widget-hint">No movies added yet. Bruno recommends Marmaduke — 5/5 bones.</p>
        <button className="widget-btn">Browse Movies</button>
      </div>
    )
  },
  {
    id: 'sports',
    icon: '🏆',
    title: 'Nickbet',
    accent: '#27ae60',
    content: (
      <div className="widget-sports">
        <div className="nickbucks">
          <span className="nb-icon">🪙</span>
          <div>
            <span className="nb-amount">1,000</span>
            <span className="nb-label">Nickbucks</span>
          </div>
        </div>
        <p className="widget-hint">No active bets. The season awaits.</p>
        <button className="widget-btn">View Fixtures</button>
      </div>
    )
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'Nickchat',
    accent: '#2980b9',
    content: (
      <div className="widget-chat">
        <p className="widget-hint">No messages yet. Say hello to someone.</p>
        <button className="widget-btn">Open Chat</button>
      </div>
    )
  },
  {
    id: 'vault',
    icon: '📁',
    title: 'Nickvault',
    accent: '#8e44ad',
    content: (
      <div className="widget-vault">
        <p className="widget-hint">No files uploaded. Bruno is standing guard over an empty room.</p>
        <button className="widget-btn">Upload a File</button>
      </div>
    )
  },
]

export default function Dashboard({ user }) {
  return (
    <div className="dashboard">

      {/* Welcome Banner */}
      <section className="dash-banner">
        <div className="dash-banner-inner">
          <div className="dash-welcome">
            <h1>G'day, <span>{user.name}</span> 👋</h1>
            <p>Welcome to Nicktopia. Bruno is already here. He got here first.</p>
          </div>
          <img
            src="/BrunoandNick.jpg"
            alt="Bruno and Nick"
            className="dash-banner-img"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      </section>

      {/* Noticeboard */}
      <section className="dash-notice">
        <div className="dash-notice-inner">
          <span className="notice-pin">📌</span>
          <p>
            <strong>Nicktopia is under construction.</strong> Pages are being built.
            Bruno is supervising. Thanks for your patience — and his.
          </p>
        </div>
      </section>

      {/* Widgets */}
      <section className="dash-widgets">
        <div className="dash-widgets-inner">
          <h2 className="dash-section-title">Your Nicktopia</h2>
          <div className="widgets-grid">
            {WIDGETS.map(w => (
              <div
                key={w.id}
                className="widget"
                style={{ '--accent': w.accent }}
              >
                <div className="widget-header">
                  <span className="widget-icon">{w.icon}</span>
                  <h3>{w.title}</h3>
                </div>
                <div className="widget-body">{w.content}</div>
              </div>
            ))}

            {/* Bruno widget */}
            <div className="widget widget-bruno">
              <div className="widget-header">
                <span className="widget-icon">🐾</span>
                <h3>Bruno</h3>
              </div>
              <div className="widget-body">
                <img src="/CuteBruno.png" alt="Bruno" className="wb-img" />
                <p className="widget-hint">Chief Watchdog. Available 24/7. Accepts treats as payment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dash-footer">
        <p>© {new Date().getFullYear()} Nicktopia 🐾 Built by Nick, supervised by Bruno</p>
      </footer>
    </div>
  )
}
