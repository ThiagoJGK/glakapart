import React from 'react';
import Hero from '@/components/home/Hero';
import ApartmentsGrid from '@/components/home/ApartmentsGrid';
import CommonSpaces from '@/components/home/CommonSpaces';
import SectionExplore from '@/components/home/SectionExplore';
import ScrollReveal from '@/components/ui/ScrollReveal';
import DirectBookingBenefits from '@/components/DirectBookingBenefits';

import Reviews from '@/components/home/Reviews';
import GuestGallery from '@/components/home/GuestGallery';
import FAQ from '@/components/home/FAQ';

import Events from '@/components/home/Events';

const Home: React.FC = () => {
    return (
        <main className="overflow-hidden bg-[#f4f1ea]">
            <Hero />

            <ScrollReveal>
                <ApartmentsGrid />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <CommonSpaces />
            </ScrollReveal>

            <ScrollReveal delay={100}>
                <DirectBookingBenefits />
            </ScrollReveal>

            <ScrollReveal delay={100}>
                <SectionExplore />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <Reviews />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <GuestGallery />
            </ScrollReveal>

            <ScrollReveal delay={200}>
                <FAQ />
            </ScrollReveal>

        </main>
    );
};

export default Home;

