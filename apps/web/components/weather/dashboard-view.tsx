'use client'

import { DashboardHeader } from './dashboard-header'
import {
    PrimaryCard,
    WindCard,
    BarometerCard,
    RainCard,
    IndoorCard,
    AstronomyCard,
} from './weather-cards'
import { StationFooter } from './station-footer'

export function DashboardView() {
    return (
        <>
            <DashboardHeader />

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                {/* Primary Temperature Card - spans 2 cols and 2 rows on larger screens */}
                <div className="sm:col-span-2 sm:row-span-2">
                    <PrimaryCard />
                </div>

                {/* Wind Card */}
                <div className="lg:col-span-1">
                    <WindCard />
                </div>

                {/* Barometer Card */}
                <div className="lg:col-span-1">
                    <BarometerCard />
                </div>

                {/* Rain Card */}
                <div className="lg:col-span-1">
                    <RainCard />
                </div>

                {/* Indoor Card */}
                <div className="lg:col-span-1">
                    <IndoorCard />
                </div>

                {/* Astronomy Card - spans full width on small, 2 cols on larger */}
                <div className="sm:col-span-2 lg:col-span-2">
                    <AstronomyCard />
                </div>
            </div>

            {/* Station Info Footer */}
            <StationFooter />
        </>
    )
}
