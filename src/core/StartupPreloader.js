const CmsService = require('../services/CmsService');
const ViewHelpers = require('../helpers/ViewHelpers');
const Logger = require('../utils/Logger');

/**
 * Startup Preloader
 * 
 * Preloads critical data on server startup to make first requests faster.
 * This includes:
 * - Site configurations (menus, settings, etc.)
 * - Translation files
 */
class StartupPreloader {
    
    /**
     * Preload all critical data
     * @returns {Promise<void>}
     */
    static async preload() {
        Logger.info('Starting data preload...');
        const startTime = Date.now();
        
        try {
            // Preload configurations and translations in parallel
            await Promise.all([
                this.preloadConfigs(),
                this.preloadTranslations()
            ]);
            
            const duration = Date.now() - startTime;
            Logger.info(`✅ Preload complete in ${duration}ms`);
            Logger.info('First request will be much faster!');
            
        } catch (error) {
            Logger.error('⚠️  Preload failed', { error: error.message, stack: error.stack });
            Logger.warn('Server will continue, but first request may be slower');
        }
    }
    
    /**
     * Preload site configurations
     */
    static async preloadConfigs() {
        const languages = this.getSupportedLanguages();
        
        Logger.info(`Loading site configs for languages: ${languages.join(', ')}`);
        
        const promises = languages.map(async (lang) => {
            try {
                const configs = await CmsService.loadConfigs(lang);
                if (configs) {
                    Logger.info(`  ✓ Configs loaded for '${lang}'`);
                } else {
                    Logger.warn(`  ⚠ No configs found for '${lang}'`);
                }
            } catch (error) {
                Logger.error(`  ✗ Failed to load configs for '${lang}'`, { error: error.message });
            }
        });
        
        await Promise.all(promises);
    }
    
    /**
     * Preload translation files
     * OPTIMIZATION: Now uses async file I/O
     */
    static async preloadTranslations() {
        // Use the new async preload method
        await ViewHelpers.preloadAllTranslations();
    }
    
    /**
     * Get list of supported languages
     * @returns {string[]}
     */
    static getSupportedLanguages() {
        // Get from environment or use defaults
        const langString = process.env.SUPPORTED_LANGUAGES || 'en,hi';
        return langString.split(',').map(lang => lang.trim());
    }
}

module.exports = StartupPreloader;
