'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Target, Activity, Clock, Layers, Flame, Trophy,
    ArrowRight, Search, Zap, Play, ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MocksLibrary() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('jee_main')
    const [search, setSearch] = useState('')

    const categories = [
        { id: 'jee_main', label: 'JEE Main', icon: Target },
        { id: 'jee_adv', label: 'JEE Advanced', icon: Flame },
        { id: 'neet', label: 'NEET UG', icon: Activity },
        { id: 'bitsat', label: 'BITSAT', icon: Zap },
    ]

    const mocks = [
        { id: 1, type: 'jee_main', name: 'NTA Official Pattern Mock 1', difficulty: 'Medium', qs: 90, time: 180, tags: ['Full Syllabus', '2024 Pattern'] },
        { id: 2, type: 'jee_main', name: 'Jan Attempt Predictor', difficulty: 'Hard', qs: 90, time: 180, tags: ['High Weightage', 'Expected'] },
        { id: 3, type: 'jee_adv', name: 'Paper 1 Simulation', difficulty: 'Advanced', qs: 54, time: 180, tags: ['Multi-Correct', 'Matrix Match'] },
        { id: 4, type: 'neet', name: 'NCERT Line-by-Line Mock', difficulty: 'Medium', qs: 200, time: 200, tags: ['Biology Heavy', 'Full Syllabus'] },
        { id: 5, type: 'bitsat', name: 'Speed Attack Mock', difficulty: 'Medium', qs: 130, time: 180, tags: ['English', 'LR Included'] }
    ]

    const filteredMocks = mocks
        .filter(m => m.type === activeTab)
        .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">

            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/tests')} className="mb-4 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                                <Trophy className="text-primary" /> Pro Mock Library
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-xl">
                                Curated premium mocks designed by experts to accurately simulate the real exam environment.
                            </p>
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search mocks..."
                                className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background rounded-xl h-12"
                                value={search} onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Categories Tab */}
                <div className="max-w-6xl mx-auto px-4 md:px-8 mt-4">
                    <div className="flex overflow-x-auto scrollbar-hide gap-6 border-b border-transparent">
                        {categories.map(c => {
                            const isActive = activeTab === c.id;
                            const Icon = c.icon;
                            return (
                                <button
                                    key={c.id} onClick={() => setActiveTab(c.id)}
                                    className={`flex items-center gap-2 pb-4 border-b-2 font-bold transition-all whitespace-nowrap ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Icon size={16} className={isActive ? 'text-primary' : 'opacity-50'} />
                                    {c.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMocks.map((mock) => (
                            <motion.div
                                key={mock.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="bg-card border-border hover:border-primary/50 hover:shadow-xl transition-all h-full flex flex-col group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <CardContent className="p-6 relative z-10 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-2">
                                                {mock.tags.map(t => (
                                                    <Badge key={t} variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-wider">{t}</Badge>
                                                ))}
                                            </div>
                                            <Badge className={`border-0 font-bold ${mock.difficulty === 'Hard' ? 'bg-red-500 hover:bg-red-500 text-white' : mock.difficulty === 'Advanced' ? 'bg-purple-500 hover:bg-purple-500 text-white' : 'bg-emerald-500 hover:bg-emerald-500 text-white'}`}>
                                                {mock.difficulty}
                                            </Badge>
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                                            {mock.name}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 mt-auto">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Layers size={16} />
                                                <span className="text-sm font-semibold">{mock.qs} Qs</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock size={16} />
                                                <span className="text-sm font-semibold">{mock.time} mins</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-4 border-t border-border bg-muted/20 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer flex justify-between items-center group/btn" onClick={() => router.push(`/tests/attempt/${mock.id}`)}>
                                        <span className="font-bold text-sm">Start Simulation</span>
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredMocks.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target size={32} className="text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No mocks found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">Try adjusting your search terms or switch to a different exam category.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    )
}
