import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function TestsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex">
                        <Link href="/dashboard" className="mr-6 flex items-center space-x-2 font-bold text-sm hover:text-primary transition-colors"><ChevronLeft className="h-4 w-4" /> Back to Dashboard</Link>
                    </div>
                </div>
            </header>
            <main className="container py-6">{children}</main>
        </div>
    )
}