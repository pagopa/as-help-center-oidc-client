import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from 'zod';

export const logoutReqParamSchema = z.object({
  return_to: stringCheckedSchema({}).optional(),
  brand_id: stringCheckedSchema({}),
  email: z.email().optional(),
  kind: stringCheckedSchema({}),
  message: stringCheckedSchema({}).optional(),
});

export type LogoutReqParam = z.infer<typeof logoutReqParamSchema>;
