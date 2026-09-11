import { useHealth } from './healthapi/hooks';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './section/heroSection';
import FeatureSection from './section/featureSection';
import PropositionSection from './section/propositionSection';
import CtaSection from './section/ctaSection';
import Footer from '@/components/common/footer';

const Landingpage = () => {
    const { error } = useHealth();
    const navigate = useNavigate();
    React.useEffect(() => {
        if (error) {
            navigate('/error');
        }
    }, [error, navigate]);

    return (
        <>
         <HeroSection />
         <FeatureSection />
         <PropositionSection />
         <CtaSection />
         <Footer />
        </>
    )

}

export default Landingpage;