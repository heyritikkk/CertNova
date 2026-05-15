import React from 'react';
import Hero from '../components/Hero';
import Highlights from '../components/Highlights';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import ReviewGrid from '../components/ReviewGrid';
import Pricing from '../components/Pricing';
import Faq from '../components/Faq';
import CtaBanner from '../components/CtaBanner';

const Home = () => {
  return (
    <>
      <Hero />
      <Highlights />
      <HowItWorks />
      <Testimonials />
      <ReviewGrid />
      <Pricing />
      <Faq />
      <CtaBanner />
    </>
  );
};

export default Home;
