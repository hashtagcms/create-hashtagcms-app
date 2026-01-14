const Joi = require('joi');
const { validateBody, validateQuery } = require('../../src/middleware/validator');

describe('Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(18)
    });

    test('should call next() for valid body', () => {
        req.body = { name: 'John', age: 25 };
        validateBody(schema)(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid body', () => {
        req.body = { age: 10 }; // Missing name, age < 18
        validateBody(schema)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: 'Validation error'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    test('should sanitize input (convert types)', () => {
        req.query = { name: 'John', age: '30' }; // age is string
        validateQuery(schema)(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(req.query.age).toBe(30); // Should become number
    });
});
