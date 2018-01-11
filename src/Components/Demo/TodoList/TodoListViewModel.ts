import { Observable } from 'rxjs';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { Route } from '../../../Routing';
import { BaseViewModel, RoutingStateHandler, HandlerRoutingStateChanged } from '../../React';
import { ItemListPanelViewModel, ItemListPanelRoutingState } from '../../Common/ItemListPanel/ItemListPanelViewModel';
import { TodoListStore, TodoListItem } from './TodoListStore';

export class TodoListViewModel extends BaseViewModel implements RoutingStateHandler<ItemListPanelRoutingState> {
  public static displayName = 'TodoListViewModel';

  public newItemContent: Property<string>;
  public addItem: Command<any>;
  public removeItem: Command<TodoItemViewModel>;

  public list: ItemListPanelViewModel<TodoItemViewModel>;

  constructor(
    protected store = TodoListStore.default,
  ) {
    super();

    this.newItemContent = this.wx.property('');

    this.addItem = this.wx.command(
      this.wx.whenAny(this.newItemContent, x => String.isNullOrEmpty(x) === false),
    );

    this.removeItem = this.wx.command<TodoItemViewModel>();

    interface TodoListChange {
      reset?: Array<TodoItemViewModel>;
      add?: TodoItemViewModel;
      remove?: number;
    }

    const addedItems = this.addItem.results
      .debounceTime(100)
      .withLatestFrom(this.newItemContent.changed, (_, x) => x)
      .filterNull()
      .flatMap(x => {
        return this.wx
          .getObservableOrAlert(
            () => this.store.addItem(x),
            'Error Adding Item',
          );
      })
      .map(x => new TodoItemViewModel(x))
      .share();

    const removedItems = this.removeItem.results
      .debounceTime(100)
      .filterNull()
      .flatMap(x => {
        return this.wx
          .getObservableOrAlert(
            () => this.store.removeItem(x.id),
            'Error Removing Item',
          );
      })
      .share();

    const initialItems = this.wx
      .getObservableOrAlert(
        () => this.store.getItems(),
        'Error Fetching Items',
      )
      .map(x => {
        return x.map(item => new TodoItemViewModel(item));
      });

    const todoListItems = Observable
      .merge(
        initialItems.map(reset => <TodoListChange>{ reset }),
        addedItems.map(add => <TodoListChange>{ add }),
        removedItems.map(remove => <TodoListChange>{ remove }),
      )
      .scan(
        (items: TodoItemViewModel[], change: TodoListChange) => {
          if (change.reset) {
            this.logger.info(`Resetting List: ${ change.reset.length } Items`, change);
            return change.reset;
          }
          else if (change.add) {
            this.logger.info(`Adding Item: ${ change.add.content }`, change);
            return items.concat(change.add);
          }
          else if (change.remove) {
            this.logger.info(`Removing Item: ${ change.remove }`, change);
            return items.filter(x => x.id !== change.remove!);
          }
          return items;
        },
        [],
      );

    this.list = new ItemListPanelViewModel(
      todoListItems,
      (x, s) => x.filter(s.regex),
    );
  }

  isRoutingStateHandler() {
    return true;
  }

  createRoutingState(changed?: HandlerRoutingStateChanged) {
    return this.list.createRoutingState(changed);
  }

  applyRoutingState(state: ItemListPanelRoutingState) {
    this.list.applyRoutingState(state);
  }
}

export class TodoItemViewModel extends BaseViewModel {
  public static displayName = 'TodoItemViewModel';
  private static nextId = 1;

  public readonly id: number;
  public readonly content: string;

  public readonly toggleCompleted: Command<any>;
  public readonly completed: ReadOnlyProperty<boolean>;

  constructor(content: string, store?: TodoListStore);
  constructor(model: TodoListItem, store?: TodoListStore);
  constructor(arg: string | TodoListItem, protected store = TodoListStore.default) {
    super();

    if (String.isString(arg)) {
      this.id = TodoItemViewModel.nextId++;
      this.content = arg;
    }
    else {
      this.id = arg.id;
      this.content = arg.content;
    }

    this.toggleCompleted = this.wx.command(completed => {
      return this.wx
        .getObservableOrAlert(
          () => this.store.setCompleted(this.id, completed),
          'Error Changing Completed',
        );
    });

    this.completed = this.wx
      .whenAny(this.toggleCompleted.results, () => true)
      .scan(x => !x, false)
      .toProperty(String.isString(arg) ? false : arg.completed);
  }

  public filter(regexp: RegExp) {
    return [ this.content ].some(x => regexp.test(x));
  }
}
