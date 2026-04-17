const FrontendBaseController = require('./FrontendBaseController');
const axios = require('axios');
const Config = require('../utils/Config');
const Logger = require('../utils/Logger');

class SubscribeController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        // Handle POST requests for newsletter subscription
        if (req.method === 'POST') {
            return this.handleSubscribe(req, res);
        }
        
        // For GET requests, render the page normally
        this.setup(req);
        return super.index(req, res);
    }

    /**
     * Handle newsletter subscription POST request
     */
    async handleSubscribe(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const subscribeUrl = Config.get('hashtagcms.subscribe_api');
            
            if (!subscribeUrl) {
                Logger.error('Subscribe API URL not configured');
                return res.status(500).json({
                    success: false,
                    message: 'Newsletter service is not configured'
                });
            }

            const response = await axios.post(subscribeUrl, {
                email,
                site: Config.get('hashtagcms.context')
            }, {
                headers: {
                    'x-api-secret': Config.get(`hashtagcms.api_secrets.${Config.get('hashtagcms.context')}`) || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            Logger.info('Newsletter subscription successful', { email });
            
            return res.json({
                success: true,
                message: response.data?.message || 'Successfully subscribed to newsletter!'
            });

        } catch (error) {
            Logger.error('Newsletter subscription failed', { 
                error: error.message,
                response: error.response?.data 
            });

            const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
            
            return res.status(error.response?.status || 500).json({
                success: false,
                message: errorMessage
            });
        }
    }
}

module.exports = SubscribeController;
