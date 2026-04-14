import { AppLayout } from '@/components/layout/AppLayout'
import type { TopbarNavItem } from '@/components/layout/Topbar'

const navItems: TopbarNavItem[] = [
  { label: 'Dashboard' },
  { label: 'Workspace', active: true },
]

export default function CogniPage() {
  return (
    <AppLayout
      breadcrumb="Cogni"
      topbar={{
        searchPlaceholder: 'Search insights...',
        navItems,
      }}
      contentClassName="p-0"
    >
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 overflow-hidden xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
        <aside className="flex flex-col border-b border-[#49473F]/20 bg-[#1C1B1B] p-5 xl:border-b-0 xl:border-r xl:p-6">
          <h2 className="mb-5 text-lg text-[#CCC6B9]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
            History
          </h2>

          <div className="space-y-6 overflow-y-auto pr-1">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Today</p>
              <div className="space-y-3">
                <button className="block text-left">
                  <p className="text-xs font-semibold text-[#E5E2E1]">Quantum Electrodynamics Basics</p>
                  <p className="mt-1 text-[10px] text-[#919191]">2 hours ago • Physics</p>
                </button>
                <button className="block text-left opacity-70 transition-opacity hover:opacity-100">
                  <p className="text-xs font-semibold text-[#E5E2E1]">Neural Network Optimization</p>
                  <p className="mt-1 text-[10px] text-[#919191]">5 hours ago • AI</p>
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Yesterday</p>
              <div className="space-y-3">
                <button className="block text-left opacity-70 transition-opacity hover:opacity-100">
                  <p className="text-xs font-semibold text-[#E5E2E1]">Advanced Linear Algebra</p>
                  <p className="mt-1 text-[10px] text-[#919191]">1 day ago • Math</p>
                </button>
                <button className="block text-left opacity-70 transition-opacity hover:opacity-100">
                  <p className="text-xs font-semibold text-[#E5E2E1]">Stoic Philosophy &amp; Logic</p>
                  <p className="mt-1 text-[10px] text-[#919191]">1 day ago • Humanities</p>
                </button>
              </div>
            </div>
          </div>

          <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[#2A2A2A] py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#CBC6BC] transition-colors hover:bg-[#CCC6B9] hover:text-[#333027]">
            <span className="material-symbols-outlined text-sm">add</span>
            New Session
          </button>
        </aside>

        <section className="flex min-h-0 flex-col bg-[#131313]">
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
            <div className="flex justify-end">
              <div className="max-w-3xl rounded-xl rounded-tr-none bg-[#2A2A2A] p-5 text-sm leading-relaxed text-[#E5E2E1]">
                Can you explain the relationship between entropy and the Second Law of Thermodynamics, specifically in
                isolated systems?
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#CCC6B9]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Core Concept</span>
                </div>

                <h2 className="text-2xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  The Arrow of Irreversibility
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#CBC6BC]">
                  Entropy is a measure of molecular disorder. The Second Law states that for an isolated system, total
                  entropy can never decrease over time; it can only remain constant or increase.
                </p>
              </div>

              <div className="rounded-xl border-l-2 border-[#CCC6B9]/30 bg-[#0E0E0E] p-6 md:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#CCC6B9]">functions</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Mathematical Framework</span>
                </div>

                <div className="space-y-6 text-sm text-[#E8E2D4]">
                  <div className="flex gap-3">
                    <span className="font-bold text-[#6D6B68]">01.</span>
                    <div>
                      <p className="text-[#E5E2E1]">Boltzmann Entropy Formula</p>
                      <p className="py-2 text-lg">S = kB ln(Ω)</p>
                      <p className="text-[11px] text-[#919191]">Where kB is Boltzmann&apos;s constant and Ω is the number of microstates.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="font-bold text-[#6D6B68]">02.</span>
                    <div>
                      <p className="text-[#E5E2E1]">Clausius Inequality</p>
                      <p className="py-2 text-lg">ΔS ≥ ∫ dQ / T</p>
                      <p className="text-[11px] text-[#919191]">For isolated systems, dQ = 0, therefore ΔS ≥ 0.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-[#49473F]/30 bg-[#201F1F] p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8E2D4]">Synthesis</p>
                  <p className="text-xs leading-relaxed text-[#CBC6BC]">
                    Isolated systems gravitate toward thermal equilibrium, the state of maximum entropy.
                  </p>
                </div>
                <div className="rounded-lg border border-[#49473F]/30 bg-[#201F1F] p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8E2D4]">Cognitive Link</p>
                  <p className="text-xs leading-relaxed text-[#CBC6BC]">
                    Think of entropy as the tax paid for every energetic exchange in the universe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#49473F]/20 bg-[#131313]/70 p-4 backdrop-blur-md md:p-6">
            <div className="mx-auto max-w-4xl">
              <label className="relative block">
                <textarea
                  rows={2}
                  className="min-h-[64px] w-full resize-none rounded-xl border border-transparent bg-[#353534] p-4 pr-24 text-sm text-[#E5E2E1] outline-none transition-colors placeholder:text-[#919191] focus:border-[#49473F]"
                  placeholder="Ask Cogni about complex dynamics..."
                />

                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[#919191]">
                  <button type="button" aria-label="Use microphone" className="material-symbols-outlined text-[18px] hover:text-[#E8E2D4]">
                    mic
                  </button>
                  <button type="button" aria-label="Attach file" className="material-symbols-outlined text-[18px] hover:text-[#E8E2D4]">
                    attach_file
                  </button>
                  <button
                    type="button"
                    aria-label="Send message"
                    className="material-symbols-outlined rounded-lg bg-[#E8E2D4] p-1.5 text-[#333027]"
                  >
                    north
                  </button>
                </div>
              </label>
            </div>
          </div>
        </section>

        <aside className="border-t border-[#49473F]/20 bg-[#201F1F] p-6 xl:border-l xl:border-t-0 xl:p-8">
          <h2 className="mb-6 text-lg text-[#CCC6B9]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
            Cognitive Insights
          </h2>

          <div className="mb-8 flex flex-col items-center">
            <div className="relative h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#353534" strokeWidth="4" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#E8E2D4"
                  strokeWidth="4"
                  strokeDasharray="440"
                  strokeDashoffset="110"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  75%
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Mastery</span>
              </div>
            </div>

            <p className="mt-3 text-sm font-semibold">Thermodynamics</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#919191]">Level: Advanced Undergraduate</p>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Verified Sources</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-md bg-[#2A2A2A] p-3">
                <span className="material-symbols-outlined text-[#CCC6B9]">book</span>
                <div className="text-[11px]">
                  <p className="font-bold">Zemansky&apos;s Heat</p>
                  <p className="text-[#919191]">Academic Standard</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-[#2A2A2A] p-3">
                <span className="material-symbols-outlined text-[#CCC6B9]">school</span>
                <div className="text-[11px]">
                  <p className="font-bold">MIT OpenCourseWare</p>
                  <p className="text-[#919191]">Video Lectures</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Knowledge Node</p>
            <div className="group relative overflow-hidden rounded-lg">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG6xsG2N1x5cPIkoyoGk8Z3dxf_sRRQYTT_zjKwjeniIvzxDlsaLs14I-R6aSgWLZHiz3fyIOeTMZhcTrbYQl93wnz83nuX7WySGVsDfieBdE85lJ-zhjb-CM7Oz474WBRrt3KqhGpoc2kuwkCdjGbII5KxtUhHgQjmwQwWFyeY71jzQ3Q_gK0vK2_nFxcCf3G4sg2E8Huxm295YrN_fPvVV5wgJBB9JmutYPZ-jVurSnqiV7qhzeVWBiqLdv5wcmTJ96Nps4wDywc"
                alt="Knowledge graph preview"
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[#CCC6B9]/20 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-[#131313] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Expand Map
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  )
}
