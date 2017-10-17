import * as React from 'react';
import { Observable } from 'rxjs';
import * as classNames from 'classnames';
import { Icon } from 'react-fa';
import { FormGroup, InputGroup, FormControl, FormControlProps } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { ItemListPanelView } from '../../Common/ItemListPanel/ItemListPanelView';
import { DataGridListViewTemplate } from '../../Common/DataGrid/DataGridView';
import { CommandButton } from '../../Common/CommandButton/CommandButton';
import { BindableInput } from '../../Common/BindableInput/BindableInput';
import { TodoListViewModel, TodoItemViewModel } from './TodoListViewModel';

import './TodoList.less';

export interface TodoListProps extends BaseViewProps {
  shadow?: boolean;
}

export class TodoListView extends BaseView<TodoListProps, TodoListViewModel> {
  private readonly listViewTemplate = new DataGridListViewTemplate<TodoItemViewModel>(
    x => (
      <TodoItemView viewModel={ x } />
    ),
    x => (
      <CommandButton className='TodoList-removeButton' bsStyle='danger'
        command={ () => this.viewModel.removeItem } commandParameter={ x }
      >
        Remove
      </CommandButton>
    ),
    x => x.id,
  );

  private input: React.Component<FormControlProps> | undefined;

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { shadow } = x;
      return { shadow };
    });

    return (
      <div { ...rest } className={ classNames('TodoList', className) }>
        <ItemListPanelView viewModel={ this.viewModel.list } viewTemplate={ this.listViewTemplate }
          emptyContent={ () => this.renderEmptyContent() }
          shadow={ this.props.shadow }
          headerContent='Canonical Todo List' search
          teaserContent={ this.renderTeaser() } footerContent={ this.renderFooter() }
        />
      </div>
    );
  }

  private renderEmptyContent() {
    if (this.viewModel.list.grid.allItems.value.length > 0) {
      return 'No todo items to show.';
    }

    return 'No todo items have been created yet.';
  }

  private onInputRef(input: React.Component<FormControlProps> | null) {
    if (this.input == null && input != null) {
      this.input = input;

      this.focusInput();
    }
  }

  private focusInput() {
    if (this.input != null) {
      const elem = this.focusElement<HTMLInputElement>(this.input);

      if (elem != null) {
        elem.select();
      }
    }
  }

  private renderTeaser() {
    return (
      <FormGroup className='TodoList-teaser'>
        <InputGroup>
          <BindableInput property={ this.viewModel.newItemContent }>
            <FormControl ref={ x => this.onInputRef(x) } id='newItemContent' type='text' placeholder='Type in a todo item here...'
              onKeyDown={ this.bindEventToCommand(x => x.addItem, undefined, (_, e: React.KeyboardEvent<any>) => e.keyCode === 13, () => this.focusInput()) }
            />
          </BindableInput>
          <InputGroup.Button>
            <CommandButton bsStyle='success' command={ this.viewModel.addItem } onClick={ () => this.focusInput() }>
              <Icon name='plus' />
              { ' Add New Todo Item' }
            </CommandButton>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

  private renderFooter() {
    return null;
  }
}

export interface TodoItemProps extends BaseViewProps {
}

export class TodoItemView extends BaseView<TodoItemProps, TodoItemViewModel> {
  updateOn(viewModel: Readonly<TodoItemViewModel>) {
    return [
      viewModel.completed.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const {  } = x;
      return {  };
    });

    return (
      <div { ...rest } className={ classNames('TodoItem', 'fa-lg', className, { completed: this.viewModel.completed.value }) }>
        <Icon name={ this.viewModel.completed.value ? 'check-circle' : 'circle-o' } size='lg' fixedWidth
          onClick={ this.bindEventToCommand(x => x.toggleCompleted) }
        />
        <span className='text-muted'>{ `[ ${ this.viewModel.id } ] ` }</span>
        <span className='TodoItem-content'>{ this.viewModel.content }</span>
      </div>
    );
  }
}
