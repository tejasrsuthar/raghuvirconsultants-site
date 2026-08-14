/**
 * Shared Components for Raghuvir Consultants Website
 * Renders consistent header and footer across all pages.
 */

function renderHeader(activePage) {
    const nav = document.getElementById('site-header');
    if (!nav) return;

    const links = [
        { label: 'Home', href: 'index.html', id: 'home' },
        { label: 'Services', href: 'services.html', id: 'services' },
        { label: 'Smallcase', href: 'smallcase.html', id: 'smallcase' },
        { label: 'Learn', href: 'learn.html', id: 'learn' },
        { label: 'About', href: 'about.html', id: 'about' },
        { label: 'Contact', href: 'contact.html', id: 'contact' },
    ];

    const navLinksHTML = links.map(link => {
        const isActive = link.id === activePage;
        const cls = isActive
            ? 'text-[#0F2522] font-semibold transition-colors'
            : 'text-[#5E6967] hover:text-[#0F2522] transition-colors';
        return `<a href="${link.href}" class="${cls}">${link.label}</a>`;
    }).join('\n                ');

    nav.innerHTML = `
    <nav class="fixed w-full z-50 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-[#E2E4DC]" role="navigation" aria-label="Main navigation">
        <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="index.html" class="flex items-center space-x-2" aria-label="Raghuvir Consultants Home">
                <div class="w-8 h-8 bg-[#0F2522] rounded flex items-center justify-center">
                    <span class="text-[#CBE743] font-bold text-xs">RC</span>
                </div>
                <span class="font-bold tracking-tight uppercase text-xs text-[#0F2522]">Raghuvir Consultants</span>
            </a>
            <div class="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-widest">
                ${navLinksHTML}
            </div>
            <div class="hidden md:flex items-center">
                <a href="contact.html" class="bg-[#0F2522] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-[#0a1917] transition-all">
                    Get Started →
                </a>
            </div>
            <!-- Mobile menu button -->
            <button id="mobile-menu-btn" class="md:hidden w-10 h-10 flex items-center justify-center text-[#0F2522]" aria-label="Toggle menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            </button>
        </div>
        <!-- Mobile menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-[#FAF9F6] border-t border-[#E2E4DC] px-6 py-4 space-y-3">
            ${links.map(link => {
                const isActive = link.id === activePage;
                const cls = isActive ? 'text-[#0F2522] font-bold' : 'text-[#5E6967] hover:text-[#0F2522]';
                return `<a href="${link.href}" class="block text-sm uppercase tracking-widest ${cls}">${link.label}</a>`;
            }).join('\n            ')}
            <a href="contact.html" class="block bg-[#0F2522] text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full text-center mt-4">Get Started →</a>
        </div>
    </nav>`;

    // Mobile menu toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }
}

function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    footer.innerHTML = `
    <footer class="py-20 px-6 bg-[#0C1615] text-[#FAF9F6]" role="contentinfo">
        <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <!-- Brand -->
                <div class="md:col-span-1">
                    <a href="index.html" class="flex items-center space-x-2 mb-6 inline-flex" aria-label="Raghuvir Consultants Home">
                        <div class="w-8 h-8 bg-[#CBE743] rounded flex items-center justify-center">
                            <span class="text-[#0F2522] font-bold text-xs">RC</span>
                        </div>
                        <span class="font-bold tracking-tight uppercase text-xs text-[#FAF9F6]">Raghuvir Consultants</span>
                    </a>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6">
                        SEBI Registered Research Analyst. Independent, data-driven research for investors seeking an analytical edge.
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <span class="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded">Ahmedabad</span>
                        <span class="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded">Mumbai</span>
                        <span class="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded">London</span>
                    </div>
                </div>

                <!-- Quick Links -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-[#CBE743] mb-6">Quick Links</h4>
                    <ul class="space-y-3">
                        <li><a href="index.html" class="text-sm text-gray-400 hover:text-white transition-colors">Home</a></li>
                        <li><a href="services.html" class="text-sm text-gray-400 hover:text-white transition-colors">Research</a></li>
                        <li><a href="smallcase.html" class="text-sm text-gray-400 hover:text-white transition-colors">Smallcase</a></li>
                        <li><a href="learn.html" class="text-sm text-gray-400 hover:text-white transition-colors">Learn</a></li>
                        <li><a href="about.html" class="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                        <li><a href="contact.html" class="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>

                <!-- Strategies -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-[#CBE743] mb-6">Strategies</h4>
                    <ul class="space-y-3">
                        <li><a href="all-weather-strategy.html" class="text-sm text-gray-400 hover:text-white transition-colors">All-Weather Strategy</a></li>
                        <li><a href="trend-following-conservative.html" class="text-sm text-gray-400 hover:text-white transition-colors">Trend Following (Cons.)</a></li>
                        <li><a href="trend-following-aggressive.html" class="text-sm text-gray-400 hover:text-white transition-colors">Trend Following (Agg.)</a></li>
                    </ul>
                </div>

                <!-- Legal -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-widest text-[#CBE743] mb-6">Legal</h4>
                    <ul class="space-y-3">
                        <li><a href="privacy.html" class="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="terms.html" class="text-sm text-gray-400 hover:text-white transition-colors">Disclaimer &amp; Terms</a></li>
                        <li><a href="contact.html" class="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>

            <!-- Bottom bar -->
            <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-[10px] text-gray-400 uppercase tracking-widest">© 2026 Raghuvir Consultants · SEBI RA Reg. No. INH-XXXXXXXXXX · All Rights Reserved.</p>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest">Investment is subject to market risks. Read all documents carefully.</p>
            </div>
        </div>
    </footer>`;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const headerEl = document.getElementById('site-header');
    if (headerEl) {
        const activePage = headerEl.getAttribute('data-active') || '';
        renderHeader(activePage);
    }
    renderFooter();
});
