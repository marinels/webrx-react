'use strict';

import * as React from 'react';

import { Input, InputProps, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import BindableInput from '../BindableInput/BindableInput';

import SearchViewModel from './SearchViewModel';

// import './Search.less';

interface ISearchProps extends IBaseViewProps {
}

export class SearchView extends BaseView<ISearchProps, SearchViewModel> {
  updateOn() {
    return [
      this.state.search.canExecuteObservable
    ]
  }
  
  render() {
    let inputProps = {
      placeholder: 'Enter Search Terms...',
      buttonAfter: (<Button disabled={this.state.search.canExecute(null) === false} onClick={this.bindEvent(x => x.search)}>Search</Button>),
      onKeyDown: this.bindEvent(x => x.search, (x: React.KeyboardEvent) => x.keyCode, x => x === 13)
    } as InputProps;

    return (
      <div className='Search'>
        <BindableInput property={this.state.filter}>
          <Input groupClassName='Search-group' type='text' {...inputProps} />
        </BindableInput>
      </div>
    );
  }
}

export default SearchView;
