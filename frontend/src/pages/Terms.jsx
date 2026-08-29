import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

export default function Terms() {
  return (
    <div className="pt-20">
      <header className="pt-32 pb-20 px-6 border-b border-bordercolor grid-overlay">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ label: 'Terms & Disclaimer' }]} />
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-forest tracking-tight leading-none mb-6">Disclaimer &amp; Terms</h1>
            <p className="text-xl text-textmuted max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before subscribing.
            </p>
          </div>
        </div>
      </header>
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-3xl mx-auto text-textmuted leading-relaxed space-y-6">
          <h2 className="text-2xl font-bold text-forest">SEBI Disclosure</h2>
          <p>
            Raghuvir Consultants is a SEBI Registered Research Analyst (Reg No. INH-XXXXXXXXXX). Any information provided on this platform is solely for informational purposes and does not constitute explicit trade execution advice.
          </p>
          <h2 className="text-2xl font-bold text-forest">Market Risk</h2>
          <p>
            Equity and securities investments are subject to market risks. Past performance is not a guarantee of future returns. Make sure to read all regulatory disclosure documents before making investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
