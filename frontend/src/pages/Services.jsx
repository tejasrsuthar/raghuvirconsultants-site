import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const navigate = useNavigate();

  const handleSubscribe = (serviceType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=checkout&service=' + serviceType);
    } else {
      navigate('/investor');
    }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <header className="pt-40 pb-20 px-6 border-b border-bordercolor grid-overlay">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-6 block">SEBI Registered Research Analyst · INH-XXXXXXXXXX</span>
          <h1 className="mb-10 text-center">
            <span className="block text-3xl md:text-4xl text-textmuted mb-3 font-semibold">Our Research</span>
            <span className="text-6xl md:text-[90px] block text-forest leading-none font-extrabold tracking-tight my-2">
              <span className="text-underline-highlight">SERVICES</span>
            </span>
          </h1>
          <p className="text-xl text-textmuted max-w-2xl mx-auto leading-relaxed font-medium">
            As a SEBI-registered Research Analyst, we publish independent, structured research reports across equities, quantitative strategies, and macro themes — free from commissions or distribution conflicts.
          </p>
        </div>
      </header>

      {/* Services Detail */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-5xl mx-auto space-y-24">
          {/* 1. Equity Research */}
          <div className="flex flex-col md:flex-row gap-12 items-center" id="equity-research">
            <div className="w-full md:w-1/3">
              <div className="w-20 h-20 bg-forest rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#CBE743]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-8"/></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Research 01</span>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-extrabold mb-4 text-forest">Equity Research &amp; Stock Coverage</h2>
              <p className="text-textmuted leading-relaxed mb-6">
                In-depth fundamental and quantitative analysis on individual stocks. Each research report covers the investment thesis, valuation framework, key risk factors, and a structured Buy / Hold / Sell recommendation. All research is conducted independently with no distribution or commission incentives.
              </p>
              <div className="grid grid-cols-2 gap-4 text-forest mb-6">
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Buy / Hold / Sell recommendations</span></div>
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Fundamental valuation analysis</span></div>
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Risk factor identification</span></div>
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Price target with rationale</span></div>
              </div>
            </div>
          </div>

          <div className="h-px bg-bordercolor"></div>

          {/* 2. Model Portfolios */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center" id="model-portfolio">
            <div className="w-full md:w-1/3 md:text-right">
              <div className="w-20 h-20 bg-forest rounded-2xl flex items-center justify-center mb-6 md:ml-auto">
                <svg className="w-10 h-10 text-[#CBE743]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"/></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Research 02</span>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-extrabold mb-4 text-forest">Quantitative Model Portfolios</h2>
              <p className="text-textmuted leading-relaxed mb-6">
                Active models built to weather different market regimes. Investors can subscribe to gain direct access to our model portfolio weights, buy/sell updates, stop-loss metrics, and entry prices.
              </p>
              <div className="grid grid-cols-2 gap-4 text-forest mb-6">
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Active stock weightages</span></div>
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Real-time entry/exit alerts</span></div>
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Risk-controlled drawdown framework</span></div>
                <div className="flex items-start gap-2"><span className="text-forest mt-0.5">✓</span><span className="text-sm font-medium">Rebalancing notifications</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Tiers */}
      <section className="py-24 px-6 bg-sage/30 border-t border-bordercolor">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-4 block">Pricing Plans</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-forest mb-4">Choose your research subscription</h2>
            <p className="text-lg text-textmuted max-w-2xl mx-auto leading-relaxed">
              Cancel or renew anytime. Secure payments handled via Stripe Card or UPI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1 */}
            <div className="custom-card p-8 bg-white border border-bordercolor flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Research Reports</h3>
                <p className="text-textmuted text-sm mb-6">In-depth stock evaluations and macro briefs</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-forest">₹999</span>
                  <span className="text-textmuted text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-textmuted mb-8">
                  <li className="flex items-center gap-2">✓ Monthly research dossiers</li>
                  <li className="flex items-center gap-2">✓ Large-cap fundamental evaluations</li>
                  <li className="flex items-center gap-2">✓ Analytical industry overviews</li>
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe('reports')}
                className="w-full btn-forest text-xs font-bold uppercase tracking-widest py-4 rounded-full text-center"
              >
                Subscribe Now
              </button>
            </div>

            {/* Plan 2 */}
            <div className="custom-card p-8 bg-forest text-white border border-forest-dark flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Model Portfolio</h3>
                <p className="text-gray-300 text-sm mb-6">Full transparency into our systematic baskets</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-lime">₹1,999</span>
                  <span className="text-gray-300 text-sm"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300 mb-8">
                  <li className="flex items-center gap-2">✓ Complete stock listing & weights</li>
                  <li className="flex items-center gap-2">✓ Buy/Sell transition alerts</li>
                  <li className="flex items-center gap-2">✓ Quarterly rebalancing guide</li>
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe('portfolio')}
                className="w-full btn-lime text-xs font-bold uppercase tracking-widest py-4 rounded-full text-center"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
