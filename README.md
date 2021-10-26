# Mobify Platform

Mobify Platform is a _monorepo_ that includes the Javascript packages that make
up the front-end of the Mobify platform. These include:

- `commerce-integrations` - A customizable API abstraction layer for ecommerce backends
- `connector` - The scaffold for a project's data layer
- `documentation-hub` - Mobify's documentation hub hosting on docs.mobify.com
- `documentation-theme` - A common theme shared across Mobify's platform documentation
- `generator` - Mobify's project generator
- `progressive-web-sdk` - A set of components and utilities which make up the SDK for Progressive Web
- `pwa` - The scaffold for PWA projects
- `test-framework` - Mobify's testing best practices

## Requirements
```
  node@v10.17.0
  npm@v5.7.1
```


## Setup

Behind the scenes we're using [Lerna][lerna] to manage the monorepo. This lets
us install all dependencies and NPM-link all packages together in one command:

```bash
npm ci
```

Be aware that dependencies that are added to the `package.json` at the root of the
repo are shared between packages. This is useful if you want to standardize on
version `X` of a testing library, for example. Dependencies listed in a package-level
`package.json` work as normal.


### Cleaning/Rebuilding

When you pull changes that include modifications to any projects dependencies,
you can run `npm ci` at the root to quickly clean and re-install all packages,
ensuring that you're developing using the same package versions as everyone else
on the team. Do this frequently!

If you're interested, read up on the [lerna docs site][lerna].


## Linting

```bash
  npm run lint
```


## Testing

Run tests for all packages with:

```bash
  cd [repo root]
  npm test
```

Run integration tests against live APIs for all packages with:

```bash
  cd [repo root]
  npm run test:integration
```


## Releasing

We use CircleCI to publish docs and NPM packages automatically from the `master` branch or any branch that starts with the word `release-`.

All _public_ packages in this repo are released at once, with identical version
numbers in a single release step.

There are three main types of releases.

1. **Preview** Releases: Shipped as work is completed, not tested by QA, not ready for
partners or external use without Platform Success or Product involvement.
2. **Stable** Releases: Released on the last Thursday of Sprint 3 and 6 of every quarter,
extensively tested, and ready for external. They can be either major or minor stable releases.
3. **Hotfix** / **Patch** Releases: Released when fixing critical bugs in a stable release, tested by QA, and ready for external use.

### Release Process:
1. Before starting any release, notify the [#product-pwa](https://mobify.slack.com/messages/#product-pwa)
channel of your intentions to create a new release and get at least a +1 from the engineering team.
2. Ctrl+f for 'deprecate' and 'experimental' to search for any deprecated functions that need to be removed
and any experimental functions that should not have the experimental warning anymore. Update accordingly.
3. Cut a release branch eg: `release-x.y.z`
    * For **Preview** and **Stable** Releases -> branch off `develop`.
    * For **Hotfix** Releases -> branch off `master`.
4. Check the SDK versions
    * For **Preview** Releases, the `develop` branch should already have the version number that's referring to the preview release version.
    * For **Stable** Releases
        - Run the following to update the version `npm run bump-version -- [major / minor]`
        - Manually update the CHANGELOG.md files for each of the packages. Squash all the previous prerelease version numbers.
        - Update the `docs/public/versions.json` and `docs/public/release-dates.json` and append the new version number.
    * For **Hotfix** Releases run the following `npm run bump-version -- patch`
5. Deploy the release Branch by pushing the release branch to github. CircleCI will then be running its integration tests and publishing the packages and docs when it passes. Any issues that come up, fix it on the release branch.
    * Check progress on CircleCI to make sure publishing finishes.
    * Merge the release branch to master
6. Make sure to update the channels to let everyone know this succeeded!
7. Update `develop`
    * For **Preview** and **Stable** Releases: branch off `master` and run `npm run bump-version -- [preminor / prerelease]`
    * For **Hotfix** Releases - there is no need to bump the version, but you should still make a new branch off `master` -> `sync-develop-x.y.z` to manage conflicts easier when merging with develop.
    * Create a PR to merge into `develop`.

[lerna]: https://github.com/lerna/lerna
