import { loginFormAutoSubmit } from '@utils/zendeskRedirect';

describe('zendeskRedirect', () => {
  describe('loginFormAutoSubmit', () => {
    const loginActionEndpoint = 'https://example.zendesk.com/access/jwt';
    const jwtAccessToken = 'token.test';
    const returnToUrl = 'https://example.zendesk.com/hc/it';

    it('should return HTML string with HTML structure', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(typeof result).toBe('string');
      expect(result).toContain('<html>');
      expect(result).toContain('</html>');
      expect(result).toContain('<head>');
      expect(result).toContain('</head>');
      expect(result).toContain('<body>');
      expect(result).toContain('</body>');
      expect(result).toContain('<form');
      expect(result).toContain('</form>');
    });

    it('should include spinner styles in head and spinner div in body', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain('<style>');
      expect(result).toContain('.spinner');
      expect(result).toContain('animation: spin 1s linear infinite');
      expect(result).toContain('@keyframes spin');

      expect(result).toContain('<div class="spinner"></div>');
    });

    it('should include form with correct action endpoint', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain(`<form id="jwtForm" method="POST" action="${loginActionEndpoint}">`);
    });

    it('should include hidden input for JWT token', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain(`<input id="jwtString" type="hidden" name="jwt" value="${jwtAccessToken}" />`);
    });

    it('should include hidden input for return_to URL', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain(`<input id="returnTo" type="hidden" name="return_to" value="${returnToUrl}" />`);
    });

    it('should include auto-submit script', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain('<script>window.onload = () => { document.forms["jwtForm"].submit() }</script>');
    });

    it('should have correct input names', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain('name="jwt"');
      expect(result).toContain('name="return_to"');
    });

    it('should throw error when loginActionEndpoint is empty', () => {
      expect(() => loginFormAutoSubmit('', jwtAccessToken, returnToUrl)).toThrow(
        'Invalid parameters provided to loginFormAutoSubmit',
      );
    });

    it('should throw error when jwtAccessToken is empty', () => {
      expect(() => loginFormAutoSubmit(loginActionEndpoint, '', returnToUrl)).toThrow(
        'Invalid parameters provided to loginFormAutoSubmit',
      );
    });

    it('should throw error when returnToUrl is empty', () => {
      expect(() => loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, '')).toThrow(
        'Invalid parameters provided to loginFormAutoSubmit',
      );
    });
  });
});
