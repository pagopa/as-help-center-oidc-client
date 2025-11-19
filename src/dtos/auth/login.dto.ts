import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from '@config/zodExtend';
import config from '@config/env';

const allowedBrandIds = [
  config.cac.homeBrandId,
  config.cac.ioBrandId,
  config.cac.sendBrandId,
  config.cac.pagopaBrandId,
];

export const loginReqOriginalParamsSchema = z
  .object({
    return_to: stringCheckedSchema({}).describe(
      'URL to redirect the user after login, including contact_email as query param',
    ),
    brand_id: stringCheckedSchema({})
      .refine((bid) => allowedBrandIds.includes(bid), {
        message: `brand_id must be one of: ${allowedBrandIds.join(', ')}`,
      })
      .describe('Brand identifier to determine which product the user is trying to access'),
  })
  .openapi('LoginReqParam');

export const loginReqParamSchema = loginReqOriginalParamsSchema
  .transform((data) => {
    const returnToUrl = new URL(data.return_to);
    const emailContact = returnToUrl.searchParams.get('contact_email');
    returnToUrl.searchParams.delete('contact_email');

    return {
      return_to: returnToUrl.toString(),
      contact_email: emailContact as string,
      brand_id: data.brand_id,
    };
  })
  .refine((data) => !!data.contact_email, {
    message: "'contact_email' is required in the 'return_to' URL",
    path: ['return_to'],
  })
  .refine((data) => /\S+@\S+\.\S+/.test(data.contact_email), {
    message: "'contact_email' must be a valid email address",
    path: ['contact_email'],
  })
  .openapi('LoginReqParamWithContactEmail');

export type LoginReqParam = z.infer<typeof loginReqParamSchema>;

export const loginOpenApiRedirectResponse = {
  description: 'Redirect to return_to URL',
  headers: z.object({
    Location: z.string().openapi({
      description: 'URL to redirect the user after logout',
      example: 'https://return-url.com',
    }),
  }),
};
