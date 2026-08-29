import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

export default function Smallcase() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <header className="pt-32 pb-20 px-6 border-b border-bordercolor grid-overlay">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ label: 'Smallcase Strategies' }]} />
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-6 block">Research-Backed Strategies</span>
            <h1 className="mb-10 text-center">
              <span className="block text-3xl md:text-4xl text-textmuted mb-3 font-semibold">Explore Our</span>
              <span className="text-6xl md:text-[90px] block text-forest leading-none font-extrabold tracking-tight my-2">
                <span className="text-underline-highlight">SMALLCASES</span>
              </span>
            </h1>
            <p className="text-xl text-textmuted max-w-2xl mx-auto leading-relaxed font-medium">
              Our quantitative research, translated into directly investable strategies — available through Smallcase with a single click from your own brokerage account while maintaining full control of your assets.
            </p>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section className="py-12 bg-sand border-y border-bordercolor">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-textmuted mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-forest text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold text-forest mb-2">Connect Broker</h3>
              <p className="text-sm text-textmuted">Log in with your existing Zerodha, Upstox, Groww, or other supported Demat account.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-forest text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold text-forest mb-2">Choose Strategy</h3>
              <p className="text-sm text-textmuted">Select the strategy that aligns with your risk profile and financial goals.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-forest text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold text-forest mb-2">Auto-Invest</h3>
              <p className="text-sm text-textmuted">Invest instantly. Our research drives the rebalancing signals; you approve each change with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-24 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* All-Weather Smallcase */}
            <div className="custom-card rounded-3xl overflow-hidden group flex flex-col">
              <div className="p-8 border-b border-bordercolor bg-forest text-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-[#CBE743] text-forest text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">Balanced</span>
                  <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">Coming Soon</span>
                </div>
                <h3 className="text-3xl font-extrabold mb-3 group-hover:text-white/80 transition-colors">All-Weather</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A highly diversified alternative to traditional Fixed Deposits. Allocates across government safety, corporate growth, and real assets to thrive in every market cycle.
                </p>
              </div>
              <div className="p-8 flex-grow flex flex-col bg-[#FAF9F6] text-[#0F2522]">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold mb-1">Target Return</p>
                    <p className="text-lg font-bold">9.0% - 10.5%</p>
                  </div>
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold mb-1">Risk</p>
                    <p className="text-lg font-bold text-green-700">Low</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">55% G-Secs, 30% Equity, 15% Gold/Silver</span></div>
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">Tax efficient vs FDs</span></div>
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">Capital protection focused</span></div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-bordercolor mt-auto">
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold">Fees</p>
                    <p className="text-sm font-bold">TBA</p>
                  </div>
                  <span className="text-xs font-semibold text-textmuted">Launching soon</span>
                </div>
              </div>
            </div>

            {/* Trend Following Conservative */}
            <div className="custom-card rounded-3xl overflow-hidden group flex flex-col">
              <div className="p-8 border-b border-bordercolor bg-forest text-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-[#CBE743] text-forest text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">Moderate</span>
                  <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">Coming Soon</span>
                </div>
                <h3 className="text-3xl font-extrabold mb-3 group-hover:text-white/80 transition-colors">Trend (Cons.)</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A quantitative, momentum-based approach that rides strong market trends in stable Large Cap stocks and shifts to safety during prolonged downturns.
                </p>
              </div>
              <div className="p-8 flex-grow flex flex-col bg-[#FAF9F6] text-[#0F2522]">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold mb-1">Target Return</p>
                    <p className="text-lg font-bold">11.0% - 14.0%</p>
                  </div>
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold mb-1">Risk</p>
                    <p className="text-lg font-bold text-blue-700">Moderate</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">Nifty 100 Universe</span></div>
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">Dynamic cash allocation</span></div>
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">HWM Performance Fee</span></div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-bordercolor mt-auto">
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold">Fees</p>
                    <p className="text-sm font-bold">TBA</p>
                  </div>
                  <span className="text-xs font-semibold text-textmuted">Launching soon</span>
                </div>
              </div>
            </div>

            {/* Trend Following Aggressive */}
            <div className="custom-card rounded-3xl overflow-hidden group flex flex-col">
              <div className="p-8 border-b border-bordercolor bg-forest text-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-[#CBE743] text-forest text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">Aggressive</span>
                  <span className="bg-white/10 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest">Coming Soon</span>
                </div>
                <h3 className="text-3xl font-extrabold mb-3 group-hover:text-white/80 transition-colors">Trend (Agg.)</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A quantitative, momentum-based approach that rides strong market trends in Mid &amp; Small Cap stocks and shifts to safety during prolonged downturns.
                </p>
              </div>
              <div className="p-8 flex-grow flex flex-col bg-[#FAF9F6] text-[#0F2522]">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold mb-1">Target Return</p>
                    <p className="text-lg font-bold">15.0% - 18.0%</p>
                  </div>
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold mb-1">Risk</p>
                    <p className="text-lg font-bold text-red-700">High</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">Mid/Small/Micro Universe</span></div>
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">Dynamic cash allocation</span></div>
                  <div className="flex items-start gap-2"><span className="text-textmuted">▹</span><span className="text-sm text-textmuted">HWM Performance Fee</span></div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-bordercolor mt-auto">
                  <div>
                    <p className="text-xs text-textmuted uppercase font-bold">Fees</p>
                    <p className="text-sm font-bold">TBA</p>
                  </div>
                  <span className="text-xs font-semibold text-textmuted">Launching soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-sand border-t border-bordercolor">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-4 block">Frequently Asked Questions</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-forest mb-4">Got questions? We have answers.</h2>
            <p className="text-lg text-textmuted max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about investing in Raghuvir Consultants Smallcases.
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>
    </div>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is a smallcase?",
      a: "A smallcase is a curated basket of stocks or ETFs reflecting a theme, strategy, or sector. It makes investing diversified, structured, and manageable with a single click."
    },
    {
      q: "Do you manage my funds or execute trades directly?",
      a: "No. Your money and securities remain securely inside your own Demat/Brokerage account (e.g., Zerodha, Angel One). We supply the quantitative research, and you approve each action manually."
    },
    {
      q: "How does the rebalancing process work?",
      a: "Our quantitative models generate rebalancing signals periodically. You will be notified via email/SMS and in-app notification. You can apply the rebalance in your brokerage account with a single tap."
    },
    {
      q: "Are there any lock-in periods or exit loads?",
      a: "No. You can withdraw your funds, sell stocks, or exit your smallcase subscription at any time without exit fees or lock-in constraints."
    },
    {
      q: "How do I begin investing in a smallcase?",
      a: "Simply connect your existing Demat and trading account with any supported broker (such as Zerodha, Upstox, Groww, or Angel One), pick a strategy, and click 'Invest Now' to execute the transaction."
    },
    {
      q: "How can I track the performance of my investments?",
      a: "You can track your real-time returns, daily changes, and portfolio dividends directly on the Smallcase platform dashboard or inside your standard brokerage app."
    },
    {
      q: "Is the Smallcase platform SEBI registered?",
      a: "Yes. Smallcase Technologies is a SEBI-registered Investment Adviser. The model portfolios themselves are curated and advised by Raghuvir Consultants, a SEBI-registered Research Analyst (Reg No. INH-XXXXXXXXXX)."
    },
    {
      q: "Who executes the trades and acts as my broker?",
      a: "All stock transactions are handled by your chosen broker (e.g., Zerodha, Groww, Upstox). Smallcase simply acts as the secure technology connector between our research and your trading account."
    },
    {
      q: "Is investing in a smallcase better than buying individual stocks?",
      a: "For most long-term investors, yes. Buying a smallcase offers instant diversification across a professionally researched theme, which significantly reduces the risk of relying on a single stock."
    },
    {
      q: "What portion of my portfolio should I allocate to smallcases?",
      a: "While allocations depend on your financial goals, standard asset allocation principles suggest allocating 15% to 40% of your equity portfolio to structured smallcases for balanced diversification."
    },
    {
      q: "Can I set up a Systematic Investment Plan (SIP) in a smallcase?",
      a: "Yes. You can configure weekly, fortnightly, or monthly SIPs. The system automatically calculates the required investment amount based on the live market prices of the stocks in your basket."
    }
  ];

  const half = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, half);
  const rightFaqs = faqs.slice(half);

  const renderFaqCard = (faq, index) => {
    const isOpen = openIndex === index;
    return (
      <div key={index} className="border border-bordercolor bg-white rounded-2xl overflow-hidden transition-all duration-200 shadow-sm">
        <button
          onClick={() => setOpenIndex(isOpen ? null : index)}
          className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-forest hover:bg-sand/40 transition-colors text-sm md:text-base"
        >
          <span className="pr-4">{faq.q}</span>
          <span className="text-xl text-textmuted transition-transform duration-200 flex-shrink-0" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
            +
          </span>
        </button>
        {isOpen && (
          <div className="px-6 pb-5 text-sm text-textmuted leading-relaxed border-t border-bordercolor/10 pt-4 bg-sand/10">
            {faq.a}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div className="space-y-4">
        {leftFaqs.map((faq, i) => renderFaqCard(faq, i))}
      </div>
      <div className="space-y-4">
        {rightFaqs.map((faq, i) => renderFaqCard(faq, i + half))}
      </div>
    </div>
  );
}
