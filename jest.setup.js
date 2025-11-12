import '@testing-library/jest-dom';

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock Next.js Request/Response for API route tests
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this._input = input;
      this._init = init;
    }
    async json() {
      return this._init && this._init.body ? JSON.parse(this._init.body) : {};
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this._body = body;
      this._init = init;
    }
    static json(data, init) {
      return { data, status: (init && init.status) || 200, headers: init && init.headers };
    }
  };
}

// Mock next/headers cookies for NextRequest
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn(() => undefined),
    set: jest.fn(),
  })),
}));

