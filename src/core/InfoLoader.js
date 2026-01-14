const { InfoKeys, LayoutKeys } = require('./Constants');
const Config = require('../../config/hashtagcms');

class InfoLoader {
    constructor() {
        this.infoKeeper = {};
        this.infoData = {};
        this.contextVars = {};
    }

    /**
     * Set Info Keeper
     */
    setInfoKeeper(key, value) {
        this.infoKeeper[key] = value;
    }

    /**
     * Get Info Keeper
     */
    getInfoKeeper(key = null) {
        if (key === null) {
            return this.infoKeeper;
        }
        return this.infoKeeper[key] || null;
    }

    /**
     * Set context variable
     */
    setContextVars(key, value) {
        this.contextVars[`:${key}`] = { key, value };
    }

    getContextVars(key) {
        return this.contextVars[key] || null;
    }

    /**
     * Set everything for later use
     * (Ported from PHP implementation)
     */
    setLoadDataObjectAndEverything(loadDataObject) {
        this.loadData = loadDataObject;
        const meta = loadDataObject.meta;
        const html = loadDataObject.html;

        // Set Info Data
        this.setSiteData(meta.site);
        this.setPlatformData(meta.platform);
        this.setLangData(meta.lang);
        this.setCategoryData(meta.category);
        this.setPageData(meta.page);
        this.setThemeData(meta.theme);
        this.setSitePropsData(meta.props);

        this.setHeaderContent(html.head.headerContent);
        this.setFooterContent(html.body.footer.footerContent);

        this.setMetaTitle(html.head.title);
        this.setMetaCanonical(html.head.meta.metaCanonical);
        this.setMetaDescription(html.head.meta.metaDescription);
        this.setMetaKeywords(html.head.meta.metaKeywords);
        this.setMetaRobots(html.head.meta.metaRobots);
        this.setFavIcon(html.head.links && html.head.links.length > 0 ? html.head.links[0].href : '');
        this.setThemeSkeleton(html.body.content.skeleton);
    }

    // Setters and Getters for InfoData
    setSiteData(data) { this.infoData[InfoKeys.SITE_DATA] = data; }
    getSiteData() { return this.infoData[InfoKeys.SITE_DATA]; }

    setPlatformData(data) { this.infoData[InfoKeys.PLATFORM_DATA] = data; }
    getPlatformData() { return this.infoData[InfoKeys.PLATFORM_DATA]; }

    setLangData(data) {
        this.infoData[InfoKeys.LANG_DATA] = data;
        if (data) {
            this.setInfoKeeper(LayoutKeys.LANG_ID, data.id);
            this.setInfoKeeper(LayoutKeys.LANG_ISO_CODE, data.isoCode);
        }
    }
    getLangData() { return this.infoData[InfoKeys.LANG_DATA]; }
    getLangIsoCode() { return this.getInfoKeeper(LayoutKeys.LANG_ISO_CODE); }

    setCategoryData(data) { this.infoData[InfoKeys.CATEGORY_DATA] = data; }
    getCategoryData() { return this.infoData[InfoKeys.CATEGORY_DATA]; }

    setPageData(data) { this.infoData[InfoKeys.PAGE_DATA] = data; }
    getPageData() { return this.infoData[InfoKeys.PAGE_DATA]; }

    setThemeData(data) { this.infoData[InfoKeys.THEME_DATA] = data; }
    getThemeData() { return this.infoData[InfoKeys.THEME_DATA]; }

    setSitePropsData(data) { this.infoData[InfoKeys.SITE_PROP_DATA] = data; }
    getSitePropsData() { return this.infoData[InfoKeys.SITE_PROP_DATA]; }

    setHeaderContent(data) {
        // Assuming data is array of objects { html: "..." }
        let content = (data && data.length > 0) ? data[0].html : '';
        // Force asset version
        const v = Config.assets_version;
        if (v && content) {
            content = content.replace(/([?&]v=)[^&"']+/g, `$1${v}`);
        }
        this.infoData[InfoKeys.HEADER_CONTENT] = content;
    }
    getHeaderContent() { return this.infoData[InfoKeys.HEADER_CONTENT]; }

    setFooterContent(data) {
        let content = (data && data.length > 0) ? data[0].html : '';
        // Force asset version
        const v = Config.assets_version;
        if (v && content) {
            content = content.replace(/([?&]v=)[^&"']+/g, `$1${v}`);
        }
        this.infoData[InfoKeys.FOOTER_CONTENT] = content;
    }
    getFooterContent() {         
        return this.infoData[InfoKeys.FOOTER_CONTENT]; 
    }

    setMetaTitle(val) { this.infoData[InfoKeys.META_TITLE] = val; }
    getMetaTitle() { return this.infoData[InfoKeys.META_TITLE]; }

    setMetaCanonical(val) { this.infoData[InfoKeys.META_CANONICAL] = val; }
    getMetaCanonical() { return this.infoData[InfoKeys.META_CANONICAL]; }

    setMetaDescription(val) { this.infoData[InfoKeys.META_DESCRIPTION] = val; }
    getMetaDescription() { return this.infoData[InfoKeys.META_DESCRIPTION]; }

    setMetaKeywords(val) { this.infoData[InfoKeys.META_KEYWORDS] = val; }
    getMetaKeywords() { return this.infoData[InfoKeys.META_KEYWORDS]; }

    setMetaRobots(val) { this.infoData[InfoKeys.META_ROBOTS] = val; }
    getMetaRobots() { return this.infoData[InfoKeys.META_ROBOTS]; }

    setFavIcon(val) { this.infoData[InfoKeys.FAV_ICON] = val; }
    getFavIcon() { return this.infoData[InfoKeys.FAV_ICON]; }

    setThemeSkeleton(val) { this.infoData[InfoKeys.THEME_SKELETON] = val; }
    getThemeSkeleton() { return this.infoData[InfoKeys.THEME_SKELETON]; }

    getSiteProps() {
        // Return object keys
        const props = {};
        const data = this.getSitePropsData();
        if (data) {
            data.forEach(p => props[p.name] = p.value);
        }
        return props;
    }

    setAppCallableValue(val) { this.setInfoKeeper('APP_CALLABLE_VALUE', val); }
    getAppCallableValue() { return this.getInfoKeeper('APP_CALLABLE_VALUE') || []; }

    getCategoryName() { return this.getInfoKeeper(LayoutKeys.CATEGORY_NAME); }

    setConfigs(data) { this.configs = data; }
    getConfigs() { return this.configs || {}; }

    setParsedParams(parsed) { this.parsedParams = parsed; }
    getParsedParams() { return this.parsedParams || {}; }
}

module.exports = InfoLoader;
