import { AppLayout } from '@/components/layout/AppLayout'

const pathways = [
  {
    tag: 'Physics & Logic',
    title: 'Systems Theory',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWsD9_6xtAM7jlO3PxEGAVZHZhkNMfyroVO0ko1QRYwVC8ikc1aaxAWkvx_7oyzuOzQPOxIFb53dHPwebem57hViGDO16SFV-ppFMHx1kfUIHgP_r8YHlmZTBWg4VQBte9M6TRiAUhuJvUVMUpwQ25vea9RXaaoxIlvoululsIaLlvBt0kSQSvlhWU8NpFAst1RocqnMN4iJSYyJm130d69htNrz-BXqM36qA00lzM-b8PRsn8yMkRahzvGwfiZxVtMqH6feyOHRwz',
  },
  {
    tag: 'Life Sciences',
    title: 'Bio Genetics',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6mHtpB7hqiFaWPEPGtOmg6po0-JFB5SY82jO0I6ind-YDuIzjPdXKFreTJ0vH55VKCk_YrkvRip2UCH1fSn5SsnDdi08KHIvtN1thAPeWhQ1-bcBJh1mJD0_VTgmOQKP8d2G8nv5BFnbVvDzS5NZO0iyBhuebSLw19epGCP-X78nDaG2m-9Ltujlo0HUH8YdLTkVMKer6UMDrfgcVuObcUzfLimb6kX5FE-2T6_3ZRa3nIjFwN1-gJl2mK8e69pZeCjr8VTzpOUuW',
  },
  {
    tag: 'Macro Economics',
    title: 'Global Trade',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLlAbwoZdYagTLuQF7oDyrgbSz7wBQPVOTzgW_rb5eQ4uZK6-f-aD0U0D35h2SYFaKq5XBEsTo2Bg0SPR4rqFePoiv6EpfR-UBVOnDdbaEoAjD3sLk0Aj0QaPvvzbj7afh_meVGhCSaMQwAlRLBpdw64ZBhSPSRptcxHW0vYkXWQ0nFUC2-quJFk5l0hB_wyuf9bz5sFSZiAmHQBeZeoT04QvRRp_z2OyQ4dRGJPfDBpK9kEiLv4tSklp6jqAsdz3ejAOpPcH1Y_ri',
  },
  {
    tag: 'Research Meta',
    title: 'Discovery Phase',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBVSDts5ze5tqQ9lwK0Ns0VJvcudCuITNjYHVNKZhY9nneCCg_5MZoMoz0KwSNuyZs1dJYQvq9FE4x9O_m0QkKmH77A6zSBAXRfdWQkI3eOkTbjb28aCcYfVm3YgU4df8NFqIcoeM_IuN3-Fo4qu5eyAi3UbGIQu3C1l4fSjGhIQXGQqJAEo_cBdkHAZlgeuKr_u24reWqGHPhQZdvAQUWIhzlingidxO5QJ1euAZNx0AQDenUKxajt5sMXhYrBGRbq8f-1Aj2E3KRY',
  },
]

