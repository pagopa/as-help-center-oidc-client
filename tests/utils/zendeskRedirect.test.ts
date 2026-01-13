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
      expect(result).toContain('<style nonce="">');
      expect(result).toContain('.spinner');
      expect(result).toContain('animation: spin 1s linear infinite');
      expect(result).toContain('@keyframes spin');

      expect(result).toContain('<div class="spinner"></div>');
    });

    it('should include form with correct action endpoint', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain('id="jwtForm"');
      expect(result).toContain('method="POST"');
      expect(result).toContain(`action="${loginActionEndpoint}"`);
    });

    it('should include hidden input for JWT token', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain('id="jwtString"');
      expect(result).toContain('type="hidden"');
      expect(result).toContain('name="jwt"');
      expect(result).toContain(`value="${jwtAccessToken}"`);
    });

    it('should include hidden input for return_to URL', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain('id="returnTo"');
      expect(result).toContain('name="return_to"');
      expect(result).toContain(`value="${returnToUrl}"`);
    });

    it('should include auto-submit script', () => {
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl);
      expect(result).toContain(
        `<script nonce="">window.onload = () => { document.forms["jwtForm"].submit() }</script>`,
      );
    });

    it('should include nonce attribute in script and style when provided', () => {
      const nonce = 'abc123nonce';
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl, nonce);
      expect(result).toContain(
        `<script nonce="${nonce}">window.onload = () => { document.forms["jwtForm"].submit() }</script>`,
      );
      expect(result).toContain(`<style nonce="${nonce}">`);
    });

    it('should escape nonce when it contains special characters', () => {
      const maliciousNonce = 'bad"onmouseover="alert(1)';
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, returnToUrl, maliciousNonce);
      // nonce attribute should be escaped
      expect(result).toContain('nonce="bad&quot;onmouseover=&quot;alert(1)"');
      // script tag should contain the escaped nonce attribute
      expect(result).toContain(`<script nonce="bad&quot;onmouseover=&quot;alert(1)">`);
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

    it('should escape HTML special characters in loginActionEndpoint to prevent XSS', () => {
      const maliciousEndpoint = 'https://example.com" onclick="alert(\'XSS\')';
      const result = loginFormAutoSubmit(maliciousEndpoint, jwtAccessToken, returnToUrl);
      // verify that dangerous characters are escaped
      expect(result).toContain('action="https://example.com&quot; onclick=&quot;alert(&#039;XSS&#039;)');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#039;');
    });

    it('should escape HTML special characters in jwtAccessToken to prevent XSS', () => {
      const maliciousToken = 'token"><script>alert("XSS")</script><input value="';
      const result = loginFormAutoSubmit(loginActionEndpoint, maliciousToken, returnToUrl);
      // verify that <script> is escaped as &lt;script&gt;
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
    });

    it('should escape HTML special characters in returnToUrl to prevent XSS', () => {
      const maliciousUrl = 'https://example.com?param=<script>alert("XSS")</script>';
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, maliciousUrl);
      // verify that <script> is escaped as &lt;script&gt;
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('should escape ampersand characters correctly', () => {
      const urlWithAmpersand = 'https://example.com?foo=bar&baz=qux';
      const result = loginFormAutoSubmit(loginActionEndpoint, jwtAccessToken, urlWithAmpersand);
      expect(result).toContain('&amp;');
    });

    it('should not modify a valid JWT after escaping', () => {
      // example of a base64url-encoded JWT (header.payload.signature)
      const validJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = loginFormAutoSubmit(loginActionEndpoint, validJwt, returnToUrl);

      // extract the value attribute for jwt input
      const match = result.match(/<input[^>]*name="jwt"[^>]*value="([^"]*)"/);
      expect(match).not.toBeNull();
      const extracted = match ? match[1] : '';

      // the extracted value should be identical to the original JWT (no escaping applied)
      expect(extracted).toBe(validJwt);
    });
  });
});
