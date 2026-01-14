const { createCircuitBreaker } = require('../../src/utils/circuitBreaker');

describe('Circuit Breaker Integration', () => {
    
    test('should pass through successful calls', async () => {
        const successFn = jest.fn().mockResolvedValue('success');
        const breaker = createCircuitBreaker(successFn, { name: 'test-success' });
        
        const result = await breaker.fire();
        
        expect(result).toBe('success');
        expect(successFn).toHaveBeenCalled();
        expect(breaker.opened).toBe(false);
    });

    test('should open circuit after failures', async () => {
        const failureFn = jest.fn().mockRejectedValue(new Error('failed'));
        const breaker = createCircuitBreaker(failureFn, {
            name: 'test-failure',
            volumeThreshold: 2,
            errorThresholdPercentage: 50
        });
        
        // 1st failure
        await expect(breaker.fire()).rejects.toThrow('failed');
        
        // 2nd failure
        await expect(breaker.fire()).rejects.toThrow('failed');
        
        // Should be open now
        expect(breaker.opened).toBe(true);
        
        // 3rd call should reject immediately without calling function
        failureFn.mockClear();
        await expect(breaker.fire()).rejects.toThrow();
        expect(failureFn).not.toHaveBeenCalled();
    });

    test('should use fallback when open', async () => {
        const failureFn = jest.fn().mockRejectedValue(new Error('failed'));
        const fallbackFn = jest.fn().mockReturnValue('fallback data');
        
        const breaker = createCircuitBreaker(failureFn, {
            name: 'test-fallback',
            volumeThreshold: 1,
            errorThresholdPercentage: 1
        }, fallbackFn);
        
        // Fail to open circuit
        await breaker.fire(); // Using fallback for failure too
        
        // Now open
        expect(breaker.opened).toBe(true);
        
        // Should use fallback
        const result = await breaker.fire();
        expect(result).toBe('fallback data');
    });
});
