const express = require('express');
const router = express.Router();
const HashtagCmsInterceptor = require('../middleware/HashtagCmsInterceptor');
const { LayoutKeys } = require('../core/Constants');

// Controllers
const FrontendController = require('../controllers/FrontendController');
const AnalyticsController = require('../controllers/AnalyticsController');
const BlogController = require('../controllers/BlogController');
const CommentController = require('../controllers/CommentController');
const CommonController = require('../controllers/CommonController');
const LoginController = require('../controllers/LoginController');
const LogoutController = require('../controllers/LogoutController');
const PasswordController = require('../controllers/PasswordController');
const ProfileController = require('../controllers/ProfileController');
const RegisterController = require('../controllers/RegisterController');

const controllers = {
    FrontendController,
    AnalyticsController,
    BlogController,
    CommentController,
    CommonController,
    LoginController,
    LogoutController,
    PasswordController,
    ProfileController,
    RegisterController
};

// Health Check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all route for CMS pages (exclude assets)
router.all(/^\/(?!assets|favicon).*/, HashtagCmsInterceptor, async (req, res, next) => {
    try {
        const infoLoader = req.hashtagCms.infoLoader;

        // Try getting category data if loaded
        const categoryData = infoLoader.getCategoryData();
        let linkRewrite = categoryData ? categoryData.linkRewrite : '';

        const parsedParams = req.hashtagCms.parsedParams || {};

        // If not loaded, use the Category Name determined by Interceptor/UrlParser
        if (!linkRewrite) {
            // Prefer base linkRewrite from parser to ensure correct Controller mapping (e.g. 'blog' instead of 'blog/test')
            linkRewrite = parsedParams.linkRewrite || infoLoader.getInfoKeeper(LayoutKeys.CATEGORY_NAME);
        }

        // Clean linkRewrite (remove leading slash if present, though usually clean)
        if (linkRewrite && linkRewrite.startsWith('/')) linkRewrite = linkRewrite.substring(1);

        let controllerName = 'FrontendController';


        if (parsedParams && parsedParams.controllerName) {
            // If explicit controller is defined in category config
            controllerName = parsedParams.controllerName;
            // Ensure it has 'Controller' suffix if not? PHP usually includes it or sets it as 'BlogController'.
            // Assuming the config provides the full class name or we might need to adjust.
        } else if (linkRewrite) {
            // "blog" -> "BlogController"
            // "login" -> "LoginController"
            // Handle slashes: "blog/test-blog" -> "BlogTestBlogController" ??
            // Actually, if it's nested and no explicit controller, we probably default to FrontendController or parent?
            // PHP logic: str_replace('-', '', Str::title($controller_name)) . 'Controller';

            // Clean linkRewrite for class name generation
            const cleanLink = linkRewrite.replace(/-/g, '').replace(/\//g, '');
            const potentialName = cleanLink.charAt(0).toUpperCase() + cleanLink.slice(1) + 'Controller';

            if (controllers[potentialName]) {
                controllerName = potentialName;
            }
        }

        console.log(`[Router] Dispatching logic: Link=${linkRewrite}, Controller=${controllerName}`);

        const ControllerClass = controllers[controllerName];
        if (!ControllerClass) {
            console.error(`Controller ${controllerName} not found despite check.`);
            // Fallback
            const fallback = new FrontendController();
            return await fallback.index(req, res);
        }

        const controller = new ControllerClass();
        await controller.index(req, res);

    } catch (error) {
        console.error("Routing Error:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
