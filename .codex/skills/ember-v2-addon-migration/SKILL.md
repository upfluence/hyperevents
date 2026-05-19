---
name: ember-v2-addon-migration
description: Use when migrating an Upfluence classic Ember addon to the v2 addon authoring format, or when reviewing such a migration. Applies the hyperevents migration pattern: pnpm workspace, latest verified codemod, Embroider addon shim, Rollup/TypeScript declarations, macro-only configuration, release-it, and workspace-aware CI.
---

# Ember v2 addon migration

Use this skill to migrate an Upfluence Ember addon from the classic v1 addon
layout to v2 addon authoring.

## First inspect

Before editing, discover the current addon shape:

- Package name, addon location, test app location, and supported Ember version.
- Public imports, test-support imports, and resolver-visible app entries.
- Old `index.js` responsibilities.
- Runtime configuration modules and initializers.
- CI workflows, Makefile targets, release scripts, publish config, SonarQube
  workflow/config, and README release/configuration docs.
- Private Upfluence dependencies that must be preserved.

If a sibling `../hypermarket` project exists, use it as a control package for
the v2 addon pattern. Do not blindly copy versions or files from it.

## Codemod and cleanup

Run the verified codemod:

```sh
npx ember-codemod-v1-to-v2@4.1.1 \
  --addon-location packages/<addon-name> \
  --test-app-location packages/test-app \
  --test-app-name test-app
```

Then remove every dependency and import for:

- `@ijlee2-frontend-configs/ember-template-lint`
- `@ijlee2-frontend-configs/eslint-config-ember`
- `@ijlee2-frontend-configs/prettier`
- `@ijlee2-frontend-configs/stylelint`

Use local Upfluence lint/prettier conventions instead.

## Package shape

Configure the addon package as a v2 addon:

- `ember-addon.version: 2`
- `ember-addon.type: "addon"`
- `ember-addon.main: "addon-main.cjs"`
- `addon-main.cjs` uses `@embroider/addon-shim`.
- Public `exports` are explicit and match files that still exist.
- `app-js` contains only resolver-visible files that still exist.
- `types` and `typesVersions` point to generated declarations.
- Published `files` include `addon-main.cjs`, `dist`, and `declarations`.

When deleting old modules, audit package `exports`, `typesVersions`, `app-js`,
docs, and tests so removed files are not still advertised as public entrypoints.

## Rollup and TypeScript

Use the simple Rollup pattern:

- Add `@rollup/plugin-node-resolve`.
- Let Rollup resolve `.ts` sources.
- Let Babel strip TypeScript syntax.
- Use `@embroider/addon-dev` to generate declarations.
- Keep the addon build script as `rollup --config`.
- Do not run standalone `tsc` as part of addon build.
- Keep source imports extensionless; do not add `.ts` relative import specifiers.
- Use `import type` for type-only imports that create circular runtime warnings.
- Treat `dist`, `declarations`, copied README/LICENSE, and analyzer output as
  ignored generated output.
- Use `prepack`, not `prepare`, to build package output before publishing.

Add opt-in analysis when useful:

```json
{
  "build:analyze": "DEBUG=true rollup --config --perf"
}
```

## Macro-only configuration

Use build-time macro configuration only.

Addon-owned defaults belong in `addon-main.cjs`:

```js
const { addonV1Shim } = require('@embroider/addon-shim');

module.exports = {
  ...addonV1Shim(__dirname),
  options: {
    '@embroider/macros': {
      setOwnConfig: {
        buildEnv: process.env.BUILD_ENV ?? 'staging'
      }
    }
  }
};
```

Consuming apps and test apps provide app-owned values or overrides through
`@embroider/macros.setConfig` in `ember-cli-build.js`.

Runtime code reads with `getOwnConfig()`:

```ts
import { getOwnConfig } from '@embroider/macros';

const addonConfig = getOwnConfig();
```

Do not preserve or recreate a runtime `Configuration` singleton. Do not keep an
initializer whose only job is loading addon config from `config/environment`.
If an initializer has another real runtime responsibility, preserve that
responsibility only.

## Workspace, CI, and release

Update root scripts, Makefile, hooks, CI, and release flow for the workspace:

- Root commands use `pnpm --filter`.
- Hooks are opt-in only and are never installed from default targets.
- CI builds the addon, runs root lint/type lint, then runs test-app tests.
- Ember Try runs from `packages/test-app`.
- SonarQube coverage runs through `test-app`.
- `.github/workflows/sonarqube-sync.yml` and `sonar-project.properties` use
  workspace-aware source, test, coverage, and TypeScript config paths.
- Release uses root `release-it` with `@release-it-plugins/workspaces`.
- Publishing runs from `packages/<addon-name>` with `pnpm publish --no-git-checks`.

## Validate

Run the relevant checks:

```sh
pnpm install --no-frozen-lockfile
rg "@ijlee2-frontend-configs" .
pnpm --filter <addon-package-name> build
pnpm lint
pnpm lint:types
pnpm --filter test-app test:ember
pnpm --filter test-app test:coverage
pnpm --filter <addon-package-name> build:analyze
```

From the addon package:

```sh
npm pack --dry-run
```

Release dry-run:

```sh
pnpm release-it patch --dry-run --ci
```

Stale config search:

```sh
rg "Configuration|resolveRegistration\\('config:environment'\\)|initializers/<addon>" packages/<addon-name>
```

## Report back

Summarize changed files, commands run, validation results, and any remaining
risks. Call out any intentionally preserved deviations from this pattern.
