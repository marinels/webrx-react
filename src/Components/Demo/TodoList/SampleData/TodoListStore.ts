import { BaseSampleDataStore } from '../../../../Stores/SampleData/BaseSampleDataStore';
import { TodoListActions, TodoListItem } from '../TodoListStore';

export interface TodoListSampleData {
  items: Array<TodoListItem>;
}

export class TodoListStore extends BaseSampleDataStore {
  public static displayName = 'TodoListStore';

  public static readonly default = new TodoListStore();

  public readonly data: TodoListSampleData;

  protected nextId = 1;

  constructor() {
    super();

    this.connect(TodoListActions.GetItems, this.getItems);
    this.connect(TodoListActions.AddItem, this.addItem);
    this.connect(TodoListActions.RemoveItem, this.removeItem);
    this.connect(TodoListActions.SetCompleted, this.setCompleted);

    this.data = {
      items: [
        this.createItem('first item', true),
        this.createItem('second item'),
        this.createItem('third item'),
      ],
    };
  }

  protected createItem(content: string, completed = false) {
    return { id: this.nextId++, content, completed };
  }

  public getItems() {
    return this.data.items;
  }

  public addItem(params: { content?: string } = {}) {
    if (String.isString(params.content)) {
      const item = this.createItem(params.content);

      this.data.items.push(item);

      return item;
    }

    throw new Error('Invalid Params: missing content');
  }

  public removeItem(params: { id?: number } = {}) {
    if (params.id != null && Number.isInteger(params.id)) {
      this.data.items = this.data.items
        .filter(x => x.id !== params.id);

      return params.id;
    }

    throw new Error('Invalid Params: missing id');
  }

  public setCompleted(params: { id?: number, completed?: boolean } = {}) {
    if (params.id != null && Number.isInteger(params.id)) {
      const item = this.data.items
        .asIterable()
        .single(x => x.id === params.id);

      if (item != null) {
        item.completed = params.completed === false ? false : true;

        return params.id;
      }

      throw new Error(`Invalid Params: item not found for id (${ params.id })`);
    }

    throw new Error('Invalid Params: missing id');
  }
}
