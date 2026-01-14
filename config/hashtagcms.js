require('dotenv').config();

const config = {
    context: process.env.HASHTAGCMS_CONTEXT || 'hashtagcms',
    message: {
        zeroModuleSelected: "<div style='margin: 100px; text-align: center; font-size: 70px; color:mediumvioletred'>There is no module assigned for this category</div>",
    },
    blog_per_page: 10,
    more_categories_on_blog_listing: [],
    query_params_to_load_data: process.env.HASHTAGCMS_QUERY_PARAMS_TO_LOAD_DATA || '',

    // API Secrets
    api_secrets: {
        [process.env.HASHTAGCMS_CONTEXT || 'procms']: process.env.HASHTAGCMS_API_SECRET || '61c58507bbac1'
    },

    // External API Configuration
    external_api_base_url: process.env.HASHTAGCMS_API_BASE_URL || process.env.APP_URL,

    // API Endpoints
    config_api: process.env.HASHTAGCMS_CONFIG_API,
    data_api: process.env.HASHTAGCMS_DATA_API,
    blog_api: process.env.HASHTAGCMS_BLOG_API,
    login_api: process.env.HASHTAGCMS_LOGIN_API,
    logout_api: process.env.HASHTAGCMS_LOGOUT_API,
    user_me_api: process.env.HASHTAGCMS_USER_ME_API,
    user_profile_update_api: process.env.HASHTAGCMS_USER_PROFILE_UPDATE_API,
    publish_api: process.env.HASHTAGCMS_PUBLISH_API,
    contact_api: process.env.HASHTAGCMS_CONTACT_API,
    subscribe_api: process.env.HASHTAGCMS_SUBSCRIBE_API,

    // Cache & Timeout
    external_service_timeout: parseInt(process.env.HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT || 5), // seconds
    external_config_cache_ttl: parseInt(process.env.HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL || 60), // minutes
    external_data_cache_ttl: parseInt(process.env.HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL || 30), // minutes
    http_cache_max_age: parseInt(process.env.HASHTAGCMS_HTTP_CACHE_MAX_AGE || 60), // seconds

    // Asset Configuration
    asset_base_path: process.env.ASSET_BASE_PATH || '/assets/hashtagcms/fe',

    // Admin Panel URL
    admin_base_url: process.env.ADMIN_BASE_URL || 'http://localhost:8000/admin',
    assets_version: process.env.ASSETS_VERSION || '110120260728',
};

module.exports = config;
