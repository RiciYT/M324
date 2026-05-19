process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@127.0.0.1:5432/m324_test";
process.env.BETTER_AUTH_SECRET ??= "test-secret-with-at-least-32-characters";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.CORS_ORIGIN ??= "http://localhost:3001";
process.env.NODE_ENV ??= "test";
