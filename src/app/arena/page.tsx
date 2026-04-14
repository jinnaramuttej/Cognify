import { AppLayout } from '@/components/layout/AppLayout'
export default function ArenaPage() {
  return (
    <AppLayout
      breadcrumb="Arena"
      topbar={{
        title: 'Cognify',
        searchPlaceholder: 'SEARCH ARENA',
        navItems: [
          { label: 'Dashboard' },
          { label: 'Tests' },
        ],
      }}
      contentClassName="px-6 pb-32 pt-8 md:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-10 h-[320px] overflow-hidden rounded-md bg-[#1C1B1B] md:h-[340px]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYsUV3c0hrbk06nxZlcLES2dbDqIAQ7rzWLATXchVuI4rmPlYRtoddVSkxCALYYJ_-RUglPZ7z7TgYeZW1Fp6vWaIMOExZwts1itk_ORwrCOaJShRVQGu6iVsX_jh8NqFYxl0t73_unMkzbVO1T2kKOfuCp1qRBOuFd48qHaJEaSwFPd_mgVIpggdxkBT8cOMAd-sj6VUr_aCGmTPpTZmPTUp91cCq4xW_uCTvh3iNW_nDj6Xz3WdbnsTvVitx5DOgQ4KsGmS9xieQ"
            alt="Thermodynamics hero"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-[#0D0D0D]/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131313]/80 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center p-8 md:p-12">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#CCC6B9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#565248]">
                Active Event
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCC6B9]">Season 04</span>
            </div>

            <h1 className="text-4xl font-bold leading-none text-[#E8E2D4] md:text-6xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Thermodynamics Sprint
            </h1>

            <p className="mt-4 text-sm font-light leading-relaxed text-[#CBC6BC] md:text-base">
              Master the laws of entropy and heat transfer in this high-stakes competitive cycle. Top performers gain
              entry to the Maxwell Scholars circle.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-5">
              <button className="bg-[#E8E2D4] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#333027] transition hover:brightness-110">
                Enter Arena
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Time Remaining</p>
                <p className="font-mono text-[#E8E2D4]">14:22:09</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-end justify-between border-b border-[#49473F]/30 pb-4">
              <h2 className="text-3xl text-[#CCC6B9]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Current Leaders
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Live Updates Every 5m</span>
            </div>

            <div className="flex h-[300px] items-end justify-center gap-3 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTMsnvcnfMGc4qSilSgT43XLhhN3rFC6boc_MR7v9su1FyOno10EF0nb4b_adUF9RgGhsjQ8h5F10BaqFZF0_Ld6Zt_JSRNzioWY1l6Ba9RTzqxJKwOQqi_G8jYRIg-OOACwzU6gNzk3iyT5-h9YmzipofCsTMyoU9LLP_WZyFyaWYHfeJUKIqQ6MKeQA1Hk7BaiWePvikcXjNViYPxYHAnMM_KXvghJq1s_n2i2cIZcoF1CBYkdTAO6VTVVBnpi4V-iU06TSbnMZ3"
                    alt="Rank 2"
                    className="h-16 w-16 rounded-full border-2 border-[#6D6B68] grayscale transition-all hover:grayscale-0 md:h-20 md:w-20"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#B5B3AF] text-xs font-bold text-[#333027]">
                    2
                  </span>
                </div>
                <div className="flex h-[160px] w-28 flex-col items-center bg-[#201F1F] pt-5 md:w-32">
                  <span className="text-xs font-bold text-[#B5B3AF]">ELARA V.</span>
                  <span className="mt-1 text-lg text-[#CCC6B9]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    2,840
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQgtSjymAzA3mnJAsnq0uNUH3IH9M4QOuQmz0TtUaBOGAKaTVgbHkzzGMYj9Fsy5dhFqd-Es_WVCcJ4plWglR7Qn_TT7nghBm9IN0BAIK924aZjdp_NQdgGg4WKQZ3Z_Guk10cnhj3Wl-GdmngmdYBz3h8EiS3I-OLlfZJiXZWnZAyuB-nkd69dDWB7kMG8r6O6AqLmH8tv8rfspZAPrzZDP75Xf0pIkijgVldGgMfdSgK5WdThYCvTxZO4G4557dxoamZHfjpo15w"
                    alt="Rank 1"
                    className="h-24 w-24 rounded-full border-2 border-[#CCC6B9] transition-transform hover:scale-105 md:h-32 md:w-32"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#FFD700] bg-[#FFD700] text-sm font-bold text-[#333027]">
                    1
                  </span>
                </div>
                <div className="flex h-[220px] w-36 flex-col items-center bg-[#2A2A2A] pt-7 md:w-44">
                  <span className="text-sm font-bold text-[#E8E2D4]">MARCUS T.</span>
                  <span className="mt-1 text-2xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    3,120
                  </span>
                  <span className="material-symbols-outlined mt-2 text-[#E8E2D4]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5MZe3_m2yleDWYaroP8Me6Qxzj58GaWBa3SC2C3irysdbZ0QOmNjTdGyFcYvJrEzHny74sdce3M46s9XQVrn42moWPhdO2ocD-PKTm8S9K8V_CnHxI9KA8tJNcHXfTTDU7vmcEj_1F22c6mWis2v9BVioUnhfIiTffkTue67ngTY06JXUqF6Yc867Biz9zttfCnhmUdqSKR6BRxckBvnvTzRauQG0ba4uU0lw_jmS8Di0u1sbVeyIeMkI2T_2uovxYNJxd80uqvPh"
                    alt="Rank 3"
                    className="h-[72px] w-[72px] rounded-full border-2 border-[#5F5B54] grayscale transition-all hover:grayscale-0"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#CD7F32] text-[10px] font-bold text-[#333027]">
                    3
                  </span>
                </div>
                <div className="flex h-[130px] w-28 flex-col items-center bg-[#1C1B1B] pt-5 md:w-32">
                  <span className="text-xs font-bold text-[#919191]">SOPHIA L.</span>
                  <span className="mt-1 text-lg text-[#B5B3AF]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    2,615
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <article className="rounded-md bg-[#201F1F] p-6 md:p-8">
              <h3 className="mb-5 text-xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Weekly Protocol
              </h3>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <span className="text-2xl text-[#CCC6B9]/50" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    01
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5E2E1]">Carnot Cycle Mastery</p>
                    <p className="mt-1 text-xs text-[#919191]">Complete 5 perfect runs without simulation errors.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl text-[#CCC6B9]/50" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    02
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5E2E1]">Entropy Specialist</p>
                    <p className="mt-1 text-xs text-[#919191]">Calculate 50 statistical state transformations.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl text-[#CCC6B9]/50" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    03
                  </span>
                  <div className="w-full">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">Protocol Unlocked</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#353534]">
                      <div className="h-full w-3/4 bg-[#CCC6B9]" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-md border border-[#49473F]/30 bg-[#0E0E0E] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBC6BC]">Live Observer</span>
                </div>
                <span className="text-[10px] text-[#919191]">2.4k Watching</span>
              </div>

              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtjS6XCFPCvJckSR2f0xp3tlLItycEHCjq7hAdNtYw0Ol06e3Qy3zWHbRQn5qBQB8CPhJ2f2Qye-TTohYx1grJW_GFiVwFNqKwvi8kb3h1_9hVtvcokH4If1GrdKo7LtxfRAzOpK47z5doalSxhZjexbVySnEO21DQ847e7R8vTC2KKVTFoXrGHG9ngmr_yGVvRThcBFG2ZV54_8QNxbEmUfa1pe5HC1wgNLrqHhOdvB2Nj9ZTyqdntIKosW7blU48WvaL5dk3FULf"
                alt="Live observer"
                className="mb-3 h-32 w-full rounded object-cover grayscale transition-all hover:grayscale-0"
              />
              <p className="text-sm text-[#CBC6BC]">Session #82: High-Entropy Systems Analysis</p>
            </article>
          </div>
        </section>

        <section className="overflow-hidden rounded-md bg-[#1C1B1B]">
          <div className="flex flex-col gap-4 border-b border-[#49473F]/30 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
            <h2 className="text-2xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Tier Standings
            </h2>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="border-b-2 border-[#E8E2D4] pb-1 text-[#E8E2D4]">Global</span>
              <span className="text-[#919191]">Regional</span>
              <span className="text-[#919191]">Scholars</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[#49473F]/20 text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                  <th className="px-8 py-4 font-bold">Rank</th>
                  <th className="px-8 py-4 font-bold">Participant</th>
                  <th className="px-8 py-4 font-bold">Velocity</th>
                  <th className="px-8 py-4 font-bold">Accuracy</th>
                  <th className="px-8 py-4 text-right font-bold">Arena Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['04', 'ELIAS KERN', '142 bpm', '98.4%', '2,480'],
                  ['05', 'CLARA MONTOYA', '138 bpm', '97.2%', '2,410'],
                  ['06', 'JOSHUA REED', '156 bpm', '94.1%', '2,395'],
                ].map((row, index) => (
                  <tr key={row[1]} className={`transition-colors hover:bg-[#201F1F] ${index === 1 ? 'bg-[#201F1F]/30' : ''}`}>
                    <td className="px-8 py-5 font-mono text-[#919191]">{row[0]}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded border border-[#49473F]/30 bg-[#2A2A2A]" />
                        <span className="font-medium text-[#E5E2E1]">{row[1]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[#CBC6BC]">{row[2]}</td>
                    <td className="px-8 py-5 text-[#CBC6BC]">{row[3]}</td>
                    <td className="px-8 py-5 text-right text-lg text-[#CCC6B9]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                      {row[4]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 left-16 right-0 z-30 border-t border-[#CCC6B9]/20 bg-[#2A2A2A]/95 px-6 py-4 backdrop-blur-md md:left-[200px] md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3 border-r-0 pr-0 md:border-r md:border-[#49473F]/40 md:pr-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmlNPF93qg1QN27Rxh1Z8Sey8DQmRfXVqETafKlc7oBetm7_6uw7Q2dPr0bHz8ZWKxH9URB2toZlKqj1g9b633SPpVOtUYBi5YkoBfuhmOxdneGoMCNksjPbg7uWHreOWkpg8PbdExeNl11xOMCChK_aMR19ff8N5sdwwG1fZpa7GOHCsMzJQNxXZ8tVXQvFL5wNXgyyQMZ3xpK6mM9l9BWcUpHuInvr-w0WqlIxQ9FK17WHi4_RaK5OIzRPcuRnh6wenVKB7hsVL3"
              alt="Your avatar"
              className="h-10 w-10 rounded-full border border-[#CCC6B9]/40"
            />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Your Position</p>
              <p className="text-xl font-bold text-[#E8E2D4]">RANK #42</p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 md:px-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Score to Next Rank</p>
              <p className="text-sm text-[#E5E2E1]">+140 Points</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Daily Trend</p>
              <p className="inline-flex items-center text-sm font-bold text-green-500">
                <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                +12 Positions
              </p>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.2em] text-[#919191]">
                <span>Tier Progress</span>
                <span>84%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[#353534]">
                <div className="h-full w-5/6 bg-[#E8E2D4]" />
              </div>
            </div>
          </div>

          <button className="w-full bg-[#E8E2D4] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#333027] transition-colors hover:bg-[#CCC6B9] md:w-auto">
            Resume Session
          </button>
        </div>
      </footer>
    </AppLayout>
  )
}
