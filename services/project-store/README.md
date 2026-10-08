# micro:bit saved snapshots

The existing Share dialog saves an immutable snapshot containing project files
(blocks, TypeScript/Python and assets). Reopening a link imports an editable local
copy. Edits require sharing again to create a new link. No account is required.
Anyone with a link can read its code: this is not private cloud autosave, account
sync, or an editable permalink. Local browser autosave is unchanged.

## Current sandbox deployment

- Editor: https://legacy.circuitsketcher.com/microbit-sandbox/
- API: `/microbit-sandbox/api/share/`
- API host: existing circuitsketcher EC2; loopback port 8087, separate systemd user.
- Database: `microbit_projects` on **chibitronics-prod** in **us-east-1**.
- Table: `snapshots`; separate from WordPress `chibitronics_com`.
- Secret: `microbit-project-store-db` in AWS Secrets Manager (profile chibitronics).
- DB account: `microbit_share` at host `172.31.23.208`, TLS required, SELECT/INSERT
  on `microbit_projects.snapshots` only.
- Runtime config: `/etc/microbit-project-store/config.json`, root-owned, group-readable
  only by `microbit-store`. Never put credentials in the editor, S3, or Git.
- Verified RDS TLS uses the AWS regional CA bundle at `caPath`.

Backend source is deployed to `/usr/local/apps/microbit-project-store/`.
`microbit-project-store.service` records the systemd unit. The nginx example
records rate limiting and the isolated sandbox proxy location. Preserve all
other server blocks and existing redirects when editing nginx.

## API

- `POST /scripts`: MakeCode publication payload, text object or serialized text.
- `GET /:id`: metadata, including `id`, `shortid`, `name`, `target`, `editor`, `meta`.
- `GET /:id/text`: file-name-to-content JSON map.
- `GET /health`: database connectivity check.

IDs are `_c` plus 11 base64url characters (64 bits of cryptographic randomness),
compatible with MakeCode's share-ID syntax. No listing, updates or deletions are
exposed. Payloads are bounded, validated and stored using parameterized SQL.
Account/header metadata and thumbnail payloads are not persisted. The API has
no CORS wildcard; nginx limits save requests by IP (5/minute plus burst 15).
A classroom sharing through one IP may need a higher limit after testing.

## Testing/building

```sh
(cd editor && node ../node_modules/typescript/bin/tsc)
(cd services/project-store && npm ci --ignore-scripts && npm test)
npx pxt staticpkg --route microbit-sandbox --output built/project-share-sandbox
node scripts/postbuild-beta-banner.js built/project-share-sandbox/microbit-sandbox/index.html
node scripts/postbuild-cache-version.js built/project-share-sandbox/microbit-sandbox/index.html
```

The generated sandbox directory is
`built/project-share-sandbox/microbit-sandbox/`, not the parent output directory.
Deploy it to `/usr/local/apps/microbit-sandbox/`; this does not deploy production S3.

## Production deployment

The live editor at https://microbit.chibitronics.com uses S3 `chibi-microbit` and
CloudFront `E1IKCN86TX9AGT`. Its `/api/share/*` behavior uses HTTPS to the existing
`legacy.circuitsketcher.com` origin, with the managed CachingDisabled and
AllViewerExceptHostHeader policies. The origin has a secret CloudFront header
checked by nginx; direct access to its `/api/share/` location is rejected.
Never commit that header value. The API forwards to the same loopback service
as the sandbox; saved IDs use the same database and can be opened on either site.

Only `/api/share/*` is forwarded: Microsoft compiler/package endpoints stay unchanged.
The production nginx write limit is 30/minute plus burst 30, keyed by the final
viewer IP that CloudFront appends to X-Forwarded-For, not the CloudFront edge IP.
The sandbox retains its separate write limit. Sandbox static responses use gzip.

Pushing to `main` builds and tests the editor/service, syncs `built/packaged`
to S3, and invalidates CloudFront. Wait for the action to succeed, then test
live save and reopen. Shared URLs include a release-version query to avoid
older browsers reopening cached pre-update HTML. The entry HTML, service workers and simulator web
manifest are published with Cache-Control no-cache/max-age=0/must-revalidate.
The RDS instance remains private; no public MySQL listener is needed.

The existing frontend GitHub Action does not deploy this backend. Deploy/restart
the backend separately before frontend promotion. Record release commits when
publishing both. EC2 disk is not the durable project store: RDS is.

## Operations

Saved snapshots are permanent unless an operator removes them. There is no
public browse/search index. For abuse removal, use an administrator (not the
runtime user), verify the exact ID and remove only that row from
`microbit_projects.snapshots`. Never log whole project payloads or DB credentials.
Monitor database growth, disk/CPU/connections on the shared production RDS, API
failures and save rate-limit responses. RDS backup policy applies to the schema.
Disabling the systemd service does not erase saved projects. Remove the isolated
nginx API location to disable access without affecting the main Sketcher app.
