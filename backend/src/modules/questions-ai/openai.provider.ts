import OpenAI from 'openai';

// Injection token for the OpenAI client used by the Questions AI module
export const OPENAI_PROVIDER = 'OPENAI';

// Provider definition that creates an OpenAI client with the API key from env
export const OpenAIProvider = {
  provide: OPENAI_PROVIDER,
  useFactory: () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY não definido no ambiente.');
    return new OpenAI({ apiKey });
  },
};
