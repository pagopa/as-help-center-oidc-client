import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from '@config/zodExtend';

export const logoutReqParamSchema = z
  .object({
    return_to: stringCheckedSchema({}).optional().describe('URL to redirect the user after logout'),
    brand_id: stringCheckedSchema({}).describe(
      'Brand identifier to determine which product the user is trying to logout from',
    ),
    email: z.email().optional().describe('Email address of the user'),
    kind: stringCheckedSchema({}).describe('Kind of logout result (info = OK | error = KO)'),
    message: stringCheckedSchema({}).optional().describe('Message describing the logout result'),
  })
  .openapi('LogoutReqParam');

export type LogoutReqParam = z.infer<typeof logoutReqParamSchema>;

export const logoutOpenApiRedirectResponse = {
  description: 'Redirect to return_to URL',
  headers: z.object({
    Location: z.string().openapi({
      description: 'URL to redirect the user after logout',
      example: 'https://return-url.com',
    }),
  }),
};
