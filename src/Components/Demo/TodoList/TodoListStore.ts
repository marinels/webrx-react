import { Observable } from 'rxjs';

import { BaseStore } from '../../../Stores/BaseStore';
import { TodoListApi } from './TodoListApi';

export interface TodoListItem {
  id: number;
  content: string;
  completed: boolean;
}

export const TodoListActions = {
  GetItems: 'GetItems',
  AddItem: 'AddItem',
  RemoveItem: 'RemoveItem',
  SetCompleted: 'SetCompleted',
};

export class TodoListStore extends BaseStore {
  public static displayName = 'TodoListStore';

  public static readonly default = new TodoListStore();

  constructor() {
    super(TodoListApi.default);
  }

  public getItems() {
    return this.getObservable<Array<TodoListItem>>(TodoListActions.GetItems);
  }

  public addItem(content: string) {
    return this.getObservable<TodoListItem>(TodoListActions.AddItem, { content });
  }

  public removeItem(id: number) {
    return this.getObservable<number>(TodoListActions.RemoveItem, { id });
  }

  public setCompleted(id: number, completed: boolean) {
    return this.getObservable<number>(TodoListActions.SetCompleted, { id, completed });
  }
}
