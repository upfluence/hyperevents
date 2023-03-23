import Component from '@glimmer/component';
import { trackOnConstructor } from 'dummy/decorators/track-on-constructor';

interface TestModalArgs {
  closeModal(): void;
}

@trackOnConstructor('action description from decorator', 'component_view')
export default class SubscriptionFeed extends Component<TestModalArgs> {}
