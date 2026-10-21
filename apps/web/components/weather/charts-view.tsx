'use client'

import { useApp } from '@/components/app-provider'
import { Menu, LineChart } from 'lucide-react'
import { HistoricalCharts } from './components/historical-charts'

export function ChartsView() {
    const { t, setSidebarOpen } = useApp()

    return (
        <>
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                {/* Mobile menu button */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                        {t.nav.charts}
                    </h1>
                </div>
            </header>

            {/* Charts Content */}
            <HistoricalCharts />
        </>
    )
}
