# Dependency upgrade notes

Assessment date: **2026-10-15**. Public launch is pending dependency upgrades.

**No upgrades or `npm audit fix` commands were run in Phase 7/8.** Unused
`ts-node` and obsolete `@types/bcryptjs` were removed; versions of the remaining
dependencies were not upgraded.

## Scope and interpretation

`npm audit --json` reports **12 affected package entries** (1 critical, 9 high,
2 moderate), representing **30 distinct advisories**. Package severity includes
inherited findings; individual advisory severity can differ.

Versions were checked against the installed tree/lockfile. Advisory ranges and
patched releases were checked against GitHub advisory records linked below.
This is a read-only code/configuration assessment, **not an exploit test**.
An affected version is not proof that every advisory is exploitable in this app.
Conversely, an absent exploit test or an admin role guard is not proof of safety.

- **Relevant/conditional:** affected public feature/configuration exists, but
  exploitation also depends on deployment, attacker-controlled input or caches.
- **Not configured/found:** the required application feature/input path was not
  found in the reviewed app. This is scoped evidence, not a permanent exemption.
- **Unknown:** a condition cannot be established from this local repository.

Every exported admin API handler independently calls `requireAdmin()`, checking
the session and ADMIN role. Admin pages also authorize server-side. These checks
mitigate middleware-only authorization failures. They **do not mitigate** public
image optimization, RSC processing, cache poisoning, WebSocket SSRF, DoS or
Windows-hosting RCE. No unconditional production exploit path was confirmed.

## Next.js advisories

**Package for every row:** `next`, **installed:** `14.2.35`,
**classification:** production dependency. The affected range is the advisory
branch containing that installed version. "First patched" is the minimum fixed
release on that branch, not a recommended migration target or a promise that the
whole dependency tree will become clean.

