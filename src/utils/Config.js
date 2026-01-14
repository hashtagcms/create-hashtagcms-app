const hashtagcms = require('../../config/hashtagcms');

const configs = {
    hashtagcms
};

class Config {
    /**
     * Get config value using dot notation
     * @param {string} key e.g. 'hashtagcms.context'
     * @param {*} defaultValue 
     */
    static get(key, defaultValue = null) {
        const parts = key.split('.');
        let current = configs;

        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                return defaultValue;
            }
        }
        return current;
    }
}

module.exports = Config;
