// ==UserScript==
// @name         Takealot Price Tracker
// @namespace    http://tampermonkey.net/
// @version      0.4.0
// @description  Adds a "Price History" button (via servaltracker.com) and a normalized rating to Takealot product pages.
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
        price: '[class*="buybox-module_price"]',
        rating: '[class*="rating-module_rating-wrapper"]',
        reviews: '.reviews.cell.shrink',
    };

    /** Remove any UI this script previously injected. */
    function removeInjectedUI() {
        document.querySelectorAll('#' + BOX_ID).forEach((el) => el.remove());
    }

    /** Takealot rating (0-5) -> normalized 0-100% on an 11-point scale. */
    function normalizedRating(stars) {
        return Math.trunc(((2 * stars + 1) / 11) * 100);
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

        const ratingEl = document.querySelector(SELECTORS.rating);
        const stars = ratingEl ? parseFloat(ratingEl.innerText) : NaN;
        if (!Number.isNaN(stars)) {
            const line = document.createElement('div');
            line.textContent = `Normalized rating: ${normalizedRating(stars)}%`;
            line.style.marginBottom = '6px';
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
        const price = document.querySelector(SELECTORS.price);
        if (!price) return false;
        if (document.getElementById(BOX_ID)) return true;
        price.appendChild(buildUI());
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
        if (document.querySelector(SELECTORS.price) && !document.getElementById(BOX_ID)) {
            tryInject(5);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