| Advisory | Severity | Affected range | First patched | Applicability to this app |
| --- | --- | --- | --- | --- |
| [GHSA-9g9p-9gw9-jx7f](https://github.com/advisories/GHSA-9g9p-9gw9-jx7f): remote-image memory exhaustion | Moderate | `>=10.0.0 <15.5.10` | `15.5.10` | Relevant/conditional: default image endpoint and Unsplash remote allowlist exist; requires a suitably large allowed image and affected self-hosting. Attacker control not established. |
| [GHSA-h25m-26qc-wcjf](https://github.com/advisories/GHSA-h25m-26qc-wcjf): RSC request-deserialization DoS | High | `>=13.0.0 <15.0.8` | `15.0.8` | Conditional: App Router exists; no application Server Actions found. React 18 alone does not establish safety from framework processing. |
| [GHSA-ggv3-7p47-pfv8](https://github.com/advisories/GHSA-ggv3-7p47-pfv8): rewrite request smuggling | Moderate | `>=9.5.0 <15.5.13` | `15.5.13` | Not configured: no external backend rewrites. |
| [GHSA-3x4c-7xq6-9pq8](https://github.com/advisories/GHSA-3x4c-7xq6-9pq8): image disk-cache exhaustion | Moderate | `>=10.0.0 <15.5.14` | `15.5.14` | Relevant/conditional: optimizer enabled; self-hosted disk caches are at risk. Vercel's separate image service is excluded by the advisory. |
| [GHSA-q4gf-8mx6-v5v3](https://github.com/advisories/GHSA-q4gf-8mx6-v5v3): Server Component DoS | High | `>=13.0.0 <15.5.15` | `15.5.15` | Conditional: App Router exists; no application Server Actions found; framework handling untested. |
| [GHSA-8h8q-6873-q5fj](https://github.com/advisories/GHSA-8h8q-6873-q5fj): Server Component DoS | High | `>=13.0.0 <15.5.16` | `15.5.16` | Conditional: same App Router/Server Function considerations; no exploitation test. |
| [GHSA-3g8h-86w9-wvmq](https://github.com/advisories/GHSA-3g8h-86w9-wvmq): middleware redirect cache poisoning | Low | `>=12.2.0 <15.5.16` | `15.5.16` | Conditional: middleware redirects exist; requires intermediary caching without correct `x-nextjs-data` partitioning. Admin server guards still apply. |
| [GHSA-ffhc-5mcf-pf4q](https://github.com/advisories/GHSA-ffhc-5mcf-pf4q): nonce-related cached XSS | Moderate | `>=13.4.0 <15.5.16` | `15.5.16` | Not confirmed: our CSP has no nonce. Request-derived CSP handling and shared-cache behavior remain untested. |
| [GHSA-vfv6-92ff-j949](https://github.com/advisories/GHSA-vfv6-92ff-j949): RSC cache-buster collisions | Low | `>=13.4.6 <15.5.16` | `15.5.16` | Conditional: public RSC routes exist; vulnerable intermediary cache configuration not established. ISR alone is not proof of exploitation. |
| [GHSA-gx5p-jg67-6x7h](https://github.com/advisories/GHSA-gx5p-jg67-6x7h): beforeInteractive XSS | Moderate | `>=13.0.0 <15.5.16` | `15.5.16` | Feature not found: no `beforeInteractive` scripts with untrusted input. |
| [GHSA-h64f-5h5j-jqjh](https://github.com/advisories/GHSA-h64f-5h5j-jqjh): local-image memory exhaustion | Moderate | `>=10.0.0 <15.5.16` | `15.5.16` | Relevant/conditional: optimizer and default local patterns exist; requires suitable large assets and affected self-hosting. Vercel is excluded by the advisory. |
| [GHSA-c4j6-fc7j-m34r](https://github.com/advisories/GHSA-c4j6-fc7j-m34r): WebSocket upgrade SSRF | High | `>=13.4.13 <15.5.16` | `15.5.16` | Conditional: `npm start` uses Next's built-in server. Public, unfiltered upgrade handling can be affected even without app WebSockets. Vercel excluded; origin/filtering unknown. |
| [GHSA-wfc6-r584-vfw7](https://github.com/advisories/GHSA-wfc6-r584-vfw7): RSC response cache poisoning | Moderate | `>=14.2.0 <15.5.16` | `15.5.16` | Conditional: public RSC pages exist; shared-cache response partitioning unknown. |
| [GHSA-36qx-fr4f-26g5](https://github.com/advisories/GHSA-36qx-fr4f-26g5): Pages Router i18n middleware bypass | High | `>=12.2.0 <15.5.16` | `15.5.16` | Configuration not found: App Router, no Pages Router i18n. Admin handlers also check roles independently. |
| [GHSA-m99w-x7hq-7vfj](https://github.com/advisories/GHSA-m99w-x7hq-7vfj): Server Action CPU exhaustion | High | `>=13.0.0 <15.5.21` | `15.5.21` | Feature not found: requires a Server Action; none found in application code. |
| [GHSA-89xv-2m56-2m9x](https://github.com/advisories/GHSA-89xv-2m56-2m9x): Server Action SSRF | High | `>=14.1.1 <15.5.21` | `15.5.21` | Feature not found: no application Server Actions or custom server. |
| [GHSA-68g3-v927-f742](https://github.com/advisories/GHSA-68g3-v927-f742): body-bearing fetch cache confusion | Moderate | `>=13.0.0 <15.5.21` | `15.5.21` | Usage not found: no relevant server-side body-bearing fetch/Request override combination. Client fetch and Prisma are not that path. |
| [GHSA-4633-3j49-mh5q](https://github.com/advisories/GHSA-4633-3j49-mh5q): non-UTF-8 fetch cache confusion | Moderate | `>=13.0.0 <15.5.21` | `15.5.21` | Usage not found: no server fetch with affected non-UTF-8 request bodies. |
| [GHSA-4c39-4ccg-62r3](https://github.com/advisories/GHSA-4c39-4ccg-62r3): Edge Server Action payload exhaustion | Moderate | `>=13.0.0 <15.5.21` | `15.5.21` | Feature not found: no Edge Server Actions. The OG card is a static PNG, not an action. |
| [GHSA-p9j2-gv94-2wf4](https://github.com/advisories/GHSA-p9j2-gv94-2wf4): dynamic rewrite-host SSRF/open redirect | High | `>=12.0.0 <15.5.21` | `15.5.21` | Configuration not found: no request-interpolated external rewrite hosts. |
| [GHSA-955p-x3mx-jcvp](https://github.com/advisories/GHSA-955p-x3mx-jcvp): Server Function endpoint disclosure | Moderate | `>=13.0.0 <15.5.21` | `15.5.21` | Feature not found: no `use server`/`use cache` endpoints. Database `unstable_cache` is not an exposed Server Action. |
| [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36): Windows-hosted unauthenticated RCE | Critical | `>=13.4.0 <15.5.24` | `15.5.24` | Deployment-conditional: Windows-hosted App/Pages Router without Cache Components. Local workspace is Windows; it must not be publicly exposed. Intended Vercel hosting is not Windows, but actual deployment must be verified. Admin guards do not mitigate this. |
| [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4): AVIF optimization RCE | Critical | `>=10.0.0 <15.5.24` | `15.5.24` | Conditional/unknown: affected sharp/libheif native decoding and suitable allowed attacker image required. No sharp installed in inspected local tree; deployment may install a different decoder. |

## Other distinct advisories

Tailwind remains a package.json dependency, but its affected parsing/watch
dependencies are used at build/development time, not by a public UI request
handler. Calling a package "dev/build-only" here describes reachability, not
necessarily its package.json section. Dev/build findings can still threaten CI
when processing untrusted files.

| Package and installed version | Advisory | Severity | First patched version | Production or dev; exploitability assessment |
| --- | --- | --- | --- | --- |
| `braces@3.0.3` | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): recursive pattern exhaustion | High | None published in advisory (`<=3.0.3` affected) | Dev/build-only via Tailwind/chokidar/micromatch; no remote glob input path found. Do not describe installed 3.0.3 as fixed. |
| `glob@10.3.10` (also `7.2.3`) | [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2): CLI command injection | High | `10.5.0` (10.x); `11.1.0` (11.x) | Dev-only ESLint tooling; requires `-c/--cmd` and hostile matched filenames. That command usage was not found. Duplicate 7.2.3 is outside this advisory's ranges. |
| Next's `postcss@8.4.31` (root `8.5.30`) | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93): CSS stringify XSS | Moderate | `8.5.10` | Vulnerable copy is production-classified through Next, used for CSS processing. Requires hostile CSS stringified into HTML styles; no app input path found. Root dev copy is patched. |
| Same PostCSS copies | [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q): source-map file read | High | `8.5.12` | Production-classified nested dependency; requires untrusted CSS/source maps reaching PostCSS. No CSS upload/transform endpoint found. Root 8.5.30 patched. |
| Same PostCSS copies | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp): incomplete source-map fix | Moderate | `8.5.23` | Same conditional input path; root dev copy patched. Fixing only to 8.5.12 does not cover this advisory. |
| Same PostCSS copies | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849): source-map path traversal | High | `8.5.18` | Same conditional input path; root dev copy patched. |
| `postcss-selector-parser@6.1.4` | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf): selector CPU exhaustion | Moderate | `7.1.6` | Dev/build-only Tailwind/postcss-nested; no remote CSS parsing path found. |

## Inherited audit entries (not extra distinct advisories)

| Package / installed version | Package severity | Classification | Inherits | Fixed parent version |
| --- | --- | --- | --- | --- |
| `@next/eslint-plugin-next@14.2.35` | High | Dev-only | glob command injection | Not independently established; resolve the affected glob dependency; npm suggests matching newer Next tooling |
| `eslint-config-next@14.2.35` | High | Dev-only | Next ESLint plugin -> glob | npm suggests `16.4.1` (major migration target, not minimum underlying fix) |
| `chokidar@3.6.0` | High | Dev/build-only | braces exhaustion | No verified parent fix; underlying braces advisory has no published patch |
| `fast-glob@3.3.3` | High | Dev/build-only | micromatch -> braces | No verified parent fix; audit marks all versions |
| `micromatch@4.0.8` | High | Dev/build-only | braces | No verified parent fix; underlying advisory unresolved |
| `postcss-nested@6.2.0` | Moderate | Dev/build-only | postcss-selector-parser | Resolve parser >=7.1.6; minimum patched parent not independently established |
| `tailwindcss@3.4.19` | High | Dev/build tooling (declared dependency) | watcher/glob/parser chains | npm suggests `4.3.3` (major migration target, not a proven minimum fix for every inherited advisory) |

## Evidence and next steps

- [web/package.json](web/package.json) and [web/package-lock.json](web/package-lock.json):
  installed/direct/transitive dependency versions.
- [web/next.config.mjs](web/next.config.mjs): remote image allowlist, default
  optimizer enabled, no external rewrites or Pages Router i18n.
- [web/lib/image.ts](web/lib/image.ts): custom Unsplash component loader; it does
  **not** disable direct public requests to `/_next/image`.
- [web/lib/auth.ts](web/lib/auth.ts), [web/app/api/admin/](web/app/api/admin/):
  independent role authorization.
- [web/middleware.ts](web/middleware.ts): auth redirects; proxy/CDN caching unknown.
- Public App Router pages use RSC/ISR. No application Server Actions, untrusted
  beforeInteractive scripts, server-side body-bearing fetches or CSS upload paths
  were found. Native image decoder and deployment-origin behavior remain unknown.

Before public launch:

1. Plan a supported Next/React/tooling upgrade in its own phase and rerun the full
   auth, checkout, admin, image, caching and animation tests.
2. npm currently proposes Next/ESLint config `16.4.1` and Tailwind `4.3.3`. The
   highest first-patched pre-16 Next release across these reported advisories is
   `15.5.24`; this is not a complete-clean-audit guarantee or compatibility advice.
3. Resolve Next's nested PostCSS (all listed PostCSS advisories require at least
   `8.5.23` collectively), and reassess unresolved braces/tooling chains.
4. Verify deployment OS, native AVIF decoders, origin WebSocket handling and
   CDN/RSC cache partitioning. Do not publicly expose this Windows development server.
5. Repeat `npm audit`, document any remaining accepted conditions, and keep
   platform-managed protections distinct from an actual dependency patch.

Admin authorization is defense in depth, **not a reason to defer framework
remediation indefinitely**. No dependency is asserted categorically unexploitable.
