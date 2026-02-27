import { useState, useEffect } from 'react'
import '../styles/landing.css'

const BRUNO_QUOTES = [
  "Welcome to Nicktopia. I'd give you a tour but I'm busy napping.",
  "You made it. I've been guarding the door all day. Very tiring work.",
  "Nicktopia: Nick's idea. My face everywhere. You're welcome.",
  "I'm Bruno — world's most handsome watchdog. And most modest.",
  "Finally someone arrived. It was just me and Nick for ages.",
  "Please log in so I can go to sleep. I have a big day of sleeping planned.",
]

const FEATURES = [
  {
    icon: '💪',
    name: 'Nickfit',
    tagline: "Track your gains. Cry about leg day.",
    desc: 'Log Push, Pull and Legs sessions. Track reps, weights and PBs. Bruno will judge you if you skip.',
    color: '#c0392b',
  },
  {
    icon: '🎬',
    name: 'Nickflix',
    tagline: "Nick's cinema. Bruno gives it 5 bones.",
    desc: 'Handpicked movies with trailers, ratings and reviews. Bruno personally recommends Marmaduke.',
    color: '#e67e22',
  },
  {
    icon: '🏆',
    name: 'Nickbet',
    tagline: "Fake money. Real bragging rights.",
    desc: 'Live sports ladders and fixtures. Bet fake Nickbucks on EPL, NRL, AFL and F1 with your mates.',
    color: '#27ae60',
  },
  {
    icon: '💬',
    name: 'Nickchat',
    tagline: "Talk to your mates. Bruno can't reply.",
    desc: 'Direct messages and group chats. Share gym wins, movie opinions and losing bet slips.',
    color: '#2980b9',
  },
  {
    icon: '📁',
    name: 'Nickvault',
    tagline: "Your files. Bruno guards them personally.",
    desc: 'Upload, share and download files. Bruno has been sitting on the server all day. He deserves a treat.',
    color: '#8e44ad',
  },
]

export default function Landing({ onEnter }) {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % BRUNO_QUOTES.length)
        setQuoteVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="landing">

      {/* ── HERO ── */}
      <section className="l-hero">
        <div className="l-hero-bg" />

        <div className="l-hero-content">
          <img src="/NicktopiaLogoFinal.png" alt="Nicktopia" className="l-logo" />
          <h1 className="l-title">Welcome to<br />Nicktopia</h1>
          <p className="l-sub">Nick's corner of the internet. You're welcome.</p>
          <div className="l-hero-btns">
            <button className="btn-primary" onClick={onEnter}>Enter Nicktopia</button>
            <button className="btn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              What is this?
            </button>
          </div>
        </div>

        {/* Bruno floating mascot */}
        <div className="l-bruno-wrap">
          <div className={`l-speech ${quoteVisible ? 'show' : ''}`}>
            {BRUNO_QUOTES[quoteIdx]}
          </div>
          <img src="/SmileBruno__1_-removebg-preview.png" alt="Bruno" className="l-bruno-img" />
        </div>

        <button
          className="l-scroll-hint"
          onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
        >↓</button>
      </section>

      {/* ── ABOUT ── */}
      <section className="l-about" id="about">
        <div className="l-about-inner">
          <div className="l-about-text">
            <h2>What is Nicktopia?</h2>
            <p>
              Nicktopia is Nick's personal platform — a one-stop hub for gym tracking,
              movies, sports betting with fake money, messaging and file sharing.
            </p>
            <p>
              Think of it as a social media site, but instead of ads and algorithms
              you get dachshund commentary and honest movie reviews.
            </p>
            <p>Built for friends. Powered by Bruno.</p>
            <button className="btn-primary" onClick={onEnter} style={{ marginTop: '1.5rem' }}>
              Join Nicktopia 🐾
            </button>
          </div>
          <div className="l-about-photo">
            <img
              src="/BrunieandNick-removebg-preview__1_.png"
              alt="Nick and Bruno"
              className="l-about-img"
            />
            <div className="l-about-caption">
              <strong>Nick & Bruno</strong>
              <span>Founder & Chief Watchdog</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="l-features" id="features">
        <div className="l-features-inner">
          <h2 className="l-section-title">Everything in one place</h2>
          <p className="l-section-sub">Five sections. One website. Infinite Bruno.</p>
          <div className="l-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="l-feature-card"
                style={{ '--accent': f.color, animationDelay: `${i * 0.1}s` }}
              >
                <span className="l-feature-icon">{f.icon}</span>
                <h3 style={{ color: f.color }}>{f.name}</h3>
                <p className="l-feature-tagline">"{f.tagline}"</p>
                <p className="l-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="l-stats">
        <div className="l-stats-inner">
          {[
            { val: '5', label: 'Sections' },
            { val: '1', label: 'Website' },
            { val: '∞', label: 'Bruno Photos' },
            { val: '0', label: 'Ads. Ever.' },
          ].map((s, i) => (
            <div className="l-stat" key={i}>
              <span className="l-stat-val">{s.val}</span>
              <span className="l-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIGN OFF ── */}
      <section className="l-signoff">
        <div className="l-signoff-inner">
          <img
            src="/PortraitBruno-removebg-preview.png"
            alt="Bruno"
            className="l-signoff-bruno"
          />
          <div className="l-signoff-text">
            <h2>Ready to enter<br />Nicktopia?</h2>
            <p>Bruno has been guarding the entrance all day. He's exhausted. Please log in so he can finally rest.</p>
            <button className="btn-primary" style={{ fontSize: '1.3rem', padding: '1rem 2.5rem' }} onClick={onEnter}>
              Enter Nicktopia 🐾
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="l-footer">
        <p>© {new Date().getFullYear()} Nicktopia — Built by Nick, supervised by Bruno 🐾</p>
        <p className="l-footer-small">
          Bruno does not endorse bets placed on Nickbet. He also does not understand money.
        </p>
      </footer>
    </div>
  )
}
