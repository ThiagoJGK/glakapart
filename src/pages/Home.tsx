import React from 'react';
import Hero from '@/components/home/Hero';
import ApartmentsGrid from '@/components/home/ApartmentsGrid';
import CommonSpaces from '@/components/home/CommonSpaces';
import SectionExplore from '@/components/home/SectionExplore';
import ScrollReveal from '@/components/ui/ScrollReveal';
import DirectBookingBenefits from '@/components/DirectBookingBenefits';

import Location from '@/components/home/Location';
import Reviews from '@/components/home/Reviews';
import InstagramFeed from '@/components/home/InstagramFeed';
import FAQ from '@/components/home/FAQ';

import Events from '@/components/home/Events';

const Home: React.FC = () => {
    return (
        <main className="overflow-hidden">
            <Hero />

            <ScrollReveal>
                <ApartmentsGrid />
            </ScrollReveal>

            <ScrollReveal delay={100}>
                <DirectBookingBenefits />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <CommonSpaces />
            </ScrollReveal>

            <ScrollReveal delay={100}>
                <SectionExplore />
            </ScrollReveal>
            {/* <Events /> Removed as per request (moved to proper section) */}

            <ScrollReveal delay={200}>
                <Location />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <InstagramFeed />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <FAQ />
            </ScrollReveal>

        </main>
    );
};

export default Home;

