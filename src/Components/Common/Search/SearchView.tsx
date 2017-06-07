import * as React from 'react';
import { Observable } from 'rxjs';
import { Icon } from 'react-fa';
import { FormGroup, InputGroup, FormControl } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React';
import { BindableInput } from '../BindableInput/BindableInput';
import { SearchViewModel } from './SearchViewModel';
import { CommandButton } from '../CommandButton/CommandButton';

const EnterKey = 13;

export interface SearchProps {
  placeholder?: string;
}

export interface SearchViewProps extends SearchProps, BaseViewProps {
}

export class SearchView extends BaseView<SearchViewProps, SearchViewModel> {
  public static displayName = 'SearchView';

  static defaultProps = {
    placeholder: 'Search',
  };

  render() {
    const { className, rest } = this.restProps(x => {
      const { placeholder } = x;
      return { placeholder };
    });

    return (
      <div { ...rest } className={ this.classNames('Search', className) }>
        <FormGroup className='has-feedback'>
          <BindableInput property={ this.state.filter }>
            <FormControl className='Search-text' type='text' placeholder={ this.props.placeholder }
              onKeyDown={ this.bindEventToCommand(x => x.search, undefined, (e: React.KeyboardEvent<any>) => e.keyCode === EnterKey) }
            />
          </BindableInput>
          <Icon className='Search-icon form-control-feedback' name='search' />
        </FormGroup>
      </div>
    );
  }
}
