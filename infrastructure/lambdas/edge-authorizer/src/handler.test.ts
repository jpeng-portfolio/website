import { describe, it, expect, vi } from "vitest";
import type { CloudFrontRequestEvent } from "aws-lambda";
import {
  assertConfig,
  createHandler,
  type SessionAuthenticator,
} from "./handler";

const VALID = {
  region: "us-east-1",
  userPoolId: "us-east-1_abc123",
  userPoolAppId: "client-abc",
  userPoolDomain: "jp-resume.auth.us-east-1.amazoncognito.com",
  parseAuthPath: "resume/files/_callback",
};

function viewerRequest(uri = "/resume/files/jason-paquette-resume.pdf"): CloudFrontRequestEvent {
  return {
    Records: [
      {
        cf: {
          config: {
            distributionDomainName: "d111.cloudfront.net",
            distributionId: "E123",
            eventType: "viewer-request",
            requestId: "req-1",
          },
          request: {
            clientIp: "203.0.113.1",
            headers: {},
            method: "GET",
            querystring: "",
            uri,
          },
        },
      },
    ],
  } as unknown as CloudFrontRequestEvent;
}

describe("assertConfig (fail-loud)", () => {
  it("returns a typed config for valid input", () => {
    expect(assertConfig(VALID)).toEqual(VALID);
  });

  it("throws when not an object", () => {
    expect(() => assertConfig(null)).toThrow(/must be a JSON object/);
    expect(() => assertConfig("nope")).toThrow(/must be a JSON object/);
  });

  it.each(["region", "userPoolId", "userPoolAppId", "userPoolDomain", "parseAuthPath"])(
    "throws when %s is missing",
    (field) => {
      const partial = { ...VALID, [field]: "" };
      expect(() => assertConfig(partial)).toThrow(new RegExp(`"${field}" is required`));
    },
  );
});

describe("createHandler", () => {
  it("allows an authenticated request (authenticator returns the request unchanged)", async () => {
    const event = viewerRequest();
    const originalRequest = event.Records[0].cf.request;
    const authenticator: SessionAuthenticator = {
      // A valid session: cognito-at-edge returns the request so CloudFront
      // proceeds to the S3 origin.
      handle: vi.fn().mockResolvedValue(originalRequest),
    };

    const result = await createHandler(authenticator)(event);
    expect(result).toBe(originalRequest);
    expect(authenticator.handle).toHaveBeenCalledWith(event);
  });

  it("redirects a missing/expired session (authenticator returns a 302 to Hosted UI)", async () => {
    const redirect = {
      status: "302",
      statusDescription: "Found",
      headers: {
        location: [
          {
            key: "Location",
            value: "https://jp-resume.auth.us-east-1.amazoncognito.com/login?...",
          },
        ],
      },
    };
    const authenticator: SessionAuthenticator = {
      handle: vi.fn().mockResolvedValue(redirect),
    };

    const result = await createHandler(authenticator)(viewerRequest());
    expect(result).toBe(redirect);
    expect((result as typeof redirect).status).toBe("302");
  });
});
