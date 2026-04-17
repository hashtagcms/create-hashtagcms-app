const Controller = require('./Controller');
const LayoutManager = require('../core/LayoutManager');
const CmsService = require('../services/CmsService');
const ViewHelpers = require('../helpers/ViewHelpers');
const Logger = require('../utils/Logger');
const Config = require('../utils/Config');
const { VIEW_PREFIX } = require('../core/Constants');

class FrontendBaseController extends Controller {
    constructor() {
        super();
        this.layoutManager = null;
        this.infoLoader = null;
    }

    /**
     * Initialize the controller logic
     * @param {Object} req 
     */
    setup(req) {
        this.infoLoader = req.hashtagCms.infoLoader;
        if (!this.layoutManager) {
            this.layoutManager = new LayoutManager(this.infoLoader, CmsService);
        }
    }

    /**
     * Main entry point for rendering pages
     * @param {Object} req 
     * @param {Object} res 
     */
    async index(req, res) {
        const timings = {
            start: Date.now(),
            setup: 0,
            loadData: 0,
            parseModules: 0,
            render: 0,
            total: 0
        };
        
        try {
            this.setup(req);
            timings.setup = Date.now() - timings.start;

            // 0. Extract Query Params allowed in config
            const allowedParams = Config.get('hashtagcms.query_params_to_load_data', '').split(',').map(p => p.trim());
            const queryParams = {};
            allowedParams.forEach(param => {
                if (param && req.query[param]) {
                    queryParams[param] = req.query[param];
                }
            });

            // 1. Init (Load Data)
            const loadDataStart = Date.now();
            const result = await this.layoutManager.init(null, queryParams);
            timings.loadData = Date.now() - loadDataStart;

            // 2. Status Check
            if (!result || (result.status && result.status !== 200)) {
                const status = result ? result.status : 404;
                return res.status(status).render('404', { message: result ? result.message : 'Not Found' });
            }

            // 3. Mandatory Content Check
            const isContentRequired = this.layoutManager.getMandatoryCheck();
            const isContentFound = result.isContentFound !== false; // Default true unless explicitly false

            if (isContentRequired && !isContentFound) {
                return res.status(404).send('Content not found!');
            }

            // 4. Login Requirement Check
            if (result.isLoginRequired && (!req.session.user || !req.session.user.id)) {
                const categoryData = this.infoLoader.getCategoryData();
                const categoryLink = categoryData ? categoryData.linkRewrite : '';
                const qParams = new URLSearchParams(req.query).toString();
                return res.redirect(`/login?redirect=/${categoryLink}?${qParams}`);
            }

            // 5. Setup View Helpers (Locals)
            const lang = this.infoLoader.getLangIsoCode() || 'en';
            res.locals.helper = ViewHelpers.createForRequest(lang, this.infoLoader);

            // 6. Parse Skeleton (Render Modules)
            const parseStart = Date.now();
            const theme = this.infoLoader.getThemeData();
            await this.layoutManager.parseSkeletonForView(theme, res);
            timings.parseModules = Date.now() - parseStart;

            // 7. Resolve and Render Master View
            const renderStart = Date.now();
            const themeDir = theme.directory || 'basic';
            const viewName = `${VIEW_PREFIX}/${themeDir}/_layout_/index`;

            // ============================================
            // HTTP CACHE POLICY
            // ============================================
            const isUserLoggedIn = req.session.user && req.session.user.id;
            const cacheMaxAge = Config.get('hashtagcms.http_cache_max_age', 60);

            if (isUserLoggedIn) {
                // Private content - do not cache
                res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.set('Pragma', 'no-cache');
                res.set('Expires', '0');
            } else {
                // Public content
                if (process.env.NODE_ENV === 'production') {
                    res.set('Cache-Control', `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`);
                } else {
                    res.set('Cache-Control', 'no-cache');
                }
            }

            timings.render = Date.now() - renderStart;
            timings.total = Date.now() - timings.start;

            res.render(viewName, {
                cms: {
                    layoutManager: this.layoutManager,
                    siteProps: this.infoLoader.getSiteProps(),
                    data: this.infoLoader.getConfigs(),
                    meta: result.meta,
                    config: Config.get('hashtagcms'), // Expose hashtagcms config for API URLs
                    performance: {
                        loadDataTime: timings.loadData,
                        pageRenderTime: timings.total
                    }
                },
                user: res.locals.user || null,
                inputs: res.locals.inputs || {},
                errors: res.locals.errors || [],
                session: res.locals.session || {}
            });
            

            // Log performance metrics
            Logger.info('Page render completed', {
                url: req.path,
                timings: {
                    setup: `${timings.setup}ms`,
                    loadData: `${timings.loadData}ms`,
                    parseModules: `${timings.parseModules}ms`,
                    render: `${timings.render}ms`,
                    total: `${timings.total}ms`
                },
                theme: themeDir,
                lang
            });

        } catch (e) {
            timings.total = Date.now() - timings.start;
            Logger.error('FrontendBaseController error', { 
                error: e.message, 
                stack: e.stack,
                url: req.path,
                duration: `${timings.total}ms`
            });
        }
    }

    /**
     * Bind data for a specific view
     */
    bindDataForView(viewName, data) {
        if (this.layoutManager) this.layoutManager.bindDataForView(viewName, data);
    }

    /**
     * Replace a view with another one
     */
    replaceViewWith(source, target, data) {
        if (this.layoutManager) this.layoutManager.replaceViewWith(source, target, data);
    }

    /**
     * Set mandatory content check
     */
    setModuleMandatoryCheck(val) {
        if (this.layoutManager) this.layoutManager.setMandatoryCheck(val);
    }
}

module.exports = FrontendBaseController;
