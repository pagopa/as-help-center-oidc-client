let mockSend: any;

jest.doMock('@aws-sdk/client-ssm', () => {
  return {
    SSMClient: jest.fn().mockImplementation(() => ({
      send: (...args: any[]) => mockSend(...args),
    })),
    GetParametersByPathCommand: jest.fn((input) => input),
  };
});

const importModule = async () => {
  return await import('@utils/parameterStore');
};

describe('parameterStore.loadParametersIntoEnv', () => {
  const PARAM_PATH = '/hc-oidc-client';

  beforeEach(() => {
    jest.resetModules();
    mockSend = jest.fn();
    // clear env variables
    delete process.env.PARAMETER_STORE_PATH;
    delete process.env.A;
    delete process.env.B;
  });

  it('throws if PARAMETER_STORE_PATH is not set', async () => {
    const mod = await importModule();
    await expect(mod.loadParametersIntoEnv()).rejects.toThrow('PARAMETER_STORE_PATH is required');
  });

  it('loads paginated parameters and populates process.env, and is idempotent on subsequent calls', async () => {
    // two pages
    mockSend
      .mockResolvedValueOnce({
        Parameters: [{ Name: `${PARAM_PATH}/A`, Value: 'v1' }],
        NextToken: 'token1',
      })
      .mockResolvedValueOnce({
        Parameters: [{ Name: `${PARAM_PATH}/B`, Value: 'v2' }],
        NextToken: undefined,
      });

    process.env.PARAMETER_STORE_PATH = PARAM_PATH;

    const mod = await importModule();

    await mod.loadParametersIntoEnv();
    expect(process.env.A).toBe('v1');
    expect(process.env.B).toBe('v2');
    expect(mockSend).toHaveBeenCalledTimes(2);

    // call again: should be a no-op (loaded flag prevents further SSM calls)
    await mod.loadParametersIntoEnv();
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('throws when no parameters found under the path', async () => {
    mockSend.mockResolvedValueOnce({ Parameters: [], NextToken: undefined } as any);

    process.env.PARAMETER_STORE_PATH = PARAM_PATH;
    const mod = await importModule();

    await expect(mod.loadParametersIntoEnv()).rejects.toThrow('No parameters found');
  });
});
