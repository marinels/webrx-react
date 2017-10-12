import * as React from 'react';
import { Iterable } from 'ix';
import { Subscription } from 'rxjs';
import { ListGroupItemProps } from 'react-bootstrap';

import { wx } from '../../../WebRx';
import { compare } from '../../../Utils/Compare';
import { ListItemsViewModel } from './ListItemsViewModel';

export type SelectedPropsFunction = (isSelected: boolean, elem: React.ReactElement<React.HTMLAttributes<any>>) => {};

export interface SelectableListItemProps {
  listItems: Readonly<ListItemsViewModel<{}>>;
  item: {};
  selectedProps?: SelectedPropsFunction;
}

export interface SelectableListItemState {
  isSelected: boolean;
}

export class SelectableListItem extends React.Component<SelectableListItemProps, SelectableListItemState> {
  static defaultProps = {
    selectedProps: () => ({}),
  };

  private isSelectedSubscription: Subscription | undefined;

  constructor(props?: SelectableListItemProps, context?: any) {
    super(props, context);

    this.state = {
      isSelected: false,
    };
  }

  componentDidMount() {
    this.isSelectedSubscription = wx
      .whenAny(this.props.listItems.selectedItems, x => x)
      .map(x => x.indexOf(this.props.item) >= 0)
      .startWith(false)
      .distinctUntilChanged()
      .subscribe(isSelected => this.setState({ isSelected }));
  }

  componentWillUnmount() {
    Subscription.unsubscribe(this.isSelectedSubscription);
    this.isSelectedSubscription = undefined;
  }

  render() {
    const elem = React.Children.only(this.props.children);

    return React.cloneElement(elem, this.getListItemProps(elem));
  }

  protected getListItemProps(elem: React.ReactElement<any>): ListGroupItemProps {
    return Object.assign<ListGroupItemProps>(
      {},
      this.props.selectedProps!(this.state.isSelected, elem),
      {
        onClick: this.handleClick.bind(this),
      },
    );
  }

  protected handleClick(e: React.MouseEvent<any>) {
    e.stopPropagation();
    e.preventDefault();

    if (e.ctrlKey) {
      this.props.listItems.selectItems.execute(
        Iterable
          .from(this.props.listItems.selectedItems.value)
          .startWith(this.props.item)
          .filterNull()
          .distinct(undefined, compare)
          .toArray(),
      );
    }
    else if (e.shiftKey) {
      document.getSelection().removeAllRanges();
      const from = this.props.listItems.selectedItems.value[0] || this.props.item;
      this.props.listItems.selectRange.execute({ from, to: this.props.item });
    }
    else {
      this.props.listItems.selectItem.execute(this.props.item);
    }
  }
}
