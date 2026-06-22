// Bundles the Lambda@Edge authorizer into a single CommonJS file so the deployed
// zip stays small (Lambda@Edge viewer-request code is capped at 1 MB). The
// Pulumi program zips dist/index.js together with a generated config.json.
import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "cjs",
  // Lambda@Edge runs the Node.js 20 runtime in us-east-1.
  target: "node20",
  minify: true,
  legalComments: "none",
  // config.json is read at runtime from the bundle root, not bundled in.
  external: ["./config.json"],
});

console.log("edge-authorizer: bundled dist/index.js");
