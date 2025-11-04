import { generateAuthJwt } from '@services/jwtAuth.service';
import config from '@config/env';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-v4'),
}));

describe('jwtAuth.service', () => {
  describe('generateAuthJwt', () => {
    const mockJwtSign = jwt.sign as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockJwtSign.mockReturnValue('mocked.jwt.token');
      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1609459200000); // 2021-01-01 00:00:00
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should generate JWT with all parameters provided', () => {
      const name = 'Mario Rossi';
      const fiscalNumber = 'RSSMRA80A01H501U';
      const org = 'Test Organization';
      const emailContact = 'mario.rossi@example.com';

      const result = generateAuthJwt(name, org, emailContact, fiscalNumber);

      expect(mockJwtSign).toHaveBeenCalledWith(
        {
          iat: 1609459200,
          jti: 'mocked-uuid-v4',
          name: name,
          email: emailContact,
          organization: org,
          user_fields: { aux_data: fiscalNumber },
        },
        config.authJwt.secret,
        {
          algorithm: 'HS256',
        },
      );
      expect(result).toBe('mocked.jwt.token');
    });

    it('should generate JWT with partial parameters', () => {
      const name = 'Mario Rossi';
      const emailContact = 'mario.rossi@example.com';
      const org = 'Test Organization';

      const result = generateAuthJwt(name, org, emailContact, undefined);

      expect(mockJwtSign).toHaveBeenCalledWith(
        {
          iat: 1609459200,
          jti: 'mocked-uuid-v4',
          name: name,
          email: emailContact,
          organization: org,
          user_fields: { aux_data: undefined },
        },
        config.authJwt.secret,
        {
          algorithm: 'HS256',
        },
      );
      expect(result).toBe('mocked.jwt.token');
    });

    it('should use configured secret', () => {
      const name = 'Mario Rossi';
      const fiscalNumber = 'RSSMRA80A01H501U';
      const org = 'Test Organization';
      const emailContact = 'mario.rossi@example.com';

      generateAuthJwt(name, org, emailContact, fiscalNumber);

      expect(mockJwtSign).toHaveBeenCalledWith(expect.any(Object), config.authJwt.secret, expect.any(Object));
    });
  });
});
