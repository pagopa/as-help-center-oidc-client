import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from 'zod';
import config from '@config/env';

const allowedBrandIds = [
  config.cac.homeBrandId,
  config.cac.ioBrandId,
  config.cac.sendBrandId,
  config.cac.pagopaBrandId,
];

export const loginReqParamSchema = z
  .object({
    return_to: stringCheckedSchema({}),
    brand_id: stringCheckedSchema({}).refine((bid) => allowedBrandIds.includes(bid), {
      message: `brand_id must be one of: ${allowedBrandIds.join(', ')}`,
    }),
  })
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
  });

export type LoginReqParam = z.infer<typeof loginReqParamSchema>;
