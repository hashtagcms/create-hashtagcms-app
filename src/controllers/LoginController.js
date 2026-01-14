const FrontendBaseController = require('./FrontendBaseController');
const CmsService = require('../services/CmsService');

class LoginController extends FrontendBaseController {

    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);

        // Redirect if already logged in
        if (req.session.user && req.session.user.id) {
            const redirectPath = req.query.redirect || '/';
            return res.redirect(redirectPath);
        }

        if (req.method === 'POST') {
            return this.login(req, res);
        }

        // Bind 'redirect' param to view if present
        if (req.query.redirect) {
            this.bindDataForView('auth/login', { redirect: req.query.redirect });
        }

        return super.index(req, res);
    }

    async login(req, res) {
        const { email, password, redirect } = req.body;

        const result = await CmsService.login(email, password);

        if (result && result.token && result.token.access_token) {
            // Success
            req.session.token = result.token.access_token;
            req.session.user = result.user;

            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.json({ message: 'Login successful', redirect: redirect || '/' });
            }
            return res.redirect(redirect || '/');
        }

        // Failure
        const errorMsg = result.message || 'Login failed';

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.status(422).json({ message: errorMsg });
        }

        // Pass errors to view
        res.locals.errors = { email: [errorMsg] };
        res.locals.inputs = req.body;

        return super.index(req, res);
    }
}

module.exports = LoginController;
