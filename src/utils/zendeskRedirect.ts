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

export const loginFormAutoSubmit = (loginActionEndpoint: string, jwtAccessToken: string, returnToUrl: string) => {
  return `
    <html>
      <head>
        <style>
          ${spinnerStyles}
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <form id="jwtForm" method="POST" action="${loginActionEndpoint}">
          <input id="jwtString" type="hidden" name="jwt" value="${jwtAccessToken}" />
          <input id="returnTo" type="hidden" name="return_to" value="${returnToUrl}" />
        </form>
        <script>window.onload = () => { document.forms["jwtForm"].submit() }</script>
      </body>
    </html>
  `;
};
