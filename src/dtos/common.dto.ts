import { z } from '@config/zodExtend';

export const stringCheckedSchema = ({ min, max }: { min?: number; max?: number }) => {
  const minLength = min || 1;
  const maxLength = max || 5000;
  return z
    .string()
    .trim()
    .min(minLength, { message: `Minimum length is ${minLength} characters` })
    .max(maxLength, { message: `Field can't exceed ${maxLength} characters` });
};
