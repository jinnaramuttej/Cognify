import { AppLayout } from '@/components/layout/AppLayout'

export default function NotesPage() {
  return (
    <AppLayout
      breadcrumb="Notes"
      topbar={{
        showSearch: false,
        leftSlot: (
          <div className="flex items-center gap-6">
            <h2 className="text-lg italic text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Transformation Studio
            </h2>
            <div className="hidden gap-5 md:flex">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#CCC6B9]">Draft</span>
              <button className="text-xs uppercase tracking-[0.2em] text-[#919191] transition-colors hover:text-[#E8E2D4]">
                Archive
              </button>
            </div>
          </div>
        ),
      }}
      contentClassName="p-0"
      pageClassName="overflow-hidden"
    >
      <main className="grid min-h-[calc(100vh-4rem)] grid-cols-1 overflow-hidden xl:grid-cols-12">
        <section className="border-b border-[#49473F]/20 p-6 xl:col-span-3 xl:border-b-0 xl:border-r xl:p-8">
          <div className="mb-5">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#CCC6B9]">01. Source Material</p>
            <p className="text-sm font-light leading-relaxed text-[#919191]">
              Input your raw knowledge. PDFs, lecture notes, or erratic thoughts.
            </p>
          </div>

          <div className="flex h-full flex-col gap-4">
            <div className="relative min-h-[260px] flex-1">
              <textarea
                placeholder="Paste your transcript or notes here..."
                className="h-full w-full resize-none rounded-md border border-transparent bg-[#1C1B1B] p-5 text-sm text-[#E5E2E1] outline-none transition-colors placeholder:text-[#919191] focus:border-[#49473F]"
              />
              <span className="absolute bottom-3 right-3 rounded bg-[#201F1F] px-2 py-1 text-[10px] text-[#919191]">1,240 Words</span>
            </div>

            <button className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#49473F]/40 bg-[#0E0E0E] p-6 text-center transition-colors hover:bg-[#1C1B1B]">
              <span className="material-symbols-outlined text-3xl text-[#919191]">upload_file</span>
              <span className="text-xs text-[#CBC6BC]">Drop PDF, Markdown, or Images</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6D6B68]">Max file size 25MB</span>
            </button>
          </div>
        </section>

        <section className="border-b border-[#49473F]/20 bg-[#1C1B1B]/50 p-6 xl:col-span-4 xl:border-b-0 xl:border-r xl:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#CCC6B9]">02. Conversion Engine</p>
            <h2 className="text-3xl leading-tight text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
              Define the output logic.
            </h2>
          </div>

          <div className="space-y-4">
            <button className="w-full rounded-md border border-[#CCC6B9]/25 bg-[#2A2A2A] p-5 text-left">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-lg" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  <span className="material-symbols-outlined text-[#CCC6B9]">style</span>
                  Flashcards
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#CCC6B9]">
                  <span className="h-2 w-2 rounded-full bg-[#CCC6B9]" />
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#919191]">
                Spaced-repetition optimized cards focusing on core definitions and relationships.
              </p>
            </button>

            {[
              { icon: 'quiz', label: 'Practice Qs', text: 'Scenario-based multiple choice and open-ended analysis questions.' },
              { icon: 'auto_stories', label: 'Executive Summary', text: 'Condense 5,000 words into a 5-minute read with key hierarchy and logic maps.' },
            ].map((option) => (
              <button key={option.label} className="w-full rounded-md border border-[#49473F]/40 bg-[#131313] p-5 text-left transition-colors hover:bg-[#2A2A2A]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-lg text-[#CBC6BC]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                    <span className="material-symbols-outlined text-[#919191]">{option.icon}</span>
                    {option.label}
                  </span>
                  <span className="h-4 w-4 rounded-full border border-[#49473F]" />
                </div>
                <p className="text-xs leading-relaxed text-[#919191]">{option.text}</p>
              </button>
            ))}
          </div>

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#E8E2D4] py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#333027] transition hover:brightness-110">
            <span>Initiate Transformation</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </button>
        </section>

        <section className="min-h-0 p-6 xl:col-span-5 xl:p-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#CCC6B9]">03. Preview Studio</p>
              <h2 className="text-xl italic text-[#E8E2D4]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                12 Generated Assets
              </h2>
            </div>

            <div className="flex gap-2">
              <button className="rounded-md bg-[#201F1F] p-2 text-[#919191] transition-colors hover:text-[#E8E2D4]">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button className="rounded-md bg-[#201F1F] p-2 text-[#919191] transition-colors hover:text-[#E8E2D4]">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>

          <div className="grid max-h-[calc(100vh-14rem)] grid-cols-1 gap-4 overflow-y-auto pb-8 sm:grid-cols-2">
            {[
              "What is the 'Monograph' aesthetic in digital design?",
              "Define the 'No-Line' rule for sectioning content.",
              'How does tonal layering replace traditional drop shadows?',
              'The role of Inter vs. Newsreader in visual hierarchy.',
              "Explain 'Intentional Asymmetry' in modern UI.",
              'Why use backdrop-blur for floating menus?',
              'Standard vs High Contrast: Cognitive load analysis.',
              'Tactile depth through matte textures.',
            ].map((prompt, index) => (
              <article
                key={prompt}
                className={`flex aspect-[4/3] flex-col justify-between rounded-md border border-[#49473F]/30 p-5 transition-colors hover:bg-[#2A2A2A] ${
                  index > 5 ? 'bg-[#201F1F] opacity-80' : 'bg-[#201F1F]'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">Front</p>
                <p className="pr-2 text-sm italic text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  {prompt}
                </p>
                <div className="flex justify-end">
                  <span className="material-symbols-outlined text-[#6D6B68]">flip</span>
                </div>
              </article>
            ))}

            {[1, 2, 3, 4].map((key) => (
              <div key={key} className="aspect-[4/3] animate-pulse rounded-md border border-[#49473F]/20 bg-[#0E0E0E]/50" />
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8E2D4] text-[#333027] shadow-2xl transition-transform hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            save
          </span>
        </button>
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-[39] opacity-[0.03]"
        style={{ backgroundImage: 'url("/noise.svg")' }}
      />
    </AppLayout>
  )
}
