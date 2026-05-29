import PageHeader from '../components/PageHeader';
import Pricing from '../components/Pricing';
import PricingFAQ from '../components/PricingFAQ';
import './PricingPage.css';

const PricingPage = () => {
  return (
    <div className="pricing-page">
      <div className="pricing-page-inner">
        <PageHeader 
          eyebrow="PRICING"
          title="Pick a plan that scales with you"
          subtitle="Start small, move fast, and upgrade only when your learning path grows."
        />
        <Pricing hideHeader />
        <PricingFAQ />
      </div>
    </div>
  );
};

export default PricingPage;
