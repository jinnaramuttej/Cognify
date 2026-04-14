import { AppLayout } from '@/components/layout/AppLayout'

export default function AnalyticsPage() {
  return (
    <AppLayout
      breadcrumb="Analytics"
      topbar={{
        searchPlaceholder: 'Search metrics...',
        navItems: [
          { label: 'Overview', active: true },
          { label: 'Topic Trends' },
          { label: 'Cohort' },
        ],
      }}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-md bg-[#201F1F] p-8 md:p-10">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCC6B9]">Performance Intelligence</p>
          <h1 className="text-4xl text-[#E8E2D4] md:text-5xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
            Deep Analytics
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#CBC6BC] md:text-base">
            Precision breakdown of speed, conceptual retention, and weakness trajectories based on your latest adaptive
            assessments.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Overall Accuracy', '92%'],
            ['Avg Speed', '1.48x'],
            ['Cohort Percentile', '96'],
            ['Rank Delta', '+12'],
          ].map((metric) => (
            <article key={metric[0]} className="rounded-md border border-[#49473F]/40 bg-[#2A2A2A] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#CBC6BC]">{metric[0]}</p>
              <p className="mt-2 text-3xl font-semibold text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                {metric[1]}
              </p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <article className="rounded-md bg-[#201F1F] p-6 lg:col-span-7 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Weekly Trendline
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Last 7 Sessions</span>
            </div>

            <div className="rounded-md border border-[#49473F]/30 bg-[#131313] p-4">
              <div className="flex h-48 items-end gap-2 md:gap-3">
                {[52, 58, 61, 66, 71, 74, 78].map((bar, index) => (
                  <div key={bar} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-[#CCC6B9]/85" style={{ height: `${bar}%` }} />
                    <span className="text-[10px] text-[#919191]">D{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-md bg-[#201F1F] p-6 lg:col-span-5 md:p-8">
            <h2 className="mb-5 text-2xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Topic Exposure
            </h2>
            <div className="space-y-4">
              {[
                ['Mechanics', 82],
                ['Electrochemistry', 64],
                ['Probability', 58],
                ['Organic Synthesis', 73],
              ].map((item) => (
                <div key={item[0]}>
                  <div className="mb-1 flex items-center justify-between text-xs text-[#CBC6BC]">
                    <span>{item[0]}</span>
                    <span>{item[1]}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#353534]">
                    <div className="h-full bg-[#CCC6B9]" style={{ width: `${item[1]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            ['Rotational Dynamics', 'Low confidence'],
            ['Organic Nomenclature', 'Medium confidence'],
            ['Probability Edge Cases', 'Low confidence'],
          ].map((topic) => (
            <article key={topic[0]} className="rounded-md border border-[#49473F]/30 bg-[#2A2A2A] p-5">
              <h3 className="text-xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                {topic[0]}
              </h3>
              <p className="mt-2 text-sm text-[#CBC6BC]">{topic[1]}</p>
              <button className="mt-4 rounded-md border border-[#49473F] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#E8E2D4] transition-colors hover:bg-[#353534]">
                Practice Set
              </button>
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  )
}
