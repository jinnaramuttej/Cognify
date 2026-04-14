import { AppLayout } from '@/components/layout/AppLayout'

export default function SettingsPage() {
  return (
    <AppLayout
      breadcrumb="Settings"
      topbar={{
        title: 'Settings',
        searchPlaceholder: 'Search preference...',
        showSearch: true,
      }}
      contentClassName="px-6 py-8 md:px-10"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <aside className="space-y-6">
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-lg bg-[#CCC6B9] px-4 py-3 text-left text-sm font-medium text-[#565248]">
              <span className="material-symbols-outlined">person</span>
              Profile
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-[#2A2A2A]">
              <span className="material-symbols-outlined">security</span>
              Security
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-[#2A2A2A]">
              <span className="material-symbols-outlined">track_changes</span>
              Learning Targets
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-[#2A2A2A]">
              <span className="material-symbols-outlined">smart_toy</span>
              AI Preferences
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-[#2A2A2A]">
              <span className="material-symbols-outlined">notifications_active</span>
              Notifications
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-[#CBC6BC] transition-colors hover:bg-[#2A2A2A]">
              <span className="material-symbols-outlined">payments</span>
              Billing
            </button>
          </div>

          <div className="rounded-xl bg-[#201F1F] p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#919191]">Account Status</p>
            <div>
              <div className="mb-1 flex items-end justify-between">
                <span className="text-xs text-[#CBC6BC]">Profile Mastery</span>
                <span className="text-lg font-bold text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  85%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#353534]">
                <div className="h-full w-[85%] bg-[#E8E2D4]" />
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-10">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <article className="rounded-xl bg-[#201F1F] p-8 text-center xl:col-span-5">
              <div className="relative mx-auto mb-6 w-fit">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAboL4xja4IRPGLZ0WMB_sl4l81AsmkzQeo32MOEsEzjMroabHAZ1NId_2IRKPCvd1CNiqK12EDdzehz89r_58j53f5OO1VwwfU_9Hy5nKSahqL4I622JEkCCwY8SZr2k2wBCC0nd6ETx2imWDrJPpoiVF9zTdqU7rZsApMS7ya-I_O-GDgv15n6_Ixudm2jreibhoKRqe8Q2hJ1uKKpMaRnvVC1Zz-LCJWcfu4xxKyNKGm0CRipxgbE37dJDAGVta-wdSqoeanvW1"
                  alt="Profile avatar"
                  className="h-28 w-28 rounded-full border-2 border-[#CCC6B9] p-1 object-cover grayscale brightness-75 md:h-32 md:w-32"
                />
                <button className="material-symbols-outlined absolute bottom-1 right-1 rounded-full bg-[#E8E2D4] p-1.5 text-sm text-[#333027]">
                  photo_camera
                </button>
              </div>

              <h2 className="text-3xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Julian Thorne
              </h2>
              <p className="mt-1 text-sm text-[#CBC6BC]">julian.thorne@cognify.io</p>

              <div className="mt-6 grid grid-cols-3 border-t border-[#49473F]/40 pt-6">
                <div>
                  <span className="block text-xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    124
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Sessions</span>
                </div>
                <div>
                  <span className="block text-xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    4.9
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Cogni-Score</span>
                </div>
                <div>
                  <span className="block text-xl text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    Elite
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Status</span>
                </div>
              </div>
            </article>

            <article className="rounded-xl bg-[#2A2A2A] p-8 md:p-10 xl:col-span-7">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  Personal Identity
                </h3>
                <button className="rounded-lg bg-[#E8E2D4] px-5 py-2 text-sm font-bold text-[#333027] transition-opacity hover:opacity-90">
                  Save Changes
                </button>
              </div>

              <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Full Name</span>
                    <input
                      defaultValue="Julian Thorne"
                      className="w-full rounded-lg border border-transparent bg-[#353534] px-4 py-3 text-sm text-[#E5E2E1] outline-none transition-colors focus:border-[#49473F]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Target Score</span>
                    <input
                      defaultValue="1450"
                      className="w-full rounded-lg border border-transparent bg-[#353534] px-4 py-3 text-sm font-bold text-[#E8E2D4] outline-none transition-colors focus:border-[#49473F]"
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Professional Email</span>
                  <input
                    defaultValue="julian.thorne@cognify.io"
                    className="w-full rounded-lg border border-transparent bg-[#353534] px-4 py-3 text-sm text-[#E5E2E1] outline-none transition-colors focus:border-[#49473F]"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#919191]">Scholarly Biography</span>
                  <textarea
                    rows={4}
                    defaultValue="Focusing on advanced spatial reasoning and algorithmic logic patterns. Currently preparing for the 2026 cognitive olympics with a specialization in deductive synthesis."
                    className="w-full resize-none rounded-lg border border-transparent bg-[#353534] px-4 py-3 text-sm text-[#E5E2E1] outline-none transition-colors focus:border-[#49473F]"
                  />
                </label>
              </form>
            </article>
          </div>

          <div>
            <div className="mb-5 flex items-center gap-4">
              <h3 className="text-2xl" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Security Protocols
              </h3>
              <div className="h-px flex-1 bg-[#49473F]/40" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <article className="rounded-xl bg-[#201F1F] p-6 md:p-8">
                <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#CBC6BC]">Update Password</h4>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full rounded-lg border border-transparent bg-[#353534] px-4 py-3 text-sm text-[#E5E2E1] outline-none focus:border-[#49473F]"
                />

                <div className="mt-3 space-y-1">
                  <div className="flex h-1 gap-1">
                    <span className="flex-1 rounded-full bg-[#E8E2D4]" />
                    <span className="flex-1 rounded-full bg-[#E8E2D4]" />
                    <span className="flex-1 rounded-full bg-[#E8E2D4]" />
                    <span className="flex-1 rounded-full bg-[#353534]" />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#E8E2D4]">Strong Protocol</span>
                    <span className="text-[#919191]">Min. 12 characters</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#49473F]/40 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#E5E2E1]">Two-Factor Authentication</p>
                      <p className="mt-1 text-xs text-[#919191]">Enhance account security via biometric or TOTP.</p>
                    </div>
                    <button className="relative h-6 w-12 rounded-full bg-[#E8E2D4]">
                      <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-[#333027]" />
                    </button>
                  </div>
                </div>
              </article>

              <article className="rounded-xl bg-[#201F1F] p-6 md:p-8">
                <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#CBC6BC]">Active Access Nodes</h4>
                <div className="space-y-5">
                  {[
                    ['laptop_mac', 'MacBook Pro 16"', 'San Francisco, USA • Active now', 'Current'],
                    ['smartphone', 'iPhone 15 Pro', 'San Francisco, USA • 2 hours ago', 'Revoke'],
                    ['desktop_windows', 'Workstation Alpha', 'London, UK • June 12, 2026', 'Revoke'],
                  ].map((session) => (
                    <div key={session[1]} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#353534]">
                          <span className="material-symbols-outlined text-[#CCC6B9]">{session[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#E5E2E1]">{session[1]}</p>
                          <p className="text-[10px] text-[#919191]">{session[2]}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${session[3] === 'Current' ? 'text-[#E8E2D4]' : 'text-[#FFB4AB]'}`}>
                        {session[3]}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>

          <footer className="border-t border-[#49473F]/30 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-xs text-[#919191]">© 2026 Cognify AI. All intellectual properties reserved.</p>
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBC6BC]">
                <button className="transition-colors hover:text-[#E8E2D4]">Neural Policy</button>
                <button className="transition-colors hover:text-[#E8E2D4]">Architecture</button>
                <button className="transition-colors hover:text-[#E8E2D4]">Ethics Codex</button>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </AppLayout>
  )
}
