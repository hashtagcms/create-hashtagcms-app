// Import Basic Theme from @hashtagcms/web-ui-kit package
//import '@hashtagcms/web-ui-kit/src/themes/basic/js/app';

import { Analytics, Newsletter, AppConfig, Contact } from "@hashtagcms/web-sdk";

// Wait for DOM to be ready before initializing form handlers
document.addEventListener('DOMContentLoaded', () => {
    window.HashtagCms = window.HashtagCms || { configData: {} };

    // Get API URLs from the config injected in the layout
    const config = window.HashtagCmsConfig || {};
    const subscribeApiUrl = config.subscribeApi || '/common/newsletter';
    const contactApiUrl = config.contactApi || '/common/contact';

    // Initialize Newsletter - find the subscribe form and configure
    const subscribeForm = document.querySelector("form[data-form='subscribe-form']") || 
                          document.querySelector("form[data-form='newsletter-form']");
    
    if (subscribeForm) {
        window.HashtagCms.Newsletter = new Newsletter({
            form: subscribeForm,
            messageHolder: document.querySelector("div[data-message-holder='subscribe-message-holder']") ||
                          document.querySelector("div[data-message-holder='newsletter-message-holder']"),
            submitUrl: subscribeApiUrl
        });
        window.HashtagCms.Subscribe = window.HashtagCms.Newsletter; // Legacy support
    }

    // Initialize Contact - find the contact form and configure
    const contactForm = document.querySelector("form[data-form='contact-form']");
    
    if (contactForm) {
        window.HashtagCms.Contact = new Contact({
            form: contactForm,
            messageHolder: document.querySelector("div[data-message-holder='contact-message-holder']"),
            submitUrl: contactApiUrl
        });
    }

    // Initialize Analytics and AppConfig
    window.HashtagCms.Analytics = new Analytics();
    window.HashtagCms.AppConfig = new AppConfig();
});
