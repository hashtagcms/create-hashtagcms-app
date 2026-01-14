const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Load config ONCE when module loads
const config = require('../../config/hashtagcms');
const Logger = require('../utils/Logger');

/**
 * View Helpers
 * 
 * Collection of helper functions available in EJS views via the `helper` object.
 * These are stateless utility functions that can be reused across all requests.
 */
class ViewHelpers {
    
    /**
     * Configuration loaded once at class level
     */
    static assetBasePath = config.asset_base_path || '/assets/hashtagcms/fe';
    static adminBaseUrl = config.admin_base_url;
    static assetsVersion = config.assets_version || '';
    
    /**
     * Cache for loaded translations to avoid repeated file reads
     */
    static translationCache = {};
    
    /**
     * Generate asset URL for theme resources
     * @param {string} p - Asset path (e.g., 'img/logo.png')
     * @param {string} themeDir - Theme directory (e.g., 'basic', 'elegant')
     * @returns {string} - Full asset URL
     */
    static asset(p, themeDir = 'basic') {
        const v = this.assetsVersion;
        
        if (v) {
            if (p.includes('v=')) {
                // Force replace existing version
                p = p.replace(/([?&])v=[^&]*/, `$1v=${v}`);
            } else {
                // Append version
                const separator = p.includes('?') ? '&' : '?';
                p = `${p}${separator}v=${v}`;
            }
        }
        
        return `${this.assetBasePath}/${themeDir}/${p}`;
    }
    
    /**
     * Translate text using language files
     * @param {string} key - Translation key (e.g., 'hashtagcms::auth.Login')
     * @param {string} lang - Language code (from res.locals)
     * @returns {string} - Translated text or key if not found
     */
    static trans(key, lang = 'en') {
        const transData = this.getTranslations(lang);
        const cleanKey = key.replace('hashtagcms::', '');
        const parts = cleanKey.split('.');
        
        if (parts.length === 2 && transData[parts[0]]) {
            return transData[parts[0]][parts[1]] || parts[parts.length - 1];
        }
        
        return key;
    }
    
    /**
     * Get path with language and platform prefix
     * Matches PHP htcms_get_path() functionality
     * @param {string} linkPath - The path (e.g., 'blog/my-post')
     * @param {boolean} fullPath - Whether to include lang/platform (default: true)
     * @param {Object} infoLoader - InfoLoader from res.locals
     * @returns {string} - Full URL path
     */
    static getPath(linkPath, fullPath = true, infoLoader = null) {
        const cleanPath = linkPath.trim().replace(/^\/+/, '');
        
        if (fullPath && infoLoader) {
            const langData = infoLoader.getLangData();
            const platformData = infoLoader.getPlatformData();
            
            // Check if lang/platform were explicitly in the URL
            const foundLang = infoLoader.getInfoKeeper('foundLang');
            const foundPlatform = infoLoader.getInfoKeeper('foundPlatform');
            
            // Only add prefix if they were present in the original request
            if (foundLang && foundPlatform && langData && platformData) {
                const langCode = langData.isoCode;
                const platformCode = platformData.linkRewrite;
                const prefix = `${langCode}/${platformCode}`;
                
                // Check if path already has the prefix
                if (cleanPath.startsWith(prefix)) {
                    return `/${cleanPath}`; 
                }
                
                return `/${langCode}/${platformCode}/${cleanPath}`;
            }
        }
        
        return `/${cleanPath}`;
    }
    
    /**
     * Get admin panel URL
     * @param {string} path - Admin path (e.g., 'dashboard', 'users')
     * @returns {string} - Full admin URL
     */
    static adminPath(path = '') {
        const cleanPath = path.trim().replace(/^\/+/, '');
        
        if (cleanPath) {
            return `${this.adminBaseUrl}/${cleanPath}`;
        }
        
        return this.adminBaseUrl;
    }
    
    /**
     * Generate MD5 hash of a string
     * @param {string} str - String to hash
     * @returns {string} - MD5 hash
     */
    static md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }
    
    /**
     * Format date in human-readable format
     * @param {string|Date} d - Date to format
     * @returns {string} - Formatted date string
     */
    static formatDate(d) {
        if (!d) return '';
        
        return new Date(d).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    /**
     * Get translations for a language (with caching)
     * @param {string} lang - Language code
     * @returns {Object} - Translation data
     */
    static getTranslations(lang) {
        // Check cache first
        if (this.translationCache[lang]) {
            return this.translationCache[lang];
        }
        
        // If not in cache, return empty (should be preloaded)
        Logger.warn('Translation not preloaded', { lang });
        return {
            modules: {},
            links: {},
            auth: {},
            common: {}
        };
    }
    
    /**
     * OPTIMIZATION: Preload all translations asynchronously at startup
     * Eliminates all blocking file I/O during requests
     * @returns {Promise<void>}
     */
    static async preloadAllTranslations() {
        const languages = this.getSupportedLanguages();
        const files = ['modules', 'links', 'auth', 'common'];
        
        Logger.info('Preloading translations asynchronously...');
        
        await Promise.all(
            languages.map(async (lang) => {
                const transData = {};
                
                await Promise.all(
                    files.map(async (file) => {
                        const localePath = path.join(__dirname, `../../resources/lang/${lang}/hashtagcms/${file}.json`);
                        try {
                            const content = await fs.promises.readFile(localePath, 'utf8');
                            transData[file] = JSON.parse(content);
                        } catch (e) {
                            Logger.warn(`Translation file not found: ${lang}/${file}.json`);
                            transData[file] = {};
                        }
                    })
                );
                
                this.translationCache[lang] = transData;
                Logger.info(`  ✓ Translations preloaded for '${lang}'`);
            })
        );
    }
    
    /**
     * Get supported languages from environment
     * @returns {string[]}
     */
    static getSupportedLanguages() {
        const langString = process.env.SUPPORTED_LANGUAGES || 'en,hi';
        return langString.split(',').map(lang => lang.trim());
    }
    
    /**
     * Create helper object bound to request context
     * This creates closures that have access to the current request's infoLoader and language
     * @param {string} lang - Language code
     * @param {Object} infoLoader - InfoLoader instance
     * @returns {Object} - Helper functions bound to request context
     */
    static createForRequest(lang, infoLoader) {
        // Get theme directory from infoLoader
        const themeData = infoLoader?.getThemeData();
        const themeDir = themeData?.directory || 'basic';
        
        return {
            asset: (p) => this.asset(p, themeDir),
            trans: (key) => this.trans(key, lang),
            getPath: (linkPath, fullPath = true) => this.getPath(linkPath, fullPath, infoLoader),
            adminPath: (path = '') => this.adminPath(path),
            md5: (str) => this.md5(str),
            formatDate: (d) => this.formatDate(d)
        };
    }
}

module.exports = ViewHelpers;
