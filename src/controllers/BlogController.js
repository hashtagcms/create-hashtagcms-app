const FrontendBaseController = require('./FrontendBaseController');
const CmsService = require('../services/CmsService');
const { LayoutKeys } = require('../core/Constants');

class BlogController extends FrontendBaseController {

    constructor() {
        super();
    }

    async index(req, res) {
        this.setup(req);

        const callableValue = this.infoLoader.getAppCallableValue();

        // Check if it's blog home (listing page like /blog)
        if (!callableValue || callableValue.length === 0) {
            // Blog Listing Page
            this.setModuleMandatoryCheck(false);  // Allow missing modules in load-data response

            const lang = this.infoLoader.getLangIsoCode();
            const platform = this.infoLoader.getInfoKeeper(LayoutKeys.PLATFORM_LINKREWRITE);
            const category = this.infoLoader.getCategoryName();
            const limit = process.env.BLOG_PER_PAGE || 10;

            // Fetch latest blogs
            const results = await CmsService.getLatestBlog(category, lang, platform, limit);

            // Replace 'story' module with 'stories' module and inject data
            this.replaceViewWith('story', 'stories', { data: results });

            // Bind data for comments view
            this.bindDataForView('story-comments', { isBlogHome: true });
        }

        // For both listing and single post, call parent to handle rendering
        return super.index(req, res);
    }
}

module.exports = BlogController;
