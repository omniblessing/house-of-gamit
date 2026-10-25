# House of Gamit

A cinematic, medieval-inspired family tree with shared online storage. The website code is kept in this private GitHub repository. Family data and portrait images are saved separately in the deployed site's database and file storage, not in GitHub commits.

## Website

https://gamit-house-chronicle.richcurry512.chatgpt.site

The site remains private to its owner. Access for family members must be granted through the site's sharing settings; it is not public. The owner can edit; other admitted signed-in visitors can view. Do not change the site to public without adding explicit membership authorization for reads and portrait access.

## How to use

1. Sign in with the ChatGPT account that owns the site.
2. Choose **Start your family**, then add the first person. The initial people shown are fictional examples.
3. Add relatives and portraits. Wait for **Saved online** before closing the page.
4. Open the same URL on another device with the same account to load the saved tree.
5. If a tree was previously saved locally at this URL, use **Upload browser tree** when prompted. Unsaved drafts can also be restored explicitly.
6. Export a JSON archive periodically. Export embeds portraits so the archive can be imported elsewhere.

## Included

- Add/edit/delete people; two parents and one spouse/partner per profile.
- Sons, daughters, and in-laws connected through parent and marriage relationships.
- Living/deceased status, birth/death dates, occupation, place, portrait, and biography.
- Tree pan/zoom, search, living/deceased filters, directory, birth chronology, house name, motto.
- Persistent Cloudflare D1 records and R2 portrait objects through Sites bindings.
- Owner authorization, origin checks, validation, and optimistic revision checks against stale writes.
- Save failure banner with retry/export/reload and local recovery drafts.
- Other open devices check for updates every 30 seconds when not editing.

## Source and local development

This is now a full-stack Vinext/Cloudflare Worker app; a static host or opening an HTML file is not sufficient for shared storage.

- `web/index.html`: frontend source.
- `scripts/sync-web.mjs`: generates the embedded `web/document.ts` served by `app/route.ts`.
- `app/api/family/route.ts`: authenticated archive read/write API.
- `app/api/portraits/[key]/route.ts`: authenticated photo delivery.
- `db/schema.ts`, `drizzle/`: database schema and migrations.
- `.openai/hosting.json`: existing site identity and logical storage bindings.

Use Node >=22.13 and pnpm. Install with `pnpm install --frozen-lockfile`, build with `pnpm build`, run tests with `pnpm test`, and check types with `pnpm typecheck`. Create an ignored `.dev.vars` with `FAMILY_OWNER_EMAIL` for the owner email during local development. Production has this configured as a runtime secret; no secret values are committed.

For local D1, build and apply each pending SQL migration:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_optimal_senator_kelly.sql
```

Then run `pnpm dev`. Managed previews intentionally do not simulate sign-in. Portable loopback previews support the starter's mock ChatGPT sign-in. Production authentication is provided by Sites dispatch; identity headers must only be trusted behind that boundary.

Production publication uses the Sites skill and its build/package/deploy workflow. GitHub commits do not automatically deploy to the existing site. GitHub Pages cannot run this backend.

## Limits

Maximum 1,000 people and 12 MB per save request. Portraits are resized in the browser; original full-resolution files are not retained. One current partner is supported, without marriage history or adoption labels. Failed/stale saves never silently overwrite another device. Unreferenced portrait objects are retained; there is no automatic photo garbage collection or revision-history UI. JSON export provides a user-controlled backup.
