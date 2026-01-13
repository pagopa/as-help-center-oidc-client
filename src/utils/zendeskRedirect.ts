import { isEmpty } from 'lodash';

const spinnerStyles = `
  .spinner {
    margin: 100px auto;
    width: 40px;
    height: 40px;
    border: 4px solid #ccc;
    border-top-color: #0309fb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: sans-serif;
  }

  p {
    margin-top: 20px;
  }`;

// Escape HTML special characters to prevent XSS attacks
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
export const loginFormAutoSubmit = (
  loginActionEndpoint: string,
  jwtAccessToken: string,
  returnToUrl: string,
  nonce?: string,
) => {
  if (isEmpty(loginActionEndpoint) || isEmpty(jwtAccessToken) || isEmpty(returnToUrl)) {
    throw new Error('Invalid parameters provided to loginFormAutoSubmit');
  }

  // Escape all user-controlled values to prevent XSS
  const safeEndpoint = escapeHtml(loginActionEndpoint);
  const safeJwt = escapeHtml(jwtAccessToken);
  const safeReturnTo = escapeHtml(returnToUrl);
  const nonceAttr = nonce ? escapeHtml(nonce) : '';

  return `
    <html>
      <head>
        <style nonce="${nonceAttr}">
          ${spinnerStyles}
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <form id="jwtForm" method="POST" action="${safeEndpoint}">
          <input id="jwtString" type="hidden" name="jwt" value="${safeJwt}" />
          <input id="returnTo" type="hidden" name="return_to" value="${safeReturnTo}" />
        </form>
        <script nonce="${nonceAttr}">window.onload = () => { document.forms["jwtForm"].submit() }</script>
      </body>
    </html>
  `;
};
