# Ember v2 addon migration playbook

This playbook documents the migration pattern used for `@upfluence/hyperevents`.
Use it to migrate other Upfluence Ember addons from the classic v1 addon layout to
the v2 addon authoring format.

The sibling `hypermarket` project is a useful control package when it is
available. Treat it as a reference for the general v2 addon shape, not as a file
copy source: keep each addon's public API, supported Ember version, runtime
behavior, and private Upfluence dependencies intact unless the migration
explicitly changes them.

## 1. Preflight

Before running any codemod, inventory the current addon.

- List public imports that consumers may use, including services, helpers,
  modifiers, decorators, initializers, and test-support modules.
- List resolver-visible app entries that must be mapped through `app-js`.
- Read the old `index.js` and identify each responsibility: build-time config,
  macro config, auto-import config, coverage setup, app tree merging, or other
  classic addon hooks.
- Identify runtime configuration modules or initializers that load values from
  `config/environment`.
- Confirm the test app package name and the Ember version it must keep.
- Review CI, release, publish, Makefile, hook, SonarQube, and documentation
  entry points.
- Note private dependencies such as `@upfluence/oss-components`. Do not remove
  them to save disk space; fix bootstrap issues by updating them when needed.

## 2. Run the codemod

Use the most recent codemod that was verified during this migration:

```sh
npx ember-codemod-v1-to-v2@4.1.1 \
  --addon-location packages/<addon-name> \
  --test-app-location packages/test-app \
  --test-app-name test-app
```

After the codemod, inspect the generated files before making broader edits.

## 3. Remove generated config packages

The codemod may add shared config packages that Upfluence addons should not keep.
Remove every dependency and import for:

- `@ijlee2-frontend-configs/ember-template-lint`
- `@ijlee2-frontend-configs/eslint-config-ember`
- `@ijlee2-frontend-configs/prettier`
- `@ijlee2-frontend-configs/stylelint`

Replace those references with local Upfluence-owned config, such as
`@upfluence/w-conf`, and explicit local ESLint/template-lint configuration.
Validate with:

```sh
rg "@ijlee2-frontend-configs" .
```

Expected result: no matches.

## 4. Shape the v2 addon package

The addon package should live under `packages/<addon-name>` and expose a v2
addon entry point.

In `packages/<addon-name>/package.json`:

- Set `ember-addon.version` to `2`.
- Set `ember-addon.type` to `"addon"`.
- Set `ember-addon.main` to `"addon-main.cjs"`.
- Add explicit `exports` for every public module that still exists.
- Add matching `exports[*].types` entries that point at generated declarations.
- Add `typesVersions` entries for generated declarations when needed.
- Add `app-js` mappings only for resolver-visible files that still exist.
- Keep `files` publishing `addon-main.cjs`, `dist`, and `declarations`.

In `addon-main.cjs`, use `@embroider/addon-shim`:

```js
'use strict';

const { addonV1Shim } = require('@embroider/addon-shim');

module.exports = addonV1Shim(__dirname);
```

If the addon owns default macro configuration, merge those defaults into the
shim export as described in the macro section.

Audit deleted modules carefully. If a runtime config utility or initializer is
removed, remove its package export, declaration reference, and `app-js` mapping
unless it remains a supported public import for compatibility.

## 5. Configure Rollup and TypeScript

The addon build command should be:

```sh
rollup --config
```

Do not run `tsc` independently as part of the addon build.

Use the simpler v2 pattern:

- Let Rollup resolve TypeScript sources with `@rollup/plugin-node-resolve`.
- Let Babel strip TypeScript syntax.
- Generate declarations with `@embroider/addon-dev`.
- Keep source imports extensionless; do not introduce `.ts` relative import
  specifiers.
- Use `import type` for type-only relationships that would otherwise create
  circular runtime dependency warnings.
- Copy root `README.md` and `LICENSE.md` into the addon during Rollup builds if
  they should be included in the published package.
- Add `rollup-plugin-visualizer` behind an opt-in debug/analyze build.

Generated outputs should be ignored in the addon package:

```gitignore
/dist/
/declarations/
/README.md
/LICENSE.md
/stats.html
```

Keep generated declarations in `package.json#files` so published packages still
include `.d.ts` files.

Recommended scripts:

```json
{
  "build": "rollup --config",
  "build:analyze": "DEBUG=true rollup --config --perf",
  "lint:types": "glint",
  "prepack": "rollup --config",
  "start": "rollup --config --watch"
}
```

For apps that do not support Glint yet, choose a type lint command that works
with the existing package `tsconfig.json`; do not add a second tsconfig unless
the team explicitly wants one.

## 6. Move configuration to macros

Prefer build-time macro configuration only.

Runtime addon code should read from `@embroider/macros#getOwnConfig()`:

```ts
import { getOwnConfig } from '@embroider/macros';

const addonConfig = getOwnConfig() as {
  buildEnv?: string;
  activityUrl?: string;
  parentAppVersion?: string;
};
```

Addon-owned defaults belong in `addon-main.cjs` under
`@embroider/macros.setOwnConfig`:

