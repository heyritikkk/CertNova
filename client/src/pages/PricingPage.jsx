import Pricing from '../components/Pricing';
import './PricingPage.css';

const PricingPage = () => {
  return (
    <div className="pricing-page">
      <div className="pricing-page-inner">
        <header className="pricing-hero">
          <span className="pricing-eyebrow">Pricing</span>
          <h1>Pick a plan that scales with you</h1>
          <p>Start small, move fast, and upgrade only when your learning path grows.</p>
        </header>

        <Pricing hideHeader />
      </div>
    </div>
  );
};

export default PricingPage;
