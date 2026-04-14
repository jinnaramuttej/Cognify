import { AppLayout } from '@/components/layout/AppLayout'

const heroCards = [
  {
    badge: 'Diagnostic',
    duration: '45 MINS',
    title: 'Classical Mechanics Mastery',
    subtitle: 'Full-spectrum evaluation of Newtonian principles and orbital dynamics.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCnjL3WgDv_w_9V6ZxVchF9tEJkE7JaGi3t4t_3QWxlIjd4-onlZBi90fVV23Pul0MJnVdhCfNXYn8RO6TSOtt7FARthSIeK89SCVotcdCOCymXpuc7mihqZrs_t5OC5YwEyaJJrbOxVz8NrCE2jcIXSTYMfNgfikOgQ_F5X-E8XY4bweFHbwkpkPNbN2LK4vbvfOnp_eJfQeLdbTxFDw4uOgzXmCOxr5FBjxodKaWNoj6m_LOBR0lRKDbyw-Gl3jKfPmetwYMVck9M',
  },
  {
    badge: 'Live Mock',
    duration: '120 MINS',
    title: 'Molecular Kinetics Analysis',
    subtitle: 'Advanced simulations on reaction rates and thermodynamic stability.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAy-XkOcak6PAvUk6M9l4GHjuy-atb9cKof4LQ7tFanHdnZHGeoetSyAdSKMTxW79HnsO5LPALKaU8qYzA0cblMQW0Fcvs10At026cCJYyQQMkcMAC1CZz31GqbPKv-Mq-4sM6YGORQOlrRCXW7K26K6ue6KLH2H74dcz7gSbmCIloRMTCU4SqmUB-BPcO2gN12j0PSGEZ84wN0ZgQDbsKm4aDSeOwe8LbrY6QXnB06jElEryyVNMXfeKoQ_uNRCPSd1-Afji_RwJV0',
  },
]

const testCards = [
  {
    subject: 'Statistics',
    title: 'Statistical Inference & Regression',
    reward: '+450 pts',
    duration: '40m',
    level: 'Level 4',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoRPXlbN1p1vZyUf5kv60ll-jGdMsbjFx87hlz16SeYBAFYub5ttYl2sMpJ6g5VUojPKapgZQMdcYoNd2HHcM6h7I1jPmTqWKp8bDG9Pwt4CnWhmDs91lZBQrNgnCOvsStUGqGmjIKTroy90Vr6-QgFVh2ztW3ftW9nDNPVsAM45rivf_7qhW82oR_FFEbzp7c2L9ujYAW1p-ec5NByYPIeOoDLcCKXtmJ00Zd7ztSujZcsRTslBIdxf44Zb2KBWwNqCUlfCXiVuP5',
  },
  {
    subject: 'Physics',
    title: 'Thermodynamics & Kinetics',
    reward: '+600 pts',
    duration: '60m',
    level: 'Level 7',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBNju_HqyemqxqOdPMZWWB5HbGPzPg_NbDFfgI-Ohaci7fBLuAPTRWbdS6T0sDMK-T3hqHM2t5aoNeWapS5y-c7-5atoditSsnRSC6fjb7h4Uk7FPYBEqI2U-21k4tdcIEKDilV9MhtVh9tF5-FzzfLgQrmvbvAJGRIGvSVo8ufU92oe9EneHi1jkTPsBAMvj41grQELcwGXVJG987li3CtPCf7aoA_1rXwhbHHs1-m9_7b5MZNFB0LHGzPq6id0E3lcJerWq9AaBVd',
  },
  {
    subject: 'Logic',
    title: 'Abstract Reasoning Matrix',
    reward: '+320 pts',
    duration: '25m',
    level: 'Level 5',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAV6OX-wcLzXTC4b543p2YyW1upgOc7W-tbKxO7hYHEqLkIG7JEsq6yo2A2-LRt672WKzPCBYQ1DrkkyAeVG73owqhj8th2iZXbqeMTYP9Tlq0vQVCmTcv0R_WFFVd6rJsEQ0b3fW95BDzGzYtkO2pIKMj1lk-4MouDieoso-uR3wuG1OWWehz6O0abqZasKYUP0ZVtwSPeJmw58KHRpmMUSRoYPrLQHT8Q2so3fsfpvSn3_ULa0S4fUEZFcxZzjIrhZYVvXgcWCLcy',
  },
]

