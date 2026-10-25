# GitHub Pages hosting

The standalone build and automatic deployment workflow are now in the repository:

- `scripts/build-pages.mjs`
- `.github/workflows/pages.yml`

The first Actions run passed the website build, then stopped at Configure Pages because no Pages site was enabled. This is a repository setting, not a build error.

## Enable hosting

1. Open https://github.com/omniblessing/house-of-gamit/settings/pages .
2. Under Build and deployment, choose GitHub Actions as the source.
3. Open the Actions tab, select Deploy website to GitHub Pages, and rerun the workflow.
4. Use the published URL returned by the successful deployment.

GitHub Pages availability for a private repository depends on the GitHub plan. If the settings require a paid plan or changing repository visibility, the owner must choose; the deployment workflow does not change visibility. GitHub Pages sites are generally public even when their source repository is private.

## Storage behavior

This edition saves family edits only to localStorage on the current browser. There is no shared database or login service on GitHub Pages. Other devices do not automatically receive those edits, and clearing browser storage can remove them. Download JSON backups regularly. No family data is committed to the repository by this edition. It starts with fictional examples when no device-local tree exists.

The full-stack app, database schema, and earlier shared-data deployment are retained separately. Migrating existing records requires exporting an archive and importing it into the desired edition; no production records were copied or deleted during this setup.
