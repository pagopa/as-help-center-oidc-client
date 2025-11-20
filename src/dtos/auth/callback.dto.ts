import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from '@config/zodExtend';

export const callbackReqParamSchema = z
  .object({
    state: stringCheckedSchema({}).describe('Value checked by the client to prevent CSRF attacks'),
    code: stringCheckedSchema({}).describe('Authorization code returned by the OIDC provider'),
    error: stringCheckedSchema({}).optional().describe('Error code returned by the OIDC provider'),
    error_description: stringCheckedSchema({}).optional().describe('Error description returned by the OIDC provider'),
  })
  .openapi('CallbackReqParam');

export type CallbackReqParam = z.infer<typeof callbackReqParamSchema>;

export const callbackOpenApiHtmlResponse = {
  description: 'Returns HTML form that auto-submits JWT to zendesk in order to log the user in',
  content: 'text/html',
  schema: z.string().openapi({
    description: 'HTML page with auto-submit form containing JWT token',
    example:
      '<html><body><form method="POST" action="https://action-url.com"><input name="jwt" value="..."/></form><script>document.forms[0].submit()</script></body></html>',
  }),
};
