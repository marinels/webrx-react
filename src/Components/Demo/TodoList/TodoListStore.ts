import { BaseStore } from '../../../Stores/BaseStore';
import { TodoListApi } from './TodoListApi';

export interface TodoListItem {
  id: number;
  content: string;
  completed: boolean;
}

export const TodoListActions = {
  GetItems: 'GetItems',
};

export class TodoListStore extends BaseStore {
  constructor() {
    super(TodoListApi.default);
  }

  public getItems() {
    return this.getObservable<Array<TodoListItem>>(TodoListActions.GetItems);
  }
}

export const Store = new TodoListStore();
