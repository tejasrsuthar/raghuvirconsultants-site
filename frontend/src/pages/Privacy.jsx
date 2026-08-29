import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

export default function Privacy() {
  return (
    <div className="pt-20">
      <header className="pt-32 pb-20 px-6 border-b border-bordercolor grid-overlay">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-forest tracking-tight leading-none mb-6">Privacy Policy</h1>
            <p className="text-xl text-textmuted max-w-2xl mx-auto leading-relaxed">
              Your privacy matters to us. Learn how we handle information.
            </p>
          </div>
        </div>
      </header>
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-3xl mx-auto text-textmuted leading-relaxed space-y-6">
          <h2 className="text-2xl font-bold text-forest">Information We Collect</h2>
          <p>
            Raghuvir Consultants collects account creation credentials (email, username), Google sign-in credentials, and billing/subscription reference numbers. We do not sell or lease your personal information.
          </p>
          <h2 className="text-2xl font-bold text-forest">Security</h2>
          <p>
            We implement industry-standard database encryption and role-based permissions to protect your personal details and subscription status against unauthorized access.
          </p>
        </div>
      </section>
    </div>
  );
}
