import { generateCspNonce } from '@middlewares/cspNonce';

describe('generateCspNonce middleware', () => {
  it('should set res.locals.cspNonce and call next', () => {
    const mockReq: any = {};
    const mockRes: any = { locals: {} };
    const next = jest.fn();

    generateCspNonce(mockReq, mockRes, next);

    expect(mockRes.locals.cspNonce).toBeDefined();
    expect(typeof mockRes.locals.cspNonce).toBe('string');
    expect(mockRes.locals.cspNonce.length).toBeGreaterThan(0);
    // verify base64 decodes to 16 bytes
    const buffer = Buffer.from(mockRes.locals.cspNonce, 'base64');
    expect(buffer.length).toBe(16);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
