import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <header className="pt-40 pb-24 px-6 border-b border-bordercolor overflow-hidden relative grid-overlay">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FAF9F6] border border-bordercolor rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-forest/70">SEBI Registered Research Analyst · INH-XXXXXXXXXX</span>
          </div>

          <h1 className="mb-6 text-center">
            <span className="block text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-forest mb-2">
              Research-backed investing,
            </span>
            <span className="block text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-underline-highlight">explained simply.</span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-textmuted max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            We turn complex market data into clear, actionable research — so you can invest with confidence, whether you're just starting out or building serious wealth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/services" className="btn-forest text-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:-translate-y-0.5 transition-all text-center">
              Explore Our Services
            </Link>
            <Link to="/services" className="btn-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm hover:-translate-y-0.5 transition-all text-center">
              View Model Portfolios →
            </Link>
          </div>

          <div className="inline-flex flex-wrap justify-center divide-x divide-bordercolor bg-[#FAF9F6] border border-bordercolor rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3">
              <span className="text-base">🛡️</span>
              <span className="text-xs font-semibold text-forest/80 whitespace-nowrap">SEBI Registered RA</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3">
              <span className="text-base">📊</span>
              <span className="text-xs font-semibold text-forest/80 whitespace-nowrap">BSE Enlisted</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3">
              <span className="text-base">✅</span>
              <span className="text-xs font-semibold text-forest/80 whitespace-nowrap">NISM Certified</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3">
              <span className="text-base">🔒</span>
              <span className="text-xs font-semibold text-forest/80 whitespace-nowrap">You Stay in Control</span>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-24 px-6 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-4 block">Who We Are</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-forest leading-tight mb-8">
                We believe every investor deserves honest research.
              </h2>
              <div className="space-y-4 text-textmuted leading-relaxed text-lg">
                <p>
                  Raghuvir Consultants is a SEBI-registered Research Analyst firm. We exist to bridge the gap between complex financial markets and everyday investors — whether you're placing your first SIP or building a multi-stock portfolio.
                </p>
                <p>
                  We don't manage your money. We don't execute your trades. What we do is give you well-researched, clearly explained investment ideas — and let you make the final call. Always.
                </p>
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-widest text-forest hover:text-forest/70 transition-colors">
                Meet the Analyst <span>→</span>
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 bg-sage rounded-3xl border border-bordercolor hover:bg-sage/75 transition-colors">
                <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-forest mb-1">Research always comes before recommendations</p>
                  <p className="text-sm text-textmuted">Every call is grounded in data analysis, not market noise or gut feeling.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-sage rounded-3xl border border-bordercolor hover:bg-sage/75 transition-colors">
                <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-forest mb-1">We disclose our own holdings — full transparency</p>
                  <p className="text-sm text-textmuted">Conflicts of interest are disclosed upfront, as required by SEBI regulations.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-sage rounded-3xl border border-bordercolor hover:bg-sage/75 transition-colors">
                <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-forest mb-1">Plain language, no jargon, no unnecessary complexity</p>
                  <p className="text-sm text-textmuted">Research written for real investors, not just finance professionals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-sand border-y border-bordercolor">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-4 block">What We Offer</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-forest mb-4">Services curated for your financial growth.</h2>
            <p className="text-lg text-textmuted max-w-2xl mx-auto leading-relaxed">
              Unlock data-backed investment ideas with absolute clarity. Register or subscribe to gain access to premium services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="custom-card p-8 flex flex-col bg-forest text-white">
              <div className="mb-6 flex justify-between items-start">
                <span className="text-xl">📄</span>
                <span className="text-[10px] font-bold uppercase bg-lime text-forest px-3 py-1 rounded-full">Service 1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Research Reports</h3>
              <p className="text-gray-300 text-sm flex-grow mb-6">
                In-depth reports on fundamental market analysis, mid-cap/large-cap stock evaluations, and periodic macro-economic research.
              </p>
              <Link to="/services" className="btn-lime text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full text-center mt-auto">
                Explore Reports
              </Link>
            </div>

            <div className="custom-card p-8 flex flex-col bg-[#EDEEE9] hover:bg-[#E3E5DC]">
              <div className="mb-6 flex justify-between items-start">
                <span className="text-xl">📈</span>
                <span className="text-[10px] font-bold uppercase bg-forest text-white px-3 py-1 rounded-full">Service 2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-forest">Model Portfolio</h3>
              <p className="text-textmuted text-sm flex-grow mb-6">
                Theme-based stock advisory portfolios managed actively with entry price, target price, weightages, and clear exit criteria.
              </p>
              <Link to="/services" className="btn-forest text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full text-center mt-auto">
                Explore Portfolios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
