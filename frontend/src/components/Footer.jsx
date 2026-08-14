import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isSmallcasePage = location.pathname === '/smallcase';

  return (
    <>
      {/* Conditional CTA Block based on page route */}
      {isSmallcasePage ? (
        /* Access Independent Research CTA Block (for Smallcase page) */
        <section className="py-24 px-6 bg-forest text-white">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-lime mb-4 block">Ready to Start?</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">Access Independent Research</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Subscribe to receive structured, independent research reports. No obligations, no commissions — just honest, data-driven analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/tejact2007/30min"
                target="_blank"
                rel="noreferrer"
                className="bg-lime text-forest px-10 py-4 font-bold text-xs uppercase tracking-widest hover:bg-lime-hover transition-all rounded-full"
              >
                Schedule a Call
              </a>
              <Link
                to="/contact"
                className="border border-white/30 text-white px-10 py-4 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all rounded-full"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Smallcase Subscription CTA Block (for all other pages) */
        <section className="py-24 px-6 bg-forest text-white">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-lime mb-4 block">Ready to Start?</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">Invest via Smallcase</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Access our theme-based, quantitative model portfolios directly on the smallcase platform. One click to invest with your existing broker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/smallcase"
                className="bg-lime text-forest px-10 py-4 font-bold text-xs uppercase tracking-widest hover:bg-lime-hover transition-all rounded-full text-center"
              >
                View Smallcases
              </Link>
              <Link
                to="/services"
                className="border border-white/30 text-white px-10 py-4 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all rounded-full text-center"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Footer */}
      <footer className="py-20 px-6 bg-[#0C1615] text-[#FAF9F6]" role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand column */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6 inline-flex" aria-label="Raghuvir Consultants Home">
                <div className="w-8 h-8 bg-lime rounded flex items-center justify-center">
                  <span className="text-forest font-bold text-xs">RC</span>
                </div>
                <span className="font-bold tracking-tight uppercase text-xs text-[#FAF9F6]">Raghuvir Consultants</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                SEBI Registered Research Analyst. Independent, data-driven research for investors seeking an analytical edge.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">Ahmedabad</span>
                <span className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">Mumbai</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-lime mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">Research</Link></li>
                <li><Link to="/smallcase" className="text-sm text-gray-400 hover:text-white transition-colors">Smallcase</Link></li>
                <li><Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">Learn</Link></li>
                <li><Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Strategies */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-lime mb-6">Strategies</h4>
              <ul className="space-y-3">
                <li><Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">All-Weather Strategy</Link></li>
                <li><Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">Trend Following (Cons.)</Link></li>
                <li><Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors">Trend Following (Agg.)</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-lime mb-6">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Disclaimer &amp; Terms</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom regulatory bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2026 RAGHUVIR CONSULTANTS · SEBI RA REG. NO. INH-XXXXXXXXXX · ALL RIGHTS RESERVED.</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">INVESTMENT IS SUBJECT TO MARKET RISKS. READ ALL DOCUMENTS CAREFULLY.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
