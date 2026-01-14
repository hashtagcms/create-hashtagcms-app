const FrontendBaseController = require('./FrontendBaseController');
const CmsService = require('../services/CmsService');

class LogoutController extends FrontendBaseController {
    constructor() {
        super();
    }

    async index(req, res) {
        // Handle logout
        if (req.session.token) {
            await CmsService.logout(req.session.token);
        }

        req.session.destroy((err) => {
            if (err) console.error("Session destroy error", err);
            res.redirect('/');
        });
    }
}
module.exports = LogoutController;
