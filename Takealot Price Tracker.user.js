// ==UserScript==
// @name         Takealot Price Tracker
// @namespace    http://tampermonkey.net/
// @version      0.5.0
// @description  Adds a "Price History" button (via servaltracker.com) and a Bayesian-adjusted rating to Takealot product pages.
// @author       Murdock
// @homepageURL  https://github.com/Murdock011/Takealot-Price-tracker
// @match        https://www.takealot.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=takealot.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BOX_ID = 'tpt-tracker';
    const SELECTORS = {
        // The buybox is where we anchor the injected UI. Takealot is migrating
        // its markup, so try a few selectors from most to least specific.
        buybox: [
            '.sf-buybox',
            '[class*="buybox-offer-module_single-item"]',
            '[class*="buybox-module_buybox"]',
            '[class*="buybox-module_price"]',
        ],
        // First match on a product page is the main product's rating.
        rating: '[class*="rating-module_rating-wrapper"]',
    };

    function findBuybox() {
        for (const selector of SELECTORS.buybox) {
            const el = document.querySelector(selector);
            if (el) return el;
        }
        return null;
    }

    /** Remove any UI this script previously injected. */
    function removeInjectedUI() {
        document.querySelectorAll('#' + BOX_ID).forEach((el) => el.remove());
    }

    // Bayesian-adjusted rating (https://fulmicoton.com/posts/bayesian_rating/).
    // A product's rating is treated as PRIOR_WEIGHT imaginary reviews sitting at
    // PRIOR_MEAN, blended with its real reviews. Products with few reviews are
    // pulled toward the prior; heavily reviewed products barely move.
    const PRIOR_MEAN = 3.5; // assumed rating for a product with no reviews
    const PRIOR_WEIGHT = 10; // strength of that assumption, in "reviews"

    /** avg (0-5), count (>=0) -> Bayesian-adjusted rating on the same 0-5 scale. */
    function bayesianRating(avg, count) {
        const adjusted =
            (PRIOR_WEIGHT * PRIOR_MEAN + avg * count) / (PRIOR_WEIGHT + count);
        return Math.round(adjusted * 10) / 10;
    }

    /** Read "4.3 (140)" from a rating wrapper into { avg, count }. */
    function parseRating(el) {
        if (!el) return null;
        const match = el.innerText.match(/([\d.]+)\s*(?:\((\d[\d,]*)\))?/);
        if (!match) return null;
        const avg = parseFloat(match[1]);
        if (Number.isNaN(avg)) return null;
        const count = match[2] ? parseInt(match[2].replace(/,/g, ''), 10) : 0;
        return { avg, count };
    }

    function parseProductId() {
        // e.g. https://www.takealot.com/some-product/PLID12345678
        const match = location.pathname.match(/\/(PLID\d+)/i);
        if (match) return match[1];
        const parts = location.pathname.split('/').filter(Boolean);
        return parts[parts.length - 1] || null;
    }

    function openPriceHistory() {
        const productId = parseProductId();
        if (!productId) {
            console.error('[TPT] Could not determine product id from URL.');
            return;
        }
        const url = `https://www.servaltracker.com/products/${productId}`;
        const popup = window.open(
            url,
            'TptPriceHistory',
            'width=575,height=600,menubar=0,status=0,titlebar=0,toolbar=0'
        );
        if (!popup) console.error('[TPT] Failed to open the price history window (popup blocked?).');
    }

    function buildUI() {
        const box = document.createElement('div');
        box.id = BOX_ID;
        box.style.cssText =
            'margin:8px 0;padding:8px 0;border-top:1px solid #eaeaea;' +
            'border-bottom:1px solid #eaeaea;font-size:16px;background:#fff;';

        const rating = parseRating(document.querySelector(SELECTORS.rating));
        if (rating) {
            const line = document.createElement('div');
            line.style.marginBottom = '6px';
            if (rating.count > 0) {
                const adjusted = bayesianRating(rating.avg, rating.count);
                line.textContent =
                    `Adjusted rating: ${adjusted} / 5 `;
            } else {
                line.textContent = `Rating: ${rating.avg} / 5`;
            }
            box.appendChild(line);
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Price History';
        button.style.cssText =
            'width:100%;height:40px;padding:12px;font-size:1rem;text-align:center;' +
            'color:#4d4d4f;background:#eaeaea;border:0;border-radius:0;cursor:pointer;';
        button.addEventListener('click', openPriceHistory);
        box.appendChild(button);

        return box;
    }

    function inject() {
        const buybox = findBuybox();
        if (!buybox) return false;
        if (document.getElementById(BOX_ID)) return true;
        buybox.appendChild(buildUI());
        return true;
    }

    /** Retry injection for a few seconds while the SPA renders the buybox. */
    function tryInject(attempts = 20) {
        if (inject() || attempts <= 0) return;
        setTimeout(() => tryInject(attempts - 1), 300);
    }

    function refresh() {
        removeInjectedUI();
        tryInject();
    }

    // Initial run.
    refresh();

    // Re-run on SPA navigation (Takealot swaps pages without a full reload).
    let lastPath = location.pathname;
    const onNavigate = () => {
        if (location.pathname === lastPath) return;
        lastPath = location.pathname;
        refresh();
    };
    window.addEventListener('popstate', onNavigate);
    for (const method of ['pushState', 'replaceState']) {
        const original = history[method];
        history[method] = function () {
            const result = original.apply(this, arguments);
            onNavigate();
            return result;
        };
    }

    // Guard against the buybox re-rendering and dropping our box.
    const observer = new MutationObserver(() => {
        if (findBuybox() && !document.getElementById(BOX_ID)) {
            tryInject(5);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
