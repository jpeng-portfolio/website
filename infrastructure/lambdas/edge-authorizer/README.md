# edge-authorizer — Lambda@Edge owner gate for `/resume/files/*`

A CloudFront **viewer-request** Lambda@Edge function that protects the gated
résumé files behind Amazon Cognito, using [`cognito-at-edge`](https://github.com/awslabs/cognito-at-edge).

- **Authenticated** request (valid Cognito session cookie) → returned unchanged;
  CloudFront proceeds to the private S3 origin.
- **Missing / expired** session → redirected to the Cognito Hosted UI; after
  sign-in, Cognito calls back the single `parseAuthPath` callback, the edge fn
  exchanges the code, sets session cookies, and redirects to the original file.

## Constraints (Lambda@Edge)

- **No runtime environment variables.** Config is baked into the deployed bundle
  as a sibling `config.json` that the Pulumi program generates at deploy time
  from the Cognito user-pool outputs (`infrastructure/src/auth.ts`).
- **us-east-1 only**, and the **viewer-request** code is capped at **1 MB**
  (compressed). The esbuild bundle is ~95 KB gzipped.
- Config is validated **fail-loud** at cold start (`assertConfig`) — a
  misconfigured authorizer never silently allows access.

## Layout

- `src/handler.ts` — pure, testable core (config validation + allow/redirect
  delegation). Unit-tested in `src/handler.test.ts`.
- `src/index.ts` — Lambda entry: loads `config.json`, builds the `Authenticator`.
- `build.mjs` — esbuild bundle → `dist/index.js` (CommonJS, node20).

## Commands

```bash
npm install
npm test         # vitest unit tests (allow / redirect / fail-loud)
npm run build    # bundle dist/index.js (Pulumi zips this + a generated config.json)
```

Both `dist/` and `node_modules/` are gitignored; CI builds the bundle before
`pulumi preview` / `pulumi up`, just like the Rust contact Lambda.
