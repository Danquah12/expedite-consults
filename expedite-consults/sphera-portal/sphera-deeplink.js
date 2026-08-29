/**
 * Sphera Deep Link Handler
 * ========================
 * Add this script to the Sphera app's index.html (before the closing </body> tag)
 * or append it to app.js. It reads ?tab= from the URL and auto-navigates to the
 * corresponding tab when the page loads.
 *
 * Usage from Portal: https://sphera.expediteconsults.com?tab=reels
 *
 * Tab mapping:
 *   feed       → Home Feed
 *   discover   → Discover
 *   reels      → Reels
 *   groups     → Groups
 *   messages   → SpheraChat
 *   connections → Connections
 *   profile    → My Profile
 *   network    → Orbiters
 *   watch      → SphereVision (TV)
 *   videostudio → Video Studio
 *   videocreator → Video Creator
 *   pulse      → Pulse (Live Feed)
 *   career     → CareerOrbit
 *   elevate    → Elevate
 *   nexus      → Nexus
 *   market     → Bazaar
 *   events     → Events
 *   capsule    → Time Capsule
 */

(function() {
  'use strict';

  // Map of tab param → { navId, pageId }
  const TAB_MAP = {
    feed:         { nav: 'navFeed',         page: 'pageFeed' },
    discover:     { nav: 'navDiscover',     page: 'pageDiscover' },
    reels:        { nav: 'navReels',        page: 'pageReels' },
    groups:       { nav: 'navGroups',       page: 'pageGroups' },
    messages:     { nav: 'navMessages',     page: 'pageMessages' },
    connections:  { nav: 'navConnections',  page: 'pageConnections' },
    profile:      { nav: 'navFeed',         page: 'pageFeed' }, // Profile uses feed context
    network:      { nav: 'navNetwork',      page: 'pageNetwork' },
    watch:        { nav: 'navWatch',        page: 'pageWatch' },
    videostudio:  { nav: 'navVideoStudio',  page: 'pageVideoStudio' },
    videocreator: { nav: 'navVideoCreator', page: 'pageVideoCreator' },
    pulse:        { nav: 'navPulse',        page: 'pagePulse' },
    career:       { nav: 'navCareer',       page: 'pageCareerorbit' },
    elevate:      { nav: 'navElevate',      page: 'pageElevate' },
    nexus:        { nav: 'navNexus',        page: 'pageNexus' },
    market:       { nav: 'navMarket',       page: 'pageMarket' },
    events:       { nav: 'navEvents',       page: 'pageEvents' },
    capsule:      { nav: 'navCapsule',      page: 'pageCapsule' }
  };

  function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');

    if (!tab || !TAB_MAP[tab]) return;

    const { nav, page } = TAB_MAP[tab];

    // Dismiss any onboarding modals first
    const skipBtns = document.querySelectorAll('[onclick*="skip"], .skip-btn, .onboarding-skip');
    skipBtns.forEach(btn => btn.click());

    // Hide all pages
    document.querySelectorAll('[id^="page"]').forEach(el => {
      el.classList.remove('active-page');
      el.style.display = 'none';
    });

    // Remove active state from all nav items
    document.querySelectorAll('.nav-item, [id^="nav"]').forEach(el => {
      el.classList.remove('active');
    });

    // Show target page
    const pageEl = document.getElementById(page);
    if (pageEl) {
      pageEl.classList.add('active-page');
      pageEl.style.display = '';
    }

    // Activate nav item
    const navEl = document.getElementById(nav);
    if (navEl) {
      navEl.classList.add('active');
      // Also try clicking it to trigger any JS event listeners
      navEl.click();
    }

    // Clean URL (remove ?tab= so it doesn't re-trigger)
    const url = new URL(window.location);
    url.searchParams.delete('tab');
    window.history.replaceState({}, '', url.pathname);

    console.log(`[Sphera Portal] Deep linked to: ${tab} → ${page}`);
  }

  // Run after DOM is ready + a short delay for app.js to initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(handleDeepLink, 500));
  } else {
    setTimeout(handleDeepLink, 500);
  }
})();
