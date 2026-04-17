const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HashtagCMS Frontend API',
            version: '1.0.0',
            description: 'Advanced-grade Node.js Frontend API for HashtagCMS',
            contact: {
                name: 'HashtagCMS Support',
                url: 'https://hashtagcms.org'
            }
        },
        servers: [
            {
                url: 'http://localhost:8004',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Secret'
                }
            }
        },
        security: [{ ApiKeyAuth: [] }]
    },
    apis: [
        path.join(__dirname, '../routes/api/v1/*.js'),
        path.join(__dirname, '../routes/*.js') 
    ]
};

const specs = swaggerJsdoc(options);
module.exports = specs;
