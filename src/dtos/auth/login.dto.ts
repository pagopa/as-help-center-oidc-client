import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from 'zod';

export const loginReqParamSchema = z
  .object({
    return_to: stringCheckedSchema({}),
    brand_id: stringCheckedSchema({}),
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
