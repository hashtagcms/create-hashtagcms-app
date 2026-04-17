/**
 * HashtagCMS Node.js Frontend - Core JavaScript
 * 
 * Inspired by the HashtagCMS Laravel Modern theme app.js
 */

import { Newsletter, Analytics, AppConfig, Contact, FormValidator, validateForm } from '@hashtagcms/web-sdk';

// Initialize and expose SDK core modules globally on window.HashtagCms
// This makes them available for inline scripts and maintaining consistency across the ecosystem
window.HashtagCms = {
    ...(window.HashtagCms || {}),
    // Form Components
    Newsletter: Newsletter,
    Contact: Contact,
    FormSubmitter: Newsletter,  // Alias for backward compatibility
    FormValidator: FormValidator,
    validateForm: validateForm,
    
    // Analytics & Config - instantiated for immediate use
    Analytics: null, // Will be initialized on DOM ready with config
    AppConfig: new AppConfig(window.HashtagCms?.configData || {})
};

/**
 * Lightweight Parallax Utility
 */
class Parallax {
    constructor() {
        this.elements = document.querySelectorAll('.js-parallax');
        if (this.elements.length === 0) return;
        
        this.onScroll = this.onScroll.bind(this);
        window.addEventListener('scroll', () => {
            requestAnimationFrame(this.onScroll);
        }, { passive: true });
        
        this.onScroll(); // Initial position
    }

    onScroll() {
        const scrollY = window.pageYOffset;
        this.elements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.1;
            const yPos = -(scrollY * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

// Initialize components on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Base Configuration
    const config = window.HashtagCmsConfig || {};

    // 1. Initialize Analytics and AppConfig
    // We disable beacon to ensure the request goes through our Node.js proxy with standard headers
    window.HashtagCms.Analytics = new Analytics({
        publishUrl: config.publishApi || '/common/publish',
        enableBeacon: false 
    });

    // 2. Initialize Parallax
    window.HashtagCms.Parallax = new Parallax();

    // 3. Setup Automatic Form Handling (Newsletter & Contact)
    
    // Newsletter/Subscribe Form
    const subscribeForm = document.querySelector("form[data-form='subscribe-form']") || 
                          document.querySelector("form[data-form='newsletter-form']");
    if (subscribeForm) {
        new Newsletter({
            form: subscribeForm,
            messageHolder: document.querySelector("div[data-message-holder='subscribe-message-holder']") ||
                          document.querySelector("div[data-message-holder='newsletter-message-holder']"),
            submitUrl: config.subscribeApi || '/common/newsletter'
        });
    }

    // Contact Form
    const contactForm = document.querySelector("form[data-form='contact-form']");
    if (contactForm) {
        new Contact({
            form: contactForm,
            messageHolder: document.querySelector("div[data-message-holder='contact-message-holder']"),
            submitUrl: config.contactApi || '/common/contact'
        });
    }

    // 4. Automatic Analytics Tracking (track page view on load)
    if (typeof window._siteProps_ !== 'undefined' && window.HashtagCms.Analytics) {
        try {
            const cId = parseInt(window._siteProps_.categoryId);
            const pId = parseInt(window._siteProps_.pageId);

            if (!isNaN(cId)) {
                //console.log("HashtagCMS: Tracking page view...", { categoryId: cId, pageId: pId });
                window.HashtagCms.Analytics.trackCmsPage({ 
                    categoryId: cId, 
                    pageId: isNaN(pId) ? null : pId 
                });
            } else {
                console.warn("HashtagCMS: Tracking skipped - Invalid categoryId", window._siteProps_);
            }
        } catch (e) {
            console.error("HashtagCMS Analytics Tracking Error:", e);
        }
    }
});
