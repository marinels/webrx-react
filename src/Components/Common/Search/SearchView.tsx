'use strict';

import * as React from 'react';

import { InputGroup, FormControl, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';
import { Icon } from 'react-fa';

import SearchViewModel from './SearchViewModel';

const EnterKey = 13;

export interface ISearchProps extends IBaseViewProps {
  searchButton?: any;
  placeholder?: string;
}

export class SearchView extends BaseView<ISearchProps, SearchViewModel> {
  public static displayName = 'SearchView';

  static defaultProps = {
    placeholder: 'Enter Search Terms...',
  };

  render() {
    let input = (
      <BindableInput property={this.state.filter}>
        <FormControl className='Search-text' type='text' placeholder={this.props.placeholder}
          onKeyDown={this.bindEventToCommand<any, React.KeyboardEvent>(x => x.search, undefined, e => e.keyCode === EnterKey)} />
      </BindableInput>
    );

    if (this.props.searchButton != null && this.props.searchButton !== false) {
      input = (
        <InputGroup>
          { input }
          <InputGroup.Button>
            <Button disabled={this.state.search == null || this.state.search.canExecute(null) === false} onClick={this.bindEventToCommand(x => x.search)}>
              { this.props.searchButton === true ? <Icon name='search' /> : this.props.searchButton }
            </Button>
          </InputGroup.Button>
        </InputGroup>
      );
    }

    return (
      <div className='Search'>
        { input }
      </div>
    );
  }
}

export default SearchView;
