# Feedback design prototype

Local NL/EN design artifact for `FBK-001`. Product rules and the review protocol
are in [feedback-flow.md](../../docs/feedback-flow.md); ticket/decision status is
owned by [feedback-roadmap.md](../../docs/feedback-roadmap.md).

**Paused by product decision on 2026-10-12.** Preserve this design artifact;
lessons/content and Atlas preparation take priority. No preview server needs to
stay running. On explicit resumption, follow the handoff at the top of the
feedback roadmap, rerun the tests and review compatibility with the current app.
Do not integrate or expand the prototype while this track is parked.

```sh
npm run prototype:feedback
# http://127.0.0.1:3102 and /en; /?screen=article shows entry points
npm run test:feedback-prototype
```

Requires the repository's Node 24/npm 11 toolchain and installed Playwright
Chromium. Tests launch their own loopback server on 3103; the interactive preview
uses 3102. `FEEDBACK_PROTOTYPE_PORT` overrides the preview port. Stop with Ctrl-C.
No Next build, environment credentials or new dependencies are needed.

`copy.ts` holds typed sample copy and field limits; `render.ts` renders escaped
HTML; `server.ts` handles ephemeral native POST validation. No JavaScript runs
in the page. `prototype.css` reuses the site's tokens directly. The separate
Playwright config checks desktop with JavaScript disabled and mobile Chromium.
The `.pw.ts` filename keeps these tests out of Vitest's unit-test discovery.

Use synthetic text only. POST data is processed in memory and returned on
validation failure, never persisted, logged, emailed or sent to external APIs.
No drafts are saved. Successful POSTs redirect without user input in the URL.
Outcome pages are static examples, not records of actual reports. Traces on
test failures may include synthetic test input and are ignored by Git.

The server binds only to `127.0.0.1`, permits its own host/origin, caps request
bytes and serves an allowlist of stylesheets with restrictive response headers.
It is not a production backend or a substitute for auth, durable storage,
authorization, CSRF/session design, transactional quotas, retention or the
one-reply constraint. Those remain assigned to the roadmap's implementation
tickets. Do not deploy or import this prototype into application routes.
