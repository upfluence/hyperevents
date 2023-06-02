# Activity Tracking

This document gives information about how to track user events on the frontend, using the activity-tracking service along with its helpers.

## Activity object

An Activity is defined as follows :
```typescript
type Activity = {
  type: ActivityType;
  action?: string;
  path: string;
  route: string;
  origin?: string;
  version?: string;
  extra?: {};
}
```

Where:
- Type: the type of the activity, 'page_view', 'button_click' or 'component_view'
- Action: The user action, formatted/normalized see section below
- Path: The URL path excluding the origin, as it is written in the browser
- Route: The current Route, as it is defined by the Ember router
- Origin: The domain (upfluence, identity, creators, etc.)
- Version: The version of the addon serving the application
- Extra: Any extra information we will want to include in the future

For example, a filled object could look like :
```javascript
let activity = {
  type: 'page_view',
  action: '[action]-[type]-[name]',
  origin: 'https://staging.upfluence.co/',
  route: '/workflow/campaigns/:campaign_id/sourcing',
  path: '/workflow/campaigns/464/sourcing',
  version: '42'
}
```

## Action formatting
__**TO DO: discuss and update this section**__
We will define a standard on how to format the "action" part of the Activity payload.
This needs to be further discussed but as a base idea we could have :
`[action]-[type]-[name]`

e.g.
`[open]-[modal]-[addProducts]`
`[close]-[modal]-[addProducts]`
`[click]-[button]-[selectAll]`

## Usage examples

### `log-activity` helper

Using it next to an `on "click"` action
```handlebars
    <OSS::Button @skin="primary" @label="Open modal" @icon="fa-connect"
                 {{enable-tooltip title="Click will trigger activity-tracker log"}}
                 {{on "click" (log-activity this.openModal "open product modal")}} />
```
or Using it next to an `on "click"` action wrapped inside an `fn` helper (if other params need to be passed to the @action
```handlebars
    <OSS::Button @skin="primary" @label="Open modal" @icon="fa-connect"
                 {{enable-tooltip title="Click will trigger activity-tracker log"}}
                 {{on "click" (log-activity (fn this.openModal "randomParam") "open product modal")}} />
```

### `log-insertion` modifier
```handlebars
<OSS::ModalDialog @title="Example modal" @close={{@closeModal}} @size="md"
                                  {{log-insertion "Product Modal has been opened"}}>
```
Will trigger the activity log on `element rendered`

### `log-deletion` modifier
```handlebars
<OSS::ModalDialog @title="Example modal" @close={{@closeModal}} @size="md"
                  {{log-deletion "Product Modal has been closed"}}>
```
Will trigger the activity log on `element destroyed`

### `@logConstruction` decorator
```typescript
import Component from '@glimmer/component';
import { logConstruction } from '@upfluence/hyperevents/decorators/log-construction';

interface TestModalArgs {
  closeModal(): void;
}

@logConstruction('action description from decorator', 'component_view')
export default class TestModal extends Component<TestModalArgs> {}
```
Note that the actionType on the decorator will default to `page_view` if it is not specified.

### `ActivityTrackingService` direct usage
The activity service has a public member `log(type: ActivityType, action: string): void` used to register an Activity on the backend.
The method will build an Activity object from the `type` & `action` parameters.

Note: This method batches all incoming activities into an `ActivityQueue` that will be triggered once every 1000ms. The call to the BE will only be triggered if there are activities in the `ActivityQueue`.

The `log` method is of `void` type (not a promise). It will make the requests to the server on its own and retry on error if needed (currently configured to retry once).
Having it resolve promises on its own means that as devs we don't need to handle anything else besides calling the `activityTracking.log(Activity)` where we want.

As a usage example, this method will be used in upfluence's web current route.onTransition listener to call the proper parameters (instead of google analytics :) )
