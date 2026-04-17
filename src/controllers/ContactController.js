const FrontendBaseController = require('./FrontendBaseController');
const axios = require('axios');
const Config = require('../utils/Config');
const Logger = require('../utils/Logger');

class ContactController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        // Handle POST requests for contact form
        if (req.method === 'POST') {
            return this.handleContact(req, res);
        }
        
        // For GET requests, render the page normally
        this.setup(req);
        return super.index(req, res);
    }

    /**
     * Handle contact form POST request
     */
    async handleContact(req, res) {
        try {
            const { name, email, phone, comment } = req.body;

            // Basic validation
            const errors = {};
            if (!name || name.trim().length === 0) {
                errors.name = 'Name is required';
            }
            if (!email || email.trim().length === 0) {
                errors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = 'Please enter a valid email address';
            }
            if (!comment || comment.trim().length === 0) {
                errors.comment = 'Comment is required';
            }

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({
                    success: false,
                    message: errors
                });
            }

            const contactUrl = Config.get('hashtagcms.contact_api');
            
            if (!contactUrl) {
                Logger.error('Contact API URL not configured');
                return res.status(500).json({
                    success: false,
                    message: 'Contact service is not configured'
                });
            }

            const response = await axios.post(contactUrl, {
                name,
                email,
                phone: phone || '',
                comment,
                site: Config.get('hashtagcms.context')
            }, {
                headers: {
                    'x-api-secret': Config.get(`hashtagcms.api_secrets.${Config.get('hashtagcms.context')}`) || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            Logger.info('Contact form submitted successfully', { email, name });
            
            return res.json({
                success: true,
                message: response.data?.message || 'Your message has been sent successfully!'
            });

        } catch (error) {
            Logger.error('Contact form submission failed', { 
                error: error.message,
                response: error.response?.data 
            });

            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
            
            return res.status(error.response?.status || 500).json({
                success: false,
                message: errorMessage
            });
        }
    }
}

module.exports = ContactController;
