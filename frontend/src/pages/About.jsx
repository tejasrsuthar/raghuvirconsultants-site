import React from 'react';

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6 border-b border-bordercolor grid-overlay">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-6 block">Founder &amp; Lead Research Analyst</span>
          <h1 className="mb-10 text-center">
            <span className="block text-3xl md:text-4xl text-textmuted mb-3 font-semibold">Meet</span>
            <span className="text-5xl md:text-[80px] block text-forest leading-none font-extrabold tracking-tight my-2">
              <span className="text-underline-highlight">TEJAS SUTHAR</span>
            </span>
          </h1>
          <p className="text-xl text-textmuted max-w-2xl mx-auto leading-relaxed font-medium">
            SEBI Registered Research Analyst (Reg. No. INH-XXXXXXXXXX) dedicated to publishing independent, data-driven research for investors who demand more than opinion.
          </p>
        </div>
      </header>

      {/* Content Section */}
      <section className="py-20 bg-sand px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            {/* Avatar / Photo */}
            <div className="w-full md:w-1/3">
              <div className="custom-card p-4 rounded-3xl sticky top-32 bg-[#EDEEE9]">
                <div className="w-full aspect-[3/4] bg-sand rounded-2xl relative overflow-hidden flex items-center justify-center border border-bordercolor">
                  <img src="/images/Tejas Photo.jpeg" alt="Tejas Suthar - Founder and Lead Research Analyst" className="w-full h-full object-cover grayscale" />
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-textmuted mb-4 block">My Philosophy</span>
              <h3 className="text-4xl font-extrabold mb-8 leading-snug text-forest">Discipline over prediction.</h3>
              
              <div className="space-y-6 text-textmuted leading-relaxed text-lg">
                <p>
                  At Raghuvir Consultants, we believe that the market isn't something to be timed based on human emotion, intuition, or the daily news cycle. Reliable research is built and sustained by adhering to strict mathematical frameworks and quantitative logic.
                </p>
                <p>
                  I established Raghuvir Consultants to provide independent research that cuts through market noise — giving investors a structured, evidence-based view of equities, strategies, and sectors rather than opinions dressed up as analysis.
                </p>
                <p>
                  Whether through our widely diversified <strong>All-Weather Strategy</strong> research or our momentum-based <strong>Quantitative Trend Following</strong> analysis, my primary goal remains the same: rigorous, transparent research that investors can actually use to make informed decisions.
                </p>
              </div>

              <div className="mt-16 pt-12 border-t border-bordercolor">
                <h4 className="font-bold text-sm uppercase tracking-widest mb-8 text-forest">Core Values</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center border border-bordercolor shadow-sm shrink-0">
                      <span className="text-sm">🛡️</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-forest mb-1">Research Integrity</h5>
                      <p class="text-sm text-textmuted leading-relaxed">Independent, unbiased analysis free from distributor commissions or product conflicts.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center border border-bordercolor shadow-sm shrink-0">
                      <span className="text-sm">🔬</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-forest mb-1">Evidence-Based</h5>
                      <p className="text-sm text-textmuted leading-relaxed">Every recommendation rests on deep database-driven evaluation and statistical rigor.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