export default function DashboardPage() {
  return (
    <AppLayout
      topbar={{
        showSearch: false,
        leftSlot: (
          <div className="flex min-w-0 items-center gap-4 md:gap-10">
            <h1 className="hidden text-lg font-semibold text-[#E8E2D4] md:block" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Cognify
            </h1>
            <p className="hidden max-w-xl truncate text-lg tracking-tight text-[#CCC6B9] md:block" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Welcome back, Uttej. You&apos;re 15% closer to your target rank.
            </p>
          </div>
        ),
        rightSlot: (
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Notifications"
              className="material-symbols-outlined text-[20px] text-[#CCC6B9] transition-colors hover:text-[#E8E2D4]"
            >
              notifications
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#A1A1A1]">Uttej A.</span>
              <span className="material-symbols-outlined text-[#CCC6B9]">account_circle</span>
            </div>
          </div>
        ),
      }}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-md bg-[#2A2A2A] p-8 lg:col-span-7 lg:min-h-[380px] lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCC6B9]">Active Focus Session</p>
                <h2 className="mt-3 text-5xl text-[#E8E2D4] md:text-6xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  01:42:58
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#201F1F] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#E8E2D4]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#CBC6BC]">Session Integrity</span>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <button className="rounded-md bg-[#E8E2D4] px-6 py-3 text-sm font-medium text-[#333027] transition-opacity hover:opacity-90">
                Finalize Session
              </button>
              <button className="rounded-md bg-[#494949] px-6 py-3 text-sm font-medium text-[#B9B8B7] transition-colors hover:bg-[#353534]">
                Pause
              </button>
            </div>
          </div>

          <div className="rounded-md border-l-4 border-[#CCC6B9]/30 bg-[#201F1F] p-8 lg:col-span-5 lg:p-10">
            <div className="mb-5 flex items-center gap-2 text-[#CCC6B9]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">AI Intelligence Suggestion</span>
            </div>

            <h3 className="text-3xl leading-tight text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Mastery Gap Detected:
              <br />
              <span className="italic">Rotational Dynamics</span>
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-[#CBC6BC]">
              Your last performance in Classical Mechanics indicates a 22% decay in torque vector visualization. We
              recommend a 15-minute conceptual deep-dive into angular momentum conservation.
            </p>

            <button className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#CCC6B9]">
              Review Suggested Pathway
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-md bg-[#1C1B1B] p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBC6BC]">Consistency</p>
              <p className="mt-1 text-3xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                14 Day Streak
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#353534]">
              <span className="material-symbols-outlined text-2xl text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#1C1B1B] p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBC6BC]">Performance</p>
              <p className="mt-1 text-3xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                92% Accuracy
              </p>
              <p className="mt-1 text-[10px] font-bold text-green-500">+4% from last week</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#353534]">
              <span className="material-symbols-outlined text-2xl text-[#CCC6B9]">insights</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#1C1B1B] p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBC6BC]">Status</p>
              <p className="mt-1 text-3xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Processing Queue
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#353534]">
              <span className="material-symbols-outlined text-2xl text-[#CBC6BC]">hourglass_empty</span>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between border-b border-[#49473F]/30 pb-4">
            <h4 className="text-3xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Accelerated Pathways
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#CCC6B9]">4 Paths Available</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pathways.map((pathway) => (
              <div key={pathway.title} className="group relative h-56 cursor-pointer overflow-hidden rounded-md">
                <img
                  src={pathway.image}
                  alt={pathway.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale transition-all duration-500 group-hover:scale-105 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#CCC6B9]">{pathway.tag}</p>
                  <p className="mt-1 text-2xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    {pathway.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-md bg-[#2A2A2A]">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="p-8 lg:col-span-3 lg:p-12">
              <div className="mb-5 inline-flex rounded-full bg-[#CCC6B9]/10 px-3 py-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCC6B9]">Deep Cognify Insight</span>
              </div>

              <h2 className="max-w-2xl text-3xl leading-tight text-[#E5E2E1] lg:text-4xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                The neuroplasticity of your analytical reasoning is peaking in the morning hours.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#CBC6BC] lg:text-base">
                We analyzed 450 unique response points over the last 30 days. Your ability to synthesize abstract
                concepts is 40% higher between 07:00 and 09:30. Consider scheduling your Advanced Systems module during
                this window for optimal retention.
              </p>

              <button className="mt-7 rounded-md border border-[#49473F] bg-[#353534] px-6 py-3 text-sm text-[#E5E2E1] transition-colors hover:bg-[#3A3939]">
                Explore Neural Profile
              </button>
            </div>

            <div className="relative min-h-[260px] lg:col-span-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuARsuq_eEKo9wBEVIticdPBj5P9l0GV7CuTrvMTQ9rI6poqi0wuqMjG2fOTbcQexreky4uEfC1qcCwz2xZ__C4DT0XLICok0bxfMrWe5lWHInKUgWjZJpUSQKBEsim6h-IW7YL1MNmp5k0D-frADBDZs6ZKBtOy4zx2Udf9EKhieGhA0KBPKrzT1NiE142i7HvIWMiGXH90IBNNIDmZdgVnzBH4CYMb2Xs_aLZ-y0ExaDdVDsZs-FCC5dGMx0pt5VlYU0djAu1UN66e"
                alt="Neural map"
                className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2A2A2A] to-transparent" />
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
