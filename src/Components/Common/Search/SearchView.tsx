import * as React from 'react';
import { Icon } from 'react-fa';
import { FormGroup, FormControl } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React';
import { BindableInput } from '../BindableInput/BindableInput';
import { SearchViewModel } from './SearchViewModel';
import { CommandButton } from '../CommandButton/CommandButton';

const EnterKey = 13;

export interface SearchProps {
  placeholder?: string;
}

export interface SearchViewProps extends SearchProps, BaseViewProps<SearchViewModel> {
}

export class SearchView extends BaseView<SearchViewProps, SearchViewModel> {
  public static displayName = 'SearchView';

  static defaultProps: Partial<SearchProps> = {
    placeholder: 'Search',
  };

  updateOn(viewModel: Readonly<SearchViewModel>) {
    return [
      viewModel.searchPending.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { placeholder } = x;
      return { placeholder };
    });

    return (
      <div { ...rest } className={ this.wxr.classNames('Search', className) }>
        <FormGroup>
          <BindableInput boundProperty={ this.viewModel.filter }>
            <FormControl className='Search-text' type='text' placeholder={ this.props.placeholder }
              onKeyDown={ this.bindEventToCommand(x => x.search, undefined, (e: React.KeyboardEvent<any>) => e.keyCode === EnterKey) }
            />
          </BindableInput>
          {
            this.wxr.renderConditional(
              this.viewModel.searchPending,
              () => (
                <Icon className='Search-icon Search-pendingIcon' name='spinner' pulse />
              ),
              () => this.wxr.renderConditional(
                String.isNullOrEmpty(this.viewModel.filter.value) === false,
                () => (
                  <CommandButton className='Search-icon Search-clearIcon' plain command={ this.viewModel.clear }>
                    <Icon name='times' />
                  </CommandButton>
                ),
              ),
            )
          }
          <CommandButton className='Search-icon' plain command={ this.viewModel.search }>
            <Icon name='search' />
          </CommandButton>
        </FormGroup>
      </div>
    );
  }
}
