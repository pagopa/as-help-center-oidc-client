import { z } from '@config/zodExtend';

export const errorResponseSchema = z
  .object({
    message: z.string(),
    path: z.string().optional(),
    details: z.array(z.object({ message: z.string() })).optional(),
    errorCode: z.string().optional(),
    timestamp: z.string(),
  })
  .openapi('ErrorResponse');

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
