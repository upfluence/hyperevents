# @upfluence/hyperevents

[Short description of the addon.]

## Compatibility

- Ember.js v3.28 or above
- Ember CLI v3.28 or above
- ember-auto-import v2-compatible applications

## Installation

```
ember install @upfluence/hyperevents
```

## Usage

[Longer description of how to use the addon in apps.]

### Build-time configuration

Apps should provide activity metadata through `@embroider/macros`:

```js
'@embroider/macros': {
  setConfig: {
    '@upfluence/hyperevents': {
      buildEnv: process.env.BUILD_ENV || 'staging',
      activityUrl: process.env.ACTIVITY_URL || 'https://activity.upfluence.com',
      parentAppVersion: '<app version>'
    }
  }
}
```

`buildEnv` falls back to `staging` and `parentAppVersion` falls back to `unknown`.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

### Releasing

This project uses [release-it](https://github.com/release-it/release-it) with Workspaces support brought by the official
[Release-it Workspace plugin](https://github.com/release-it-plugins/workspaces).

To cut a new release, run `pnpm release-it` and follow the prompt questions.

For an explicit version bump, run `pnpm release-it patch`, `pnpm release-it minor`, or `pnpm release-it major`.

To release a beta version, run `pnpm release-it --preRelease=beta` and follow the prompt questions.

## License

The published `@upfluence/hyperevents` addon package is licensed under the [MIT License](LICENSE.md).
