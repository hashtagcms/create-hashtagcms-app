const Joi = require('joi');

/**
 * Validation Schemas for Cache API
 * 
 * Validates and sanitizes input data
 * Provides clear error messages
 */

/**
 * Clear Cache Schema
 * Validates request to clear specific page cache
 */
const clearCacheSchema = Joi.object({
    site: Joi.string()
        .required()
        .max(50)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .messages({
            'string.base': 'Site must be a string',
            'string.empty': 'Site is required',
            'string.max': 'Site must not exceed 50 characters',
            'string.pattern.base': 'Site must contain only alphanumeric characters, hyphens, and underscores',
            'any.required': 'Site is required'
        }),
    
    lang: Joi.string()
        .required()
        .length(2)
        .pattern(/^[a-z]{2}$/)
        .messages({
            'string.base': 'Language must be a string',
            'string.empty': 'Language is required',
            'string.length': 'Language must be exactly 2 characters',
            'string.pattern.base': 'Language must be lowercase letters only (e.g., en, hi)',
            'any.required': 'Language is required'
        }),
    
    platform: Joi.string()
        .required()
        .max(20)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .messages({
            'string.base': 'Platform must be a string',
            'string.empty': 'Platform is required',
            'string.max': 'Platform must not exceed 20 characters',
            'string.pattern.base': 'Platform must contain only alphanumeric characters, hyphens, and underscores',
            'any.required': 'Platform is required'
        }),
    
    category: Joi.string()
        .required()
        .max(200)
        .pattern(/^[a-zA-Z0-9/_-]+$/)
        .messages({
            'string.base': 'Category must be a string',
            'string.empty': 'Category is required',
            'string.max': 'Category must not exceed 200 characters',
            'string.pattern.base': 'Category must contain only alphanumeric characters, slashes, hyphens, and underscores',
            'any.required': 'Category is required'
        })
});

/**
 * Clear All Cache Schema
 * Validates request to clear all cache for a site
 */
const clearAllCacheSchema = Joi.object({
    site: Joi.string()
        .required()
        .max(50)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .messages({
            'string.base': 'Site must be a string',
            'string.empty': 'Site is required',
            'string.max': 'Site must not exceed 50 characters',
            'string.pattern.base': 'Site must contain only alphanumeric characters, hyphens, and underscores',
            'any.required': 'Site is required'
        })
});

/**
 * Warm Cache Schema
 * Validates request to warm up cache
 */
const warmCacheSchema = clearCacheSchema; // Same as clear cache

module.exports = {
    clearCacheSchema,
    clearAllCacheSchema,
    warmCacheSchema
};