```js
'use strict';

const { addonV1Shim } = require('@embroider/addon-shim');

module.exports = {
  ...addonV1Shim(__dirname),
  options: {
    '@embroider/macros': {
      setOwnConfig: {
        buildEnv: process.env.BUILD_ENV ?? 'staging',
        activityUrl: process.env.ACTIVITY_URL ?? '<addon default activity URL>'
      }
    }
  }
};
```

Consuming apps and test apps provide app-owned values or overrides with
`@embroider/macros.setConfig`:

```js
'@embroider/macros': {
  setConfig: {
    '<addon-package-name>': {
      buildEnv: process.env.BUILD_ENV || 'staging',
      activityUrl: process.env.ACTIVITY_URL || '<app activity URL>',
      parentAppVersion: version
    }
  }
}
```

For hyperevents, the config contract is:

- `buildEnv`: addon default from `process.env.BUILD_ENV ?? 'staging'`; runtime
  fallback `'staging'`.
- `activityUrl`: addon default from
  `process.env.ACTIVITY_URL ?? 'https://activity.upfluence.co/'`; consumers may
  override it with `setConfig`.
- `parentAppVersion`: supplied by the consuming app or test app with
  `setConfig`; runtime fallback `'unknown'`.

When documenting a migrated addon, treat `addon-main.cjs` as the source of truth
for addon-owned macro defaults and keep README examples aligned with it.

Do not preserve or recreate a runtime `Configuration` singleton for this pattern.
Do not keep an initializer whose only job is loading addon config from
`config/environment`.

If an addon still needs an initializer for unrelated behavior, keep that
initializer, but do not use it for macro configuration.

## 7. Update workspace scripts and hooks

Root scripts should delegate to workspace packages with `pnpm --filter`.

Common root scripts:

```json
{
  "build": "pnpm --filter <addon-package-name> build",
  "lint": "pnpm --filter <addon-package-name> --filter test-app lint",
  "lint:fix": "pnpm --filter <addon-package-name> --filter test-app lint:fix",
  "lint:types": "pnpm --filter <addon-package-name> --filter test-app lint:types",
  "test": "pnpm --filter <addon-package-name> --filter test-app test",
  "test:ember-compatibility": "pnpm --filter test-app test:ember-compatibility"
}
```

Makefile targets should call the workspace-aware scripts. Hook installation must
remain opt-in: do not install `.git/hooks/pre-push` from `install`, `all`,
`start`, or any default target. Provide explicit enable and disable targets.

The pre-push script should run workspace-aware commands such as:

```sh
pnpm lint
pnpm --filter test-app exec ember test --silent -r dot
```

## 8. Update CI, release, and publishing

CI should build and test the workspace layout:

```sh
pnpm --filter <addon-package-name> build
pnpm lint
pnpm lint:types
pnpm --filter test-app test:ember
```

Compatibility checks should run Ember Try from the test app workspace:

```sh
cd packages/test-app
pnpm ember try:one <scenario>
```

SonarQube coverage should run through the test app package:

```sh
pnpm --filter test-app test:coverage
```

For SonarQube, update the workspace-aware pieces together:

- Update `.github/workflows/sonarqube-sync.yml`.
- Replace missing root coverage commands with
  `pnpm --filter test-app test:coverage`.
- Update `sonar-project.properties` for the workspace layout.
- Point source, test, coverage, and TypeScript config paths at
  `packages/<addon-name>` and `packages/test-app`.

Release management should use root-level `release-it` with
`@release-it-plugins/workspaces`. Version bumps should update the published addon
manifest under `packages/<addon-name>/package.json`. Publishing should run from
the addon package directory:

```sh
pnpm publish --no-git-checks
```

Prefer package publishing through `prepack`, not `prepare`, so installs do not
eagerly build the addon.

## 9. Cleanup

Remove unnecessary placeholders and stale metadata:

- Delete `.gitkeep` files that only kept old Ember convention folders tracked.
- Remove `packageManager` keys when the repo does not want them.
- Keep the root workspace private.
- Keep the root workspace license and published package license aligned with the
  intended distribution model.
- Update README release, license, and configuration sections.

## 10. Validation checklist

Run:

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

From the addon package directory, run:

```sh
npm pack --dry-run
```

Verify release wiring:

```sh
pnpm release-it patch --dry-run --ci
```

Search for stale runtime config patterns:

```sh
rg "Configuration|resolveRegistration\\('config:environment'\\)|initializers/<addon>" packages/<addon-name>
```

Expected result: no stale config-loading code unless the initializer has a
separate, intentional runtime responsibility.

## Troubleshooting notes

- Disk pressure: do not randomly remove private dependencies. Free disk space
  outside the project or prune generated artifacts instead.
- Bootstrap failures involving `@upfluence/oss-components`: update
  `@upfluence/oss-components` to the latest compatible version instead of
  removing it.
- Testem may fail to bind to its browser test port in restricted environments.
  Re-run with appropriate local permission rather than changing the tests.
- Node 24 can trigger Rollup native package issues in this migration shape. Node
  20 was the reliable version during the hyperevents migration.
- `prepare` can run during install and make dependency setup brittle. Prefer
  `prepack` for package build output.
- If Rollup reports circular dependencies, check whether the cycle is type-only
  and convert those imports to `import type`.
