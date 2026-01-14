class UrlParser {

    /**
     * Parse the URL path to extract lang, platform, and category
     * Emulates MarghoobSuleman\HashtagCms\Core\Middleware\Traits\BaseInfo logic
     * 
     * @param {string} path - Request path (req.path)
     * @param {object} configData - CMS Configuration (langs, platforms, categories, defaultData)
     */
    static parse(path, configData) {

        // Normalize path
        let cleanPath = path.replace(/\/\//g, '/');
        let pathArr = cleanPath.split('/').filter(p => p !== '');

        const langs = configData.lang || configData.langs || [];
        const platforms = configData.platformData || configData.platforms || [];
        const defaultData = configData.defaultData || {};

        let foundLang = null;
        let foundPlatform = null;

        // 1. Check for Language
        if (pathArr.length > 0) {
            const potentialLang = pathArr[0];
            foundLang = langs.find(l => l.isoCode === potentialLang);
            if (foundLang) {
                // Found
            }
        }

        // 2. Check for Platform
        // Platform index depends on whether lang was found
        let platformIndex = foundLang ? 1 : 0;

        if (pathArr.length > platformIndex) {
            const potentialPlatform = pathArr[platformIndex];
            foundPlatform = platforms.find(p => p.linkRewrite === potentialPlatform);
        }

        // 3. Remove Found Segments from Path
        if (foundLang) {
            pathArr.shift(); // Remove Lang
        }
        if (foundPlatform) {
            pathArr.shift(); // Remove Platform (it will be at index 0 now if lang was removed)
        }

        // 4. Resolve Final Objects
        // Use found objects or defaults
        const langObj = foundLang || langs.find(l => l.id === defaultData.langId) || { isoCode: 'en' };
        const platformObj = foundPlatform || platforms.find(p => p.id === defaultData.platformId) || { linkRewrite: 'web' };

        // 5. Determine Category / Link Rewrite
        const categories = configData.categories || [];
        let category = '/';
        let callableValue = [];
        let foundCategory = null;

        if (pathArr.length === 0) {
            // Root
            if (defaultData.categoryId) {
                foundCategory = categories.find(c => c.id === defaultData.categoryId);
                category = foundCategory ? foundCategory.linkRewrite : '/';
            }
        } else {
            // Try to match path segments (Longest Prefix Match)
            let tempPathArr = [...pathArr];
            let matched = false;
            let popped = [];

            while (tempPathArr.length > 0) {
                const checkPath = tempPathArr.join('/');
                const checkPathSlash = checkPath + '/';
                const match = categories.find(c => c.linkRewrite === checkPath || c.linkRewrite === checkPathSlash); // Handle potential trailing slash diffs
                if (match) {
                    category = checkPath;
                    foundCategory = match;
                    matched = true;
                    break;
                }
                // Not found, pop
                popped.unshift(tempPathArr.pop());
            }

            if (matched) {
                callableValue = popped;
            } else {
                // No matching category found in explicit list
                // Use default category and treat all path as callable
                if (defaultData.categoryId) {
                    foundCategory = categories.find(c => c.id === defaultData.categoryId);
                    category = foundCategory ? foundCategory.linkRewrite : '/';
                }
                callableValue = pathArr;
            }
        }

        return {
            lang: langObj.isoCode || 'en',
            platform: platformObj.linkRewrite || 'web',
            linkRewrite: category,
            callableValue: callableValue,
            foundLang: !!foundLang,
            foundPlatform: !!foundPlatform,
            controllerName: foundCategory ? foundCategory.controllerName : null,
            linkRewritePattern: foundCategory ? foundCategory.linkRewritePattern : null
        };
    }
}

module.exports = UrlParser;
