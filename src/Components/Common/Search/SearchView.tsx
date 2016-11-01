import * as React from 'react';
import { Icon } from 'react-fa';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { BindableInput } from '../BindableInput/BindableInput';
import { SearchViewModel } from './SearchViewModel';
import { CommandButton } from '../CommandButton/CommandButton';

const EnterKey = 13;

export interface SearchProps extends BaseViewProps {
  button?: any;
  placeholder?: string;
}

export class SearchView extends BaseView<SearchProps, SearchViewModel> {
  public static displayName = 'SearchView';

  static defaultProps = {
    button: false,
    placeholder: 'Enter Search Terms...',
  };

  render() {
    const { className, rest } = this.restProps(x => {
      const { button, placeholder } = x;
      return { button, placeholder };
    });

    return (
      <div { ...rest } className={ classNames('Search', className) }>
        { this.renderInputGroup() }
      </div>
    );
  }

  private renderInputGroup() {
    return this.renderConditional(
      (this.props.button != null && this.props.button !== false), () => (
        <InputGroup>
          { this.renderInput() }
          <InputGroup.Button>
            <CommandButton command={ this.state.search }>
              {
                this.renderConditional(this.props.button === true, () => (
                  <Icon name='search' />
                ), this.props.button)
              }
            </CommandButton>
          </InputGroup.Button>
        </InputGroup>
      ), () => this.renderInput()
    );
  }

  private renderInput() {
    return (
      <BindableInput property={ this.state.filter }>
        <FormControl className='Search-text' type='text' placeholder={ this.props.placeholder }
          onKeyDown={ this.bindEventToCommand(x => x.search, undefined, (e: React.KeyboardEvent) => e.keyCode === EnterKey) }
        />
      </BindableInput>
    );
  }
}
