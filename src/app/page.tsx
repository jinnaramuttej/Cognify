'use client'

import { useEffect, useState } from 'react'

const phrases = ['Study Smarter.', 'Rank Higher.', 'Think Deeper.']

function animateCount(el: HTMLElement) {
  if (el.dataset.animated === 'true') return

  const targetRaw = el.dataset.target
  if (!targetRaw) return

  el.dataset.animated = 'true'

  const target = Number.parseFloat(targetRaw)
  const decimals = Number.parseInt(el.dataset.decimal ?? '0', 10)
  const duration = 2500
  const start = performance.now()

  function update(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - (1 - progress) * (1 - progress)
    const current = eased * target

    let display = current.toFixed(decimals)

    if (target >= 1000 && decimals === 0) {
      display = Math.floor(current).toLocaleString()
      if (target >= 12000) display += '+'
    }

    el.textContent = display

    if (progress < 1) {
      requestAnimationFrame(update)
      return
    }

    let finalValue = target.toFixed(decimals)
    if (target >= 1000 && decimals === 0) {
      finalValue = target.toLocaleString()
      if (target >= 12000) finalValue += '+'
    }
    el.textContent = finalValue
  }

  requestAnimationFrame(update)
}

export default function LandingPage() {
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let timeoutId = 0

    const tick = () => {
      const currentPhrase = phrases[phraseIndex]

      if (deleting) {
        const nextText = currentPhrase.substring(0, Math.max(charIndex - 1, 0))
        setTypedText(nextText)
        charIndex = Math.max(charIndex - 1, 0)
      } else {
        const nextText = currentPhrase.substring(0, Math.min(charIndex + 1, currentPhrase.length))
        setTypedText(nextText)
        charIndex = Math.min(charIndex + 1, currentPhrase.length)
      }

      let speed = deleting ? 40 : 100

      if (!deleting && charIndex === currentPhrase.length) {
        speed = 2500
        deleting = true
      } else if (deleting && charIndex === 0) {
        deleting = false
        phraseIndex = (phraseIndex + 1) % phrases.length
        speed = 500
      }

      timeoutId = window.setTimeout(tick, speed)
    }

    tick()

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    const root = document.querySelector('.monograph-scope')
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const target = entry.target as HTMLElement
          target.classList.add('visible')

          if (target.classList.contains('count-up')) {
            animateCount(target)
          }

          target.querySelectorAll<HTMLElement>('.count-up').forEach((counter) => {
            animateCount(counter)
          })
        })
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const revealTargets = root.querySelectorAll<HTMLElement>('.fade-up, .reveal-card, section, footer')

    revealTargets.forEach((el) => {
      if (!el.classList.contains('fade-up') && !el.classList.contains('reveal-card')) {
        el.classList.add('fade-up')
      }
      observer.observe(el)
    })

    root.querySelectorAll<HTMLElement>('.count-up').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="monograph-scope text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#131313]/90 px-8 backdrop-blur-xl">
        <div className="font-newsreader text-2xl font-semibold tracking-tight text-[#CCC6B9]">Cognify</div>
        <nav className="hidden items-center gap-10 md:flex">
          <a className="font-newsreader text-sm font-bold uppercase tracking-widest text-[#E8E2D4] transition-colors hover:text-[#E8E2D4]" href="#">
            Dashboard
          </a>
          <a className="font-newsreader text-sm uppercase tracking-widest text-[#A1A1A1] transition-colors hover:text-[#E8E2D4]" href="#">
            Tests
          </a>
          <a className="font-newsreader text-sm uppercase tracking-widest text-[#A1A1A1] transition-colors hover:text-[#E8E2D4]" href="#">
            Library
          </a>
          <a className="font-newsreader text-sm uppercase tracking-widest text-[#A1A1A1] transition-colors hover:text-[#E8E2D4]" href="#">
            Arena
          </a>
        </nav>
        <div className="flex items-center gap-4 text-[#CCC6B9]">
          <button className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container-high">notifications</button>
          <button className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container-high">account_circle</button>
        </div>
      </header>

      <main className="star-field relative overflow-hidden pt-16">
        <section className="relative flex min-h-[95vh] flex-col items-center gap-12 overflow-hidden px-8 py-20 md:flex-row md:px-24">
          <div className="absolute inset-0 z-0">
            <img
              alt="Atmospheric Library Background"
              className="h-full w-full object-cover brightness-50 contrast-125"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuClzwFtFiRPNZit0GI3KKPGwLh2oqSNBy_Dv8vU1eMwBLZVzFFWm0wBOu-9FQmxhlK8F6j4UVnpPMfdHba27yW5Gxpb9Q4lsIx3qZ2JDoqck5_NJHNSouLypYUGdihpojA2jRgNPvmuSP8iou-J4qPJhtbtNX6sWTE7Hd6bt_JKHLZV-EzLV5yUBERgA3haEswEXaK1XAgQAW7t4CseimtOIF7aMy-52QM7mgpMEZix1tsrn2PFUQp1Jp99umuMgtSzYerxUxk95-lq"
            />
            <div className="hero-polish-overlay absolute inset-0" />
          </div>

          <div className="fade-up relative z-10 max-w-2xl flex-1 space-y-10">
            <div className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
              <span className="text-primary-fixed text-[10px] font-bold uppercase tracking-[0.3em]">Engineered for Excellence</span>
            </div>
            <h1 className="font-newsreader text-primary-fixed text-6xl leading-[1.1] font-light tracking-tighter md:text-8xl">
              <span className="typewriter-cursor">{typedText}</span>
            </h1>
            <p className="max-w-lg text-xl leading-relaxed text-on-surface-variant/80 font-body">
              A monograph-inspired learning ecosystem designed for deep cognitive rigor. Harness the power of generative intelligence to master the world's most demanding academic domains.
            </p>
            <div className="flex flex-wrap gap-6 pt-6">
              <button className="rounded-md bg-primary-container px-10 py-5 font-semibold text-on-primary-container shadow-xl shadow-black/40 transition-all hover:brightness-105">
                Begin Examination
              </button>
              <button className="rounded-md border border-outline-variant bg-transparent px-10 py-5 font-semibold text-primary-fixed transition-all hover:bg-white/5">
                Watch Monograph
              </button>
            </div>
          </div>

          <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-6 md:items-end">
            <div className="fade-up glass-card relative z-[3] w-full max-w-sm -translate-x-0 rounded-xl border border-white/10 p-8 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-primary/60 text-xs font-bold uppercase tracking-widest">Community</span>
                <span className="material-symbols-outlined text-primary/40">groups</span>
              </div>
              <div className="font-newsreader text-primary-fixed text-3xl">12,400+ scholars</div>
              <p className="mt-2 text-sm italic text-on-surface-variant">Active candidates in the 2026 cohort.</p>
            </div>

            <div className="fade-up glass-card relative z-[2] w-full max-w-sm translate-x-4 rounded-xl border border-white/10 p-8 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-primary/60 text-xs font-bold uppercase tracking-widest">Performance</span>
                <span className="material-symbols-outlined text-primary/40">show_chart</span>
              </div>
              <div className="font-newsreader text-primary-fixed text-3xl">99.4% Success</div>
              <p className="mt-2 text-sm italic text-on-surface-variant">Average score improvement over baseline.</p>
            </div>

            <div className="fade-up glass-card relative z-[1] w-full max-w-sm translate-x-8 rounded-xl border border-white/10 p-8 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-primary/60 text-xs font-bold uppercase tracking-widest">Benchmark</span>
                <span className="material-symbols-outlined text-primary/40">military_tech</span>
              </div>
              <div className="font-newsreader text-primary-fixed text-3xl">Top 1% Median</div>
              <p className="mt-2 text-sm italic text-on-surface-variant">National percentile rank among users.</p>
            </div>
          </div>
        </section>

        <section className="fade-up overflow-hidden border-y border-white/5 bg-surface-container-low py-16">
          <div className="marquee flex items-center gap-24">
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">ADAPTIVE LEARNING</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">AI TUTOR</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">COGNITIVE RIGOR</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">EDITORIAL DESIGN</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">NEURAL MAPPING</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">ADAPTIVE LEARNING</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">AI TUTOR</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">COGNITIVE RIGOR</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">·</span>
            <span className="font-newsreader text-primary-fixed/30 text-3xl italic tracking-widest">EDITORIAL DESIGN</span>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-8 py-32 md:px-24">
          <div className="fade-up mb-24 space-y-6">
            <h2 className="font-newsreader text-primary-fixed text-6xl">The Ecosystem.</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant font-body">
              Tools designed for those who demand more than superficial understanding. A curated suite of intellectual companions for the modern scholar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="reveal-card group relative h-[480px] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] md:col-span-8">
              <img alt="Cogni AI learning visualization" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYCtx7yISokuj7NY4zC0aRahAwY5IByYmI7oPFwDkJ3FiLve5MNHCCVY1Ir_3vOZEBJsLGotM-Cn9gaPX0rB6gKjZ-Nj3zg51XYVPntB7nHVFUQDawggjzdU_sOLn0EU6q4UWRH6ySSIvBEAHLGYrTY981kLDqTW068s0lFY75af51XZ8xGNiQ-ka6CNYLqRcNxKmFNT2RZ20oAaVADwubYQVo9BoV22DODVvjDsmFkSUT3j2SIRkYKW8j34gy-BAn4tUaiHC0x4TH" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
              <div className="absolute bottom-0 p-10">
                <span className="font-newsreader text-primary mb-3 block text-2xl italic">Cogni AI</span>
                <h3 className="font-newsreader text-primary-fixed mb-5 text-4xl leading-tight">Deep Interactive Dialogue</h3>
                <p className="max-w-lg leading-relaxed text-on-surface-variant">Engage in high-level academic discourse with an AI that understands context, nuance, and your personal learning trajectory.</p>
              </div>
            </div>

            <div className="reveal-card group relative h-[480px] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] md:col-span-4">
              <img alt="Arena simulation environment" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApiQ9Blwo_rhnQk7rN3UAueFlpus9SiHOdZurFDWgjZ6pKVBNBpSWaYxs6wB2YipLW1bA__blwwkGBVQlWZAWrJuszZSinYSPDCt0z_yMuzb1ER3cD9Y8jYHAVX2iGwJvqJ0lRJb491pd4FoVK7DXw9g13MhGgS3c3j8rVVAPSiAKueA9fFpYTAkpxcDXFCpi4-nzgEkGIYDBMpQ-ZURtRoNo2nqtj0JBLdJyjgblc_yfQBw1io2uh3dqHYTaMrt60XG2QAUMD3Vxb" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
              <div className="absolute bottom-0 p-10">
                <span className="font-newsreader text-primary mb-3 block text-2xl italic">The Arena</span>
                <h3 className="font-newsreader text-primary-fixed mb-5 text-3xl leading-tight">Simulated Mastery</h3>
                <p className="leading-relaxed text-on-surface-variant">Adaptive testing environments that evolve as your knowledge deepens.</p>
              </div>
            </div>

            <div className="reveal-card group relative h-[480px] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] md:col-span-5">
              <img alt="Digital library environment" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClzwFtFiRPNZit0GI3KKPGwLh2oqSNBy_Dv8vU1eMwBLZVzFFWm0wBOu-9FQmxhlK8F6j4UVnpPMfdHba27yW5Gxpb9Q4lsIx3qZ2JDoqck5_NJHNSouLypYUGdihpojA2jRgNPvmuSP8iou-J4qPJhtbtNX6sWTE7Hd6bt_JKHLZV-EzLV5yUBERgA3haEswEXaK1XAgQAW7t4CseimtOIF7aMy-52QM7mgpMEZix1tsrn2PFUQp1Jp99umuMgtSzYerxUxk95-lq" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
              <div className="absolute bottom-0 p-10">
                <span className="font-newsreader text-primary mb-3 block text-2xl italic">Library</span>
                <h3 className="font-newsreader text-primary-fixed mb-5 text-3xl leading-tight">Eternal Repository</h3>
                <p className="leading-relaxed text-on-surface-variant">Your personal archive of knowledge, synthesized and searchable by intent.</p>
              </div>
            </div>

            <div className="reveal-card group relative h-[480px] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] md:col-span-7">
              <img alt="Cognitive analytics dashboard visual" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5oD4LSq_U7Mf8RMoM-8W4n0GLOPcMWB8w0maBReI90NzDpUv75WDJ27iZnglQJMz5DAQfICDYabRYvP--wnOrkC5PvDfuHu-Po2HUlTRnuwe0NX432ogAtdnZ-OvQNKLqrlafFm4OT8oQTTbSC8bhICCFVxm16N28bSNJwuHefyMrn68JE88IpLHrsAjQF75ldYYxLblJ6C_WqO6dcPJh6UGxWWgPaglGaB2ToKv0fWBBW61yyBdq6mlCFaWE-lYuRocZ1DyDJiKp" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
              <div className="absolute bottom-0 p-10">
                <span className="font-newsreader text-primary mb-3 block text-2xl italic">Dashboard</span>
                <h3 className="font-newsreader text-primary-fixed mb-5 text-4xl leading-tight">Cognitive Mapping</h3>
                <p className="max-w-sm leading-relaxed text-on-surface-variant">Visualize your progress through architectural data landscapes that reveal hidden connections in your learning.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#F5F3EF] px-8 py-40 text-center">
          <div className="fade-up relative z-10 max-w-3xl space-y-10">
            <h2 className="font-newsreader text-6xl leading-[1.1] tracking-tight text-[#333027] md:text-7xl">Ready to transcend standard learning?</h2>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-[#565248] font-body">Join the 2026 cohort and experience the future of intellectual growth. Refined, rigorous, and result-oriented.</p>
            <div className="pt-8">
              <button className="rounded-md bg-[#333027] px-14 py-6 text-xl font-bold text-[#F5F3EF] shadow-2xl transition-all hover:scale-105 hover:bg-black">
                Apply for Early Access
              </button>
            </div>
            <div className="flex justify-center gap-16 pt-16 text-[#959087]">
              <div className="text-left">
                <span className="count-up font-newsreader block text-3xl text-[#333027]" data-target="12000">
                  0
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]">Scholars</span>
              </div>
              <div className="text-left">
                <span className="font-newsreader block text-3xl text-[#333027]">
                  <span className="count-up" data-decimal="1" data-target="99.4">
                    0
                  </span>
                  %
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]">Success Rate</span>
              </div>
              <div className="text-left">
                <span className="count-up font-newsreader block text-3xl text-[#333027]" data-target="2026">
                  0
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]">Standard</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="fade-up border-t border-white/5 bg-[#0e0e0e] px-8 py-24 md:px-24">
          <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-20 md:flex-row">
            <div className="space-y-8">
              <div className="font-newsreader text-primary text-4xl tracking-tighter">Cognify</div>
              <p className="max-w-sm text-base leading-relaxed text-on-surface-variant/70 font-body">
                Cognify. Precision AI preparation for the world's most demanding academic examinations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16 md:grid-cols-3">
              <div className="space-y-6">
                <h4 className="text-primary-fixed/40 text-xs font-bold uppercase tracking-[0.25em]">Platform</h4>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Cogni AI
                    </a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      The Arena
                    </a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Digital Library
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-primary-fixed/40 text-xs font-bold uppercase tracking-[0.25em]">Community</h4>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Journal
                    </a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Forums
                    </a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Events
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-primary-fixed/40 text-xs font-bold uppercase tracking-[0.25em]">Legal</h4>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-primary" href="#">
                      Terms of Use
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-24 flex max-w-[1400px] items-center justify-between border-t border-white/5 pt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40">
            <span>© 2026 Cognify Labs</span>
            <div className="flex gap-8">
              <a className="transition-colors hover:text-primary" href="#">
                Twitter
              </a>
              <a className="transition-colors hover:text-primary" href="#">
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .monograph-scope {
          font-family: 'Inter', sans-serif;
          background-color: #0e0e0e;
          min-height: 100vh;
        }

        .monograph-scope .font-newsreader {
          font-family: 'Newsreader', serif;
        }

        .monograph-scope .marquee {
          white-space: nowrap;
          animation: monograph-marquee 30s linear infinite;
        }

        .monograph-scope .marquee:hover {
          animation-play-state: paused;
        }

        .monograph-scope .star-field {
          background-image: radial-gradient(circle at 2px 2px, rgba(232, 226, 212, 0.05) 1px, transparent 0);
          background-size: 60px 60px;
        }

        .monograph-scope .glass-card {
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(24px);
        }

        .monograph-scope .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .monograph-scope .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .monograph-scope .typewriter-cursor::after {
          content: '|';
          animation: monograph-blink 1s step-end infinite;
          color: #ccc6b9;
        }

        .monograph-scope .reveal-card {
          opacity: 0;
          transform: scale(0.97) translateY(20px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .monograph-scope .reveal-card.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .monograph-scope .hero-polish-overlay {
          background: linear-gradient(135deg, rgba(13, 13, 13, 0.92) 0%, rgba(13, 13, 13, 0.75) 50%, rgba(13, 13, 13, 0.55) 100%);
        }

        @keyframes monograph-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes monograph-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
