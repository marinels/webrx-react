import { Observable } from 'rxjs';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { Route } from '../../../Routing/RouteManager';
import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { ItemListPanelViewModel } from '../../Common/ItemListPanel/ItemListPanelViewModel';

export interface TodoListRoutingState {
}

export class TodoListViewModel extends BaseRoutableViewModel<TodoListRoutingState> {
  public static displayName = 'TodoListViewModel';

  public newItemContent: Property<string>;
  public addItem: Command<any>;
  public removeItem: Command<TodoItemViewModel>;

  public list: ItemListPanelViewModel<TodoItemViewModel>;

  constructor() {
    super(true);

    this.newItemContent = this.property('');

    this.addItem = this.command(
      this.whenAny(this.newItemContent, x => String.isNullOrEmpty(x) === false),
    );

    this.removeItem = this.command<TodoItemViewModel>();

    interface TodoListChange {
      add?: TodoItemViewModel;
      remove?: TodoItemViewModel;
    }

    const addedItems = this.addItem.results
      .debounceTime(100)
      .withLatestFrom(this.newItemContent.changed, (_, x) => x)
      .filterNull()
      .map(x => new TodoItemViewModel(x))
      .share();

    const todoListItems = Observable
      .merge(
        addedItems.map(add => <TodoListChange>{ add, remove: undefined }),
        this.removeItem.results.map(remove => <TodoListChange>{ add: undefined, remove }),
      )
      .startWith(<TodoListChange>{})
      .scan(
        (items: TodoItemViewModel[], change: TodoListChange) => {
          if (change.add) {
            this.logger.info(`Adding Item: ${ change.add.content }`);
            return items.concat(change.add);
          }
          else if (change.remove) {
            this.logger.info(`Removing Item: ${ change.remove.content }`);
            return items.filter(x => x.id !== change.remove!.id);
          }
          return items;
        },
        [],
      );

    this.list = new ItemListPanelViewModel(
      todoListItems,
      (x, regexp) => x.filter(regexp),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.isRoutingEnabled,
    );
  }
}

export class TodoItemViewModel extends BaseViewModel {
  public static displayName = 'TodoItemViewModel';
  private static nextId = 1;

  public readonly id: number;

  public readonly toggleCompleted: Command<any>;
  public readonly completed: ReadOnlyProperty<boolean>;

  constructor(public readonly content: string) {
    super();

    this.id = TodoItemViewModel.nextId++;

    this.toggleCompleted = this.command();
    this.completed = this
      .whenAny(this.toggleCompleted.results, () => true)
      .scan(x => !x, false)
      .toProperty(false);
  }

  public filter(regexp: RegExp) {
    return [ this.content ].some(x => regexp.test(x));
  }
}
