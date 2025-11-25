import React, { useEffect, useState } from 'react'
import userManager from './Auth'
import './styles.css'

// Portfolio content — human-written, concise and conversational
const content = {
  headline: "Full-Stack Software Engineer",
  summary:
    "I build web applications that are easy to use and maintain. I focus on clear interfaces, reliable backends, and sensible security practices such as OIDC-based authentication with WSO2 Asgardio. Below are a few highlights and projects I've worked on.",
  highlights: [
    'Built production React + Node.js applications used by teams and customers',
    'Implemented OIDC authentication and secure API access',
    'Improved app performance and developer workflows',
    'Worked closely with designers and product owners to ship features'
  ],
  projects: [
    {
      title: 'Insights Dashboard',
      desc: 'A dashboard that helps teams track key metrics and make informed decisions. Built with a modular component approach and server-side APIs.',
    },
    {
      title: 'Documentation Search',
      desc: 'A fast, searchable documentation site with helpful summaries and a clear authoring workflow.',
    }
  ]
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        // handle OIDC callback if present
        const search = window.location.search
        if (search.includes('code=') || search.includes('id_token=')) {
          try {
            await userManager.signinRedirectCallback()
            window.history.replaceState({}, document.title, window.location.pathname)
          } catch (cbErr) {
            console.warn('signinRedirectCallback failed:', cbErr)
          }
        }

        const u = await userManager.getUser()
        setUser(u)
      } catch (e) {
        console.error('Auth init failed:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return <div id="app" style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
  }

  if (!user) {
    return (
      <div id="app" className="portfolio-root">
        <div className="center-card">
          <h2>Welcome — please sign in</h2>
          <p>Sign in with your Asgardio account to view this private portfolio.</p>
          <button className="primary" onClick={() => userManager.signinRedirect()}>
            Sign in with Asgardio
          </button>
        </div>
      </div>
    )
  }

  // Portfolio view for authenticated users (no external images)
  return (
    <div id="app" className="portfolio-root">
      <nav className="nav container">
        <div className="brand">Abdul</div>
        <div className="social-links">
          <a href="#" aria-label="GitHub">GitHub</a>
          <a href="#" aria-label="LinkedIn">LinkedIn</a>
        </div>
      </nav>
      <header className="hero">
        <div className="container hero-inner">
          <div style={{flex:1}}>
            <h1>{content.headline}</h1>
            <p className="lead">{content.summary}</p>
            <div style={{marginTop:16}}>
              <button className="secondary" onClick={() => userManager.signoutRedirect()}>
                Sign out
              </button>
            </div>
          </div>
          <div className="hero-deco">AB</div>
        </div>
      </header>

      <main className="container">
        <section className="section">
          <h2>Highlights</h2>
          <ul className="highlights">
            {content.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>

        <section className="section">
          <h2>Skills & Tools</h2>
          <div className="skills">
            {['React','Node.js','Express','OIDC','JWT','CSS','TypeScript','Docker'].map((s,i)=>(
              <div className="skill" key={i}>{s}</div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Experience</h2>
          <div className="timeline">
            <div className="timeline-item">
              <h4>Senior Developer — Acme Co.</h4>
              <div className="muted">2022 — Present</div>
              <p>Leading frontend and authentication work for internal SaaS products, implementing OIDC-based SSO and secure APIs.</p>
            </div>
            <div className="timeline-item">
              <h4>Full-Stack Engineer — Tech Studio</h4>
              <div className="muted">2019 — 2022</div>
              <p>Built modular React components and Node microservices, improved deploy pipelines, and introduced automated testing.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Selected Projects</h2>
          <div className="projects">
            {content.projects.map((p, i) => (
              <article className="card" key={i}>
                <div className="card-visual">{p.title.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
                <div className="card-body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Education</h2>
          <div className="timeline">
            <div className="timeline-item">
              <h4>B.Sc. Computer Science</h4>
              <div className="muted">2015 — 2019</div>
              <p>UCSC — coursework: algorithms, systems, databases.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Testimonials</h2>
          <div className="testimonials">
            <div className="testimonial">“Delivered high-quality work on time and improved our authentication flow.” — Product Manager</div>
            <div className="testimonial">“Expertise in full-stack development and a pragmatic approach to engineering.” — Team Lead</div>
          </div>
        </section>

        <section className="section contact">
          <h2>Contact</h2>
          <p>If you'd like to talk about a project or potential collaboration, email me at <a href="mailto:abdul@example.com">abdul@example.com</a>.</p>
        </section>
      </main>

      <footer className="footer container">
        <div>© {new Date().getFullYear()} — Portfolio </div>
      </footer>
    </div>
  )
}
