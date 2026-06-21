# Manual test plan — post-cutover verification

Run after `pulumi up` completes and ACM/CloudFront/SES have propagated. Replace
`jpcloudengineering.com` with the configured `domainName`.

## 1. DNS & TLS

- [ ] `dig +short jpcloudengineering.com CNAME` resolves to the CloudFront
      domain (`d…cloudfront.net`).
- [ ] `dig +short _amazonses.jpcloudengineering.com TXT` returns the SES
      verification token.
- [ ] `dig +short <token>._domainkey.jpcloudengineering.com CNAME` resolves for
      all **3** DKIM tokens (`…dkim.amazonses.com`).
- [ ] `curl -sI https://jpcloudengineering.com` returns `HTTP/2 200` with a valid
      certificate (no TLS warning); `openssl s_client` shows `TLSv1.2`/`1.3` and
      the cert CN/SAN matches the domain.
- [ ] `curl -sI http://jpcloudengineering.com` redirects (301/302) to `https://`.

## 2. Static site (CloudFront behavior)

- [ ] Home page loads over HTTPS and renders hero, nav, and all sections
      (About, Skills, Experience, Projects, Certifications, Contact).
- [ ] **Trailing-slash / extensionless rewrite:** `https://…/` and a deep route
      both load `index.html` (CloudFront Function working).
- [ ] **Error mapping:** `https://jpcloudengineering.com/does-not-exist` returns
      the 404 page with HTTP **404** (403/404 → `/404/index.html`).
- [ ] Static assets (CSS/JS/images) load with no mixed-content or CORS errors in
      the browser console.
- [ ] Confirm the S3 origin is **not** publicly reachable: the bucket REST
      endpoint returns AccessDenied; only CloudFront (OAC) can read it.

## 3. Contact form (API Gateway → Lambda → SES)

- [ ] Submitting with empty fields shows the client-side validation toast
      (no network call).
- [ ] If Turnstile is enabled, the widget renders and a submit without solving it
      is rejected.
- [ ] A valid submission shows "Message sent." and:
  - [ ] the **notification** email arrives at `contactEmail`,
  - [ ] the **auto-reply** arrives at the address entered in the form,
  - [ ] both render the HTML templates (name/subject/message populated).
- [ ] **CORS contract** — preflight is allowed only from the site origin:
  ```bash
  curl -si -X OPTIONS "$CONTACT_API_URL" \
    -H "Origin: https://jpcloudengineering.com" \
    -H "Access-Control-Request-Method: POST" | grep -i access-control
  ```
  returns `Access-Control-Allow-Origin: https://jpcloudengineering.com`; a
  foreign `Origin:` is **not** reflected.
- [ ] **Validation contract** — a malformed body returns HTTP **400** with
      `{"error": …}`; a non-POST returns **405**.
- [ ] **Deliverability** — notification email passes SPF/DKIM (check headers:
      `dkim=pass`).

## 4. Email security headers

- [ ] Send a test and inspect the received headers: `DKIM-Signature` present and
      `dkim=pass`; `Authentication-Results` shows DKIM aligned to the domain.

## 5. Pulumi / cost hygiene

- [ ] `pulumi stack output` shows `siteBucketName`, `distributionId`,
      `distributionDomain`, `contactApiUrl`.
- [ ] A no-op `pulumi preview` is clean (no drift) after the deploy.
- [ ] (Optional) `get-policy-violations` via the Pulumi MCP reports no new
      high-severity findings for the stack.

## 6. Decommission (only after all green)

- [ ] Old Terraform state bucket `jpeng-portfolio-tfstate` + lockfile retired.
- [ ] GitLab project pipelines disabled; `mirror_to_github` no longer needed.