export default function TestsPage() {
  return (
    <AppLayout
      breadcrumb="Tests"
      topbar={{
        searchPlaceholder: 'Search assessments...',
      }}
      pageClassName="relative"
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="mb-2 text-4xl font-medium tracking-tight text-[#E8E2D4] md:text-5xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
            Tests &amp; Mocks
          </h1>
          <p className="max-w-2xl text-sm font-light text-[#919191] md:text-base">
            Advance your mastery through adaptive diagnostic assessments and precision-timed simulated environments.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="w-full rounded-md border border-[#49473F]/30 bg-[#1C1B1B] p-5 lg:w-64 lg:border-none lg:bg-transparent lg:p-0">
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">Discipline</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-[#CBC6BC]">
                    <span className="h-4 w-4 rounded-sm border border-[#49473F] bg-[#353534]" />
                    Physics &amp; Mechanics
                  </label>
                  <label className="flex items-center gap-3 text-sm text-[#E5E2E1]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-[#CCC6B9] bg-[#CCC6B9] text-[10px] text-[#333027]">
                      ✓
                    </span>
                    Theoretical Chemistry
                  </label>
                  <label className="flex items-center gap-3 text-sm text-[#CBC6BC]">
                    <span className="h-4 w-4 rounded-sm border border-[#49473F] bg-[#353534]" />
                    Advanced Mathematics
                  </label>
                  <label className="flex items-center gap-3 text-sm text-[#CBC6BC]">
                    <span className="h-4 w-4 rounded-sm border border-[#49473F] bg-[#353534]" />
                    Cognitive Science
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">Complexity</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-[#2A2A2A] px-3 py-1.5 text-xs text-[#CBC6BC]">Foundation</button>
                  <button className="rounded-full bg-[#CCC6B9] px-3 py-1.5 text-xs font-medium text-[#333027]">Professional</button>
                  <button className="rounded-full bg-[#2A2A2A] px-3 py-1.5 text-xs text-[#CBC6BC]">Elite</button>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">Duration</h3>
                <input type="range" className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-[#353534] accent-[#CCC6B9]" />
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  <span>15 mins</span>
                  <span>180 mins</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
              {heroCards.map((hero) => (
                <article key={hero.title} className="group relative h-[320px] overflow-hidden rounded-md">
                  <img src={hero.image} alt={hero.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-8">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded bg-[#CCC6B9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#333027]">
                        {hero.badge}
                      </span>
                      <span className="text-xs tracking-wider text-[#919191]">{hero.duration}</span>
                    </div>
                    <h2 className="text-3xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                      {hero.title}
                    </h2>
                    <p className="mt-2 max-w-md text-sm font-light text-[#CBC6BC]">{hero.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {testCards.map((test) => (
                <article
                  key={test.title}
                  className="group flex flex-col rounded-md bg-[#2A2A2A] p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="mb-5 h-40 overflow-hidden rounded">
                    <img
                      src={test.image}
                      alt={test.title}
                      className="h-full w-full object-cover opacity-60 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  </div>

                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#919191]">{test.subject}</span>
                    <span className="inline-flex items-center text-xs font-medium text-[#E8E2D4]">
                      <span className="material-symbols-outlined mr-1 text-sm">add_circle</span>
                      {test.reward}
                    </span>
                  </div>

                  <h3 className="mb-3 flex-grow text-xl leading-tight text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    {test.title}
                  </h3>

                  <div className="mb-5 flex items-center gap-4 text-xs text-[#919191]">
                    <span className="inline-flex items-center">
                      <span className="material-symbols-outlined mr-1 text-sm">timer</span>
                      {test.duration}
                    </span>
                    <span className="inline-flex items-center">
                      <span className="material-symbols-outlined mr-1 text-sm">bar_chart</span>
                      {test.level}
                    </span>
                  </div>

                  <button className="w-full rounded-sm bg-[#494949] py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#C8C6C5] transition-colors hover:bg-[#CCC6B9] hover:text-[#333027]">
                    Start Test
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button className="group flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#919191] transition-colors group-hover:text-[#E8E2D4]">
                  View All Assessments
                </span>
                <span className="material-symbols-outlined mt-2 text-[#919191]">keyboard_double_arrow_down</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
