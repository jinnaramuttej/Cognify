import { AppLayout } from '../../components/layout/AppLayout'

const subjects = [
  {
    icon: 'architecture',
    title: 'Physics',
    description: 'The fundamental laws governing the universe.',
    bgIcon: 'flare',
    column: 'md:col-span-4',
  },
  {
    icon: 'science',
    title: 'Chemistry',
    description: 'Molecular dynamics and organic synthesis pathways.',
    bgIcon: 'biotech',
    column: 'md:col-span-5',
  },
  {
    icon: 'calculate',
    title: 'Math',
    description: 'Abstract structures and logic.',
    bgIcon: 'functions',
    column: 'md:col-span-3',
  },
]

const conceptCards = [
  {
    title: 'Drift Velocity',
    body: 'Understanding the microscopic flow of electrons under external E-field. Calculation of drift speed and mobility.',
    tag: 'Core Concept 01',
    highlighted: true,
  },
  {
    title: 'Network Analysis',
    body: 'Complex circuit solving using Loop and Junction rules. Wheatstone bridge sensitivity analysis.',
    tag: 'Core Concept 02',
  },
  {
    title: 'Electromotive Force',
    body: 'Internal resistance of cells, grouping in series and parallel, and maximum power transfer theorem.',
    tag: 'Core Concept 03',
  },
  {
    title: 'Thermal Effects',
    body: 'Joule\'s heating law, electric power dissipation, and fuse characteristics in high-voltage circuits.',
    tag: 'Core Concept 04',
  },
]

const resources = [
  {
    icon: 'menu_book',
    title: 'NCERT Chapter 03: Current Electricity',
    meta: 'Standard Reference • 24 Pages',
    actionIcon: 'open_in_new',
  },
  {
    icon: 'video_library',
    title: "Video Lecture: Kirchhoff's Complex Networks",
    meta: 'Advanced Masterclass • 42 Minutes',
    actionIcon: 'play_circle',
  },
  {
    icon: 'assignment',
    title: 'Problem Set: JEE Previous Year Archives',
    meta: 'Practice Module • 50 MCQ',
    actionIcon: 'download',
  },
]

export default function LibraryPage() {
  return (
    <AppLayout
      breadcrumb="Library"
      topbar={{
        searchPlaceholder: 'SEARCH SYLLABUS...',
        navItems: [
          { label: 'Syllabus', active: true },
          { label: 'Resources' },
        ],
      }}
    >
      <div className="mx-auto max-w-7xl pb-20">
        <section className="mb-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#CCC6B9]">Intellectual Repository</p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-[#E8E2D4] md:text-5xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
            Syllabus Library
          </h1>

          <div className="flex flex-wrap gap-2 border-b border-[#49473F]/30 pb-4">
            <button className="rounded-full bg-[#CCC6B9] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#565248] md:px-6">
              JEE Advanced
            </button>
            <button className="rounded-full bg-[#2A2A2A] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#919191] transition-colors hover:text-[#E5E2E1] md:px-6">
              NEET UG
            </button>
            <button className="rounded-full bg-[#2A2A2A] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#919191] transition-colors hover:text-[#E5E2E1] md:px-6">
              Olympiads
            </button>
          </div>
        </section>

        <section className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          {subjects.map((subject) => (
            <article key={subject.title} className={`group cursor-pointer md:col-span-12 ${subject.column}`}>
              <div className="relative h-64 overflow-hidden rounded-md bg-[#2A2A2A] p-8 transition-colors duration-300 group-hover:bg-[#3A3939]">
                <div className="relative z-10">
                  <span className="material-symbols-outlined mb-4 text-4xl text-[#CCC6B9]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {subject.icon}
                  </span>
                  <h2 className="text-3xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    {subject.title}
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-[#919191]">{subject.description}</p>
                </div>

                <div className="absolute -bottom-8 -right-8 opacity-5 transition-opacity group-hover:opacity-10">
                  <span className="material-symbols-outlined text-[180px]">{subject.bgIcon}</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <h3 className="mb-6 flex items-center text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">
                <span className="mr-3 h-px w-8 bg-[#49473F]" />
                Physics Hierarchy
              </h3>

              <div className="space-y-6">
                <div>
                  <button className="flex w-full items-center justify-between text-left text-lg text-[#CBC6BC] transition-transform hover:translate-x-1">
                    <span style={{ fontFamily: 'Newsreader, Georgia, serif' }}>Unit 01: Electrostatics</span>
                    <span className="material-symbols-outlined text-[#919191]">expand_more</span>
                  </button>
                  <div className="ml-4 mt-4 space-y-3 border-l border-[#49473F]/40 pl-4 text-sm text-[#919191]">
                    <p>Coulomb&apos;s Law</p>
                    <p>Electric Fields</p>
                    <p>Gauss Theorem</p>
                  </div>
                </div>

                <div>
                  <button className="flex w-full items-center justify-between text-left text-lg text-[#E8E2D4]">
                    <span style={{ fontFamily: 'Newsreader, Georgia, serif' }}>Unit 02: Current Electricity</span>
                    <span className="material-symbols-outlined text-[#E8E2D4]">expand_less</span>
                  </button>
                  <div className="ml-4 mt-4 space-y-3 border-l border-[#CCC6B9]/40 pl-4 py-1 text-sm text-[#919191]">
                    <p className="flex items-center font-semibold text-[#CCC6B9]">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#E8E2D4]" />
                      Current Flow &amp; Drift
                    </p>
                    <p className="pl-3">Ohm&apos;s Law &amp; Resistance</p>
                    <p className="pl-3">Kirchhoff&apos;s Rules</p>
                    <p className="pl-3">Potentiometer</p>
                  </div>
                </div>

                <button className="flex w-full items-center justify-between text-left text-lg text-[#CBC6BC] transition-transform hover:translate-x-1">
                  <span style={{ fontFamily: 'Newsreader, Georgia, serif' }}>Unit 03: Magnetic Effects</span>
                  <span className="material-symbols-outlined text-[#919191]">expand_more</span>
                </button>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <article className="rounded-md bg-[#201F1F] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:p-10">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-[#E5E2E1] md:text-4xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    Current Electricity
                  </h2>
                  <p className="mt-2 text-sm text-[#919191]">Study of electric charge in motion and circuit laws.</p>
                </div>

                <button className="rounded-md border border-[#49473F]/40 bg-[#2A2A2A] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191] transition-colors hover:bg-[#CCC6B9] hover:text-[#333027]">
                  Download Syllabus PDF
                </button>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {conceptCards.map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-md bg-[#2A2A2A] p-6 transition-colors hover:bg-[#3A3939] ${
                      card.highlighted ? 'border-l-2 border-[#CCC6B9]' : ''
                    }`}
                  >
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">{card.tag}</p>
                    <h3 className="mb-2 text-lg text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                      {card.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#A4A09B]">{card.body}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">Related Scholarly Resources</h4>
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <button
                      key={resource.title}
                      className="group flex w-full items-center gap-4 rounded-md bg-[#0E0E0E] p-4 text-left transition-colors hover:bg-[#353534]"
                    >
                      <span className="material-symbols-outlined text-[#E8E2D4]">{resource.icon}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-[#CBC6BC] transition-colors group-hover:text-[#E8E2D4]">{resource.title}</span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase text-[#6D6B68]">{resource.meta}</span>
                      </span>
                      <span className="material-symbols-outlined text-[#6D6B68] transition-colors group-hover:text-[#E8E2D4]">{resource.actionIcon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E2D4] text-[#333027] shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:scale-95 md:h-14 md:w-14">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
        </button>
      </div>
    </AppLayout>
  )
}
