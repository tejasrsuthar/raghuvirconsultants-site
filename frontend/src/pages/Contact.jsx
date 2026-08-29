import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate contact form submission
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="pt-20">
      <header className="pt-32 pb-20 px-6 border-b border-bordercolor grid-overlay">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ label: 'Contact Us' }]} />
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-textmuted mb-6 block">Research Enquiries</span>
            <h1 className="mb-10 text-center">
              <span className="block text-3xl md:text-4xl text-textmuted mb-3 font-semibold">Get in</span>
              <span className="text-6xl md:text-[90px] block text-forest leading-none font-extrabold tracking-tight my-2">
                <span className="text-underline-highlight">TOUCH</span>
              </span>
            </h1>
            <p className="text-xl text-textmuted max-w-2xl mx-auto leading-relaxed font-medium">
              Interested in our research? Reach out to subscribe or learn more about our coverage.
            </p>
          </div>
        </div>
      </header>

      <section className="py-20 px-6 bg-sand">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-extrabold mb-6 text-forest">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center shrink-0 border border-bordercolor">
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-textmuted mb-1">WhatsApp / Phone</p>
                  <a href="https://wa.me/919924748572" target="_blank" className="text-lg hover:underline font-semibold">+91 99247 48572</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center shrink-0 border border-bordercolor">
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-textmuted mb-1">Email</p>
                  <a href="mailto:info@raghuvirconsultants.com" className="text-lg hover:underline font-semibold">info@raghuvirconsultants.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center shrink-0 border border-bordercolor">
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-textmuted mb-1">Locations</p>
                  <p className="text-lg font-semibold">Ahmedabad • Mumbai • London</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-sage border border-bordercolor rounded-3xl">
              <h3 className="font-bold text-forest mb-2">Schedule a Video Call</h3>
              <p className="text-sm text-textmuted mb-4">Pick a convenient time for a 30-minute introductory meeting.</p>
              <a href="https://calendly.com/tejact2007/30min" target="_blank" rel="noreferrer" className="inline-block bg-forest text-white px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-forest-hover transition-colors">
                Open Calendly
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-8 border border-bordercolor rounded-3xl">
            <h2 className="text-2xl font-extrabold mb-6 text-forest">Send a Message</h2>
            {submitted ? (
              <div className="p-6 bg-sage border border-bordercolor rounded-2xl text-center">
                <span className="text-2xl">✅</span>
                <h4 className="font-bold mt-2 text-forest">Thank You!</h4>
                <p className="text-sm text-textmuted mt-1">Your message has been sent successfully. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Message</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-md"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
