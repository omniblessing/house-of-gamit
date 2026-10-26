# Shared storage on your Cloudflare account

The website stays at https://omniblessing.github.io/house-of-gamit/ and uses
https://house-of-gamit-api.thorfin662.workers.dev for shared data.

## One-time dashboard setup

1. Create D1 database `house-of-gamit-db` (already completed).
2. Create Worker `house-of-gamit-api` and bind that database with variable name `DB` (already requested).
3. Worker → Settings → Variables and Secrets → Add → Secret.
   Name it `OWNER_PASSWORD` and choose a unique random password of at least 20 characters.
   Save the password in your password manager. Do not put it in GitHub, screenshots, or chat.
4. Worker → Edit code. Replace the starter code with the complete `cloudflare/worker.js` file from this repository and Deploy.
5. Open the Worker's `/api/health` endpoint. It must show `service: house-of-gamit-v1`, `databaseBound: true`, and `ownerPasswordConfigured: true`.
6. Reload the GitHub website. The banner must say Shared family archive. Choose Owner sign-in and enter your password there.

The three D1 tables are created automatically on the first API request. Compressed
portraits are stored as separate D1 binary records; R2 and its billing setup are not required.
The service never overwrites an existing tree merely because it was deployed or opened.

## Move an existing browser tree

Download a backup from the browser holding your real family tree first. After the
shared banner appears, sign in as owner. If offered a browser recovery copy, review
the confirmation before restoring. Alternatively use More options → Import backup.
Import replaces the current shared tree only after confirmation. Keep the original
backup. Verify the saved tree in a separate browser/device before removing any local copies.

## Access and limits

Everyone with the website or API URL can read saved names, biographies, relationships,
and portraits. This is public viewing, not private family membership. Only an owner
with the configured password can obtain a 12-hour editing token. Tokens stay in the
current tab's session storage. Rotating OWNER_PASSWORD invalidates existing tokens.

CORS allows the GitHub account origin. It is not authentication; every write also
requires a valid signed editing token. Sign-in is limited to eight attempts per IP
per 15-minute fixed window. HTTPS is required. Do not expose passwords in source.

Archives support at most 2,000 people, 12 MB per upload, 1.8 MB of profile text and
links per archive, and 1.4 MB per stored portrait. The app compresses portraits before
upload. Total database storage and request limits depend on the Cloudflare Free plan.
Older portrait versions are retained so undo and backups do not break. Monitor database
usage if you replace many photos. No provider promises free storage forever; retain
independent downloaded backups.

If the API has never been connected, the website keeps the browser-only edition and
clearly labels it. Once a browser has successfully used shared storage, an unavailable
API disables editing instead of silently creating a separate local tree.
