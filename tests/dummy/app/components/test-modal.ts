import Component from '@glimmer/component';
import { logConstruction } from '@upfluence/hyperevents/decorators/log-construction';

interface TestModalArgs {
  closeModal(): void;
}

@logConstruction('action description from decorator', 'component_view')
export default class TestModal extends Component<TestModalArgs> {}
