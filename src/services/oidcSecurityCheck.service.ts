import { generators } from 'openid-client';
import { AuthSessionRecord, ExtraStateData, StateAndNonce } from 'src/types/auth.types';
import { validateRequiredFields } from '@utils/utils';
import * as dynamodbService from '@services/dynamodb.service';

// create new state and nonce and store them in DynamoDB with extra data
export async function createStateAndNonce(extraStateData: ExtraStateData): Promise<StateAndNonce> {
  const state = generators.state();
  const nonce = generators.nonce();

  const stateRecord: Omit<AuthSessionRecord, 'ttl'> = {
    state: state,
    nonce,
    return_to_url: extraStateData.return_to_url,
    contact_email: extraStateData.contact_email,
    createdAt: new Date().toISOString(),
  };

  await dynamodbService.storeAuthSessionRecord(stateRecord);
  return { state, nonce };
}

// Validates state and atomically retrieves and deletes the auth session record preventing replay attacks
export async function validateStateAndGetAuthSession(state?: string): Promise<AuthSessionRecord> {
  if (!state) {
    throw new Error('State parameter is required');
  }

  const authSessionRecord = await dynamodbService.getAndDeleteAuthSessionRecord(state);
  if (!authSessionRecord) {
    throw new Error('State not found or already used');
  }

  // validate state payload required fields
  validateRequiredFields(
    authSessionRecord as unknown as Record<string, unknown>,
    ['state', 'nonce', 'return_to_url', 'contact_email'],
    'Missing required auth session record fields',
  );

  return authSessionRecord;
}

// validate nonce attribute (if present and if it is equal to initial nonce)
export function validateNonce(nonce: string, nonceFromProvider?: string) {
  if (!nonceFromProvider) {
    throw new Error('Nonce parameter is required');
  }

  if (nonceFromProvider !== nonce) {
    throw new Error('Nonce is not valid');
  }
}
