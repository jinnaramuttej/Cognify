'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'

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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const navLinkClass =
    'font-newsreader text-sm uppercase tracking-[0.18em] text-[#CBC6BC] transition-colors duration-150 hover:text-[#E8E2D4]'

  useEffect(() => {
    if (!isProfileMenuOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isProfileMenuOpen])

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

        {!loading && !isAuthenticated && (
          <nav className="hidden items-center gap-10 md:flex">
            <Link className={navLinkClass} href="/partners">
              Community
            </Link>
            <Link className={navLinkClass} href="/blog">
              Blog
            </Link>
            <Link className={navLinkClass} href="/pricing">
              Pricing
            </Link>
          </nav>
        )}

        {!loading && isAuthenticated && (
          <nav className="hidden items-center gap-10 md:flex">
            <Link className={navLinkClass} href="/dashboard">
              Dashboard
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4 text-[#CCC6B9]">
          {!loading && isAuthenticated && (
            <>
              <button
                onClick={() => router.push('/support')}
                className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container-high"
              >
                notifications
              </button>
              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container-high"
                >
                  account_circle
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-md border border-white/10 bg-[#1C1B1B]/95 p-2 shadow-2xl backdrop-blur-xl">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        router.push('/settings')
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-surface-container-high hover:text-primary-fixed"
                    >
                      Settings
                    </button>
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false)
                        await logout()
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-surface-container-high hover:text-primary-fixed"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-6">
              <Link href="/auth/login" className={navLinkClass}>
                Login
              </Link>
              <Link href="/auth/signup" className={navLinkClass}>
                Register
              </Link>
            </div>
          )}
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
              <button
                onClick={() => router.push(isAuthenticated ? '/dashboard' : '/auth/login')}
                className="rounded-md bg-primary-container px-10 py-5 font-semibold text-on-primary-container shadow-xl shadow-black/40 transition-all hover:brightness-105"
              >
                Begin Examination
              </button>
              <button
                onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-md border border-outline-variant bg-transparent px-10 py-5 font-semibold text-primary-fixed transition-all hover:bg-white/5"
              >
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
              <p className="mt-2 text-sm italic text-on-surface-variant">Active candidates learning with Cognify.</p>
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

        <section id="ecosystem" className="mx-auto max-w-[1400px] px-8 py-32 md:px-24">
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
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-[#565248] font-body">Join the Cognify learning community and experience the future of intellectual growth. Refined, rigorous, and result-oriented.</p>
            <div className="pt-8">
              <button
                onClick={() => router.push(isAuthenticated ? '/dashboard' : '/auth/signup')}
                className="rounded-md bg-[#333027] px-14 py-6 text-xl font-bold text-[#F5F3EF] shadow-2xl transition-all hover:scale-105 hover:bg-black"
              >
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

        <footer className="fade-up bg-[#0e0e0e] px-8 py-20 md:px-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
              <div className="space-y-6 md:col-span-1">
                <h3 className="font-newsreader text-4xl tracking-tight text-primary-fixed">Cognify</h3>
                <p className="max-w-xs text-base leading-relaxed text-on-surface-variant font-body">
                  Empowering education through AI.
                  <br />
                  Learn smarter, achieve more.
                </p>
                <div className="flex items-center gap-5 text-on-surface-variant/80">
                  <a href="https://linkedin.com/company/cognify" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-fixed" aria-label="LinkedIn">
                    <Linkedin size={22} />
                  </a>
                  <a href="https://twitter.com/cognify" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-fixed" aria-label="Twitter">
                    <Twitter size={22} />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-fixed" aria-label="YouTube">
                    <Youtube size={22} />
                  </a>
                  <a href="https://facebook.com/cognify" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-fixed" aria-label="Facebook">
                    <Facebook size={22} />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="mb-6 text-2xl font-semibold text-primary-fixed md:text-3xl">Product</h4>
                <ul className="space-y-4 text-on-surface-variant font-body">
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/features">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/pricing">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/tests">
                      Practice Tests
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/analytics">
                      Progress Analytics
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-6 text-2xl font-semibold text-primary-fixed md:text-3xl">Company</h4>
                <ul className="space-y-4 text-on-surface-variant font-body">
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/about">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/blog">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/careers">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/contact">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/partners">
                      Partners
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-6 text-2xl font-semibold text-primary-fixed md:text-3xl">Legal</h4>
                <ul className="space-y-4 text-on-surface-variant font-body">
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/privacy-policy">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/terms-of-service">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/cookie-policy">
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/data-protection">
                      Data Protection
                    </Link>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-primary-fixed" href="/compliance">
                      Compliance
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-6 text-2xl font-semibold text-primary-fixed md:text-3xl">Contact</h4>
                <ul className="space-y-4 text-on-surface-variant font-body">
                  <li className="flex items-center gap-3">
                    <Mail size={18} className="text-primary" />
                    <a className="transition-colors hover:text-primary-fixed" href="mailto:support@cognify.com">
                      support@cognify.com
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={18} className="text-primary" />
                    <a className="transition-colors hover:text-primary-fixed" href="tel:+917207842641">
                      +91 7207842641
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin size={18} className="text-primary" />
                    <span>Medchal, Telangana</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-on-surface-variant md:flex-row">
              <p className="text-sm font-body">© {new Date().getFullYear()} Cognify. All rights reserved. | Founder: Jinnaram Uttej</p>
              <div className="flex items-center gap-8 text-sm font-body">
                <Link className="transition-colors hover:text-primary-fixed" href="/privacy-policy">
                  Privacy
                </Link>
                <Link className="transition-colors hover:text-primary-fixed" href="/terms-of-service">
                  Terms
                </Link>
                <Link className="transition-colors hover:text-primary-fixed" href="/cookie-policy">
                  Cookies
                </Link>
              </div>
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
