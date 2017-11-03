import { Observable } from 'rxjs';

import { BaseSampleDataStore } from '../../../../Stores/SampleData/BaseSampleDataStore';

// TODO: cannot do this because of re-entrancy
import { TodoListActions } from '../TodoListStore';

class TodoListStore extends BaseSampleDataStore {
  constructor() {
    super();

    this.connect(TodoListActions.GetItems, this.getItems);
  }

  public getItems(params: any = {}) {
    return Observable.throw(new Error('Not Implemented'));
  }
}

export const Store = new TodoListStore();
