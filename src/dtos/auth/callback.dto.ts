import { stringCheckedSchema } from '@dtos/common.dto';
import { z } from 'zod';

export const callbackReqParamSchema = z.object({
  state: stringCheckedSchema({}),
  code: stringCheckedSchema({}),
  error: stringCheckedSchema({}).optional(),
  error_description: stringCheckedSchema({}).optional(),
});

export type CallbackReqParam = z.infer<typeof callbackReqParamSchema>;
