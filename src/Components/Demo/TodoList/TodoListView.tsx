// tslint:disable:max-classes-per-file

import * as React from 'react';
import { FormControl, FormControlProps, FormGroup, InputGroup } from 'react-bootstrap';
import { Icon } from 'react-fa';
import { Observable } from 'rxjs';

import { Command } from '../../../WebRx';
import { BindableInput } from '../../Common/BindableInput/BindableInput';
import { CommandButton } from '../../Common/CommandButton/CommandButton';
import { ItemListPanelView } from '../../Common/ItemListPanel/ItemListPanelView';
import { ListGroupView } from '../../Common/ListItems/ListGroupView';
import { BaseView, BaseViewProps } from '../../React';
import { TodoItemViewModel, TodoListViewModel } from './TodoListViewModel';

import './TodoList.less';

export interface TodoListProps {
  shadow?: boolean;
}

export interface TodoListViewProps extends BaseViewProps<TodoListViewModel>, TodoListProps {
}

export class TodoListView extends BaseView<TodoListViewProps, TodoListViewModel> {
  private input: React.Component<FormControlProps> | undefined;

  constructor(props: any) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
  }

  private onInputRef(input: React.Component<FormControlProps> | null) {
    if (this.input == null && input != null) {
      this.input = input;

      this.focusInput();
    }
  }

  private focusInput() {
    if (this.input != null) {
      const elem = this.wxr.focusElement<HTMLInputElement>(this.input);

      if (elem != null) {
        elem.select();
      }
    }
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { shadow } = x;
      return { shadow };
    });

    return (
      <div { ...rest } className={ this.wxr.classNames('TodoList', className) }>
        <ItemListPanelView viewModel={ this.viewModel.list } collapsible pager search compact
          emptyContent={ this.renderEmptyContent() }
          shadow={ this.props.shadow }
          itemTemplate={ this.renderItem }
          headerContent='Canonical Todo List'
          teaserContent={ this.renderTeaser() } footerContent={ this.renderFooter() }
        >
          <ListGroupView />
        </ItemListPanelView>
      </div>
    );
  }

  protected renderItem(item: TodoItemViewModel) {
    return (
      <TodoItemView viewModel={ item } remove={ this.viewModel.removeItem } />
    );
  }

  protected renderEmptyContent() {
    if (this.viewModel.list.count.value > 0) {
      return 'No todo items to show.';
    }

    return 'No todo items have been created yet.';
  }

  protected renderTeaser() {
    return (
      <FormGroup className='TodoList-teaser'>
        <InputGroup>
          <BindableInput boundProperty={ this.viewModel.newItemContent }>
            <FormControl ref={ x => this.onInputRef(x) } id='newItemContent' type='text'
              placeholder='Type in a todo item here...'
              onKeyDown={
                this.bindEventToCommand(
                  x => x.addItem,
                  undefined,
                  (_, e: React.KeyboardEvent<any>) => e.keyCode === 13,
                  () => this.focusInput(),
                )
              }
            />
          </BindableInput>
          <InputGroup.Button>
            <CommandButton bsStyle='success' command={ this.viewModel.addItem } onClick={ this.handleAddItem }>
              <Icon name='plus' />
              { ' Add New Todo Item' }
            </CommandButton>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

  protected renderFooter() {
    return null;
  }

  protected handleAddItem() {
    // this will allow the text input to regain focus after the command is executed
    this.focusInput();
  }
}

export interface TodoItemProps {
  remove: Command<TodoItemViewModel>;
}

export interface TodoItemViewProps extends BaseViewProps<TodoItemViewModel>, TodoItemProps {
}

export class TodoItemView extends BaseView<TodoItemViewProps, TodoItemViewModel> {
  constructor(props: any) {
    super(props);

    this.getRemoveCommand = this.getRemoveCommand.bind(this);
  }

  updateOn(viewModel: Readonly<TodoItemViewModel>) {
    return [
      viewModel.completed.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { remove } = x;
      return { remove };
    });

    return (
      <div { ...rest } className={
        this.wxr.classNames('TodoItem', 'fa-lg', className, { completed: this.viewModel.completed.value })
      }>
        <div className='TodoItem-main'>
          <CommandButton plain onClick={
            this.bindEventToCommand(x => x.toggleCompleted)
          } stopPropagation preventDefault>
            <Icon name={ this.viewModel.completed.value ? 'check-circle' : 'circle-o' } size='lg' fixedWidth />
          </CommandButton>
          <span className='text-muted'>{ `[ ${ this.viewModel.id } ] ` }</span>
          <span className='TodoItem-content'>{ this.viewModel.content }</span>
        </div>
        <div className='TodoItem-actions'>
          <CommandButton bsStyle='danger' bsSize='xs' componentClass='a'
            command={ this.getRemoveCommand } commandParameter={ this.viewModel }
          >
            <Icon name='times' fixedWidth />
          </CommandButton>
        </div>
      </div>
    );
  }

  protected getRemoveCommand() {
    return this.props.remove;
  }
}
