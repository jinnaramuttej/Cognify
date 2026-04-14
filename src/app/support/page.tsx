import { AppLayout } from '@/components/layout/AppLayout'
import { CognifyCard } from '@/components/ui/cognify-card'

export default function SupportPage() {
  const channels = [
    { title: 'Live Support', meta: 'Average response: 4 min', cta: 'Start Chat' },
    { title: 'Report an Issue', meta: 'Attach screenshots and logs', cta: 'Create Ticket' },
    { title: 'Guides & FAQs', meta: 'Setup, billing, and exam workflows', cta: 'Browse Docs' },
  ]

  return (
    <AppLayout breadcrumb="Support">
      <section className="mb-8 space-y-2">
        <p className="font-label text-xs uppercase tracking-[0.3em] text-[#CBC6BC]">Help Center</p>
        <h1 className="font-headline text-4xl font-bold text-[#E8E2D4]">Support</h1>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {channels.map((channel) => (
          <CognifyCard key={channel.title} className="border border-[#49473F]/40">
            <h2 className="font-headline text-xl font-semibold text-[#E8E2D4]">{channel.title}</h2>
            <p className="mt-2 text-sm text-[#CBC6BC]">{channel.meta}</p>
            <button className="mt-4 rounded-md bg-[#CCC6B9] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#333027] hover:opacity-90">
              {channel.cta}
            </button>
          </CognifyCard>
        ))}
      </section>
    </AppLayout>
  )
}
