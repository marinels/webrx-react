'use strict';

import * as React from 'react';

import { Input, InputProps, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';
import Icon from '../Icon/Icon';

import SearchViewModel from './SearchViewModel';

export interface ISearchProps extends IBaseViewProps {
  searchButton?: any;
}

export class SearchView extends BaseView<ISearchProps, SearchViewModel> {
  public static displayName = 'SearchView';

  render() {
    let inputProps = {
      placeholder: 'Enter Search Terms...',
      onKeyDown: this.bindEvent(x => x.search, (e: React.KeyboardEvent) => e.keyCode === 13)
    } as InputProps;

    if (this.props.searchButton != null && this.props.searchButton !== false) {
      let searchButton = this.props.searchButton === true ? (
        <Icon name='bs-search' />
      ) : this.props.searchButton;

      inputProps.buttonAfter = (
        <Button disabled={this.state.search == null || this.state.search.canExecute(null) === false} onClick={this.bindEvent(x => x.search)}>
          {searchButton}
        </Button>
      );
    }

    return (
      <div className='Search'>
        <BindableInput property={this.state.filter}>
          <Input standalone className='Search-text' type='text' {...inputProps} />
        </BindableInput>
      </div>
    );
  }
}

export default SearchView;
