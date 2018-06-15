// tslint:disable:max-classes-per-file

import * as React from 'react';
import { MenuItemProps, Overlay, Popover, PopoverProps } from 'react-bootstrap';

export interface ContextMenuProps {
  key?: string | number;
  id: string;
  header?: string;
  onSelect?: (item: MenuItemProps) => void;
}

export interface ContextMenuState {
  isVisible: boolean;
  left?: number;
  top?: number;
}

// this is necessary to prevent a js error due to the Overlay trying to position
// the Popup.
// The Overlay attempts to pass on a bunch of props to its child and these props
// are not supported by the child node. We end up with a React 'Unknown props'
// error. So to circumvent this issue, we use this container wrapper that consumes
// all those Overlay injected props and only passes on the className and children.
// We still need to 'support' all the PopoverProps to eliminate the error.
class ContextMenuContainer extends React.Component<PopoverProps> {
  render() {
    return (
      <div className={ this.wxr.classNames('ContextMenu-container', this.props.className) }>
        { this.props.children }
      </div>
    );
  }
}

const ArrowOffset = 20;

export class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {
  public static displayName = 'ContextMenu';

  constructor(props: any) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleHide = this.handleHide.bind(this);

    this.state = {
      isVisible: false,
    } as ContextMenuState;
  }

  private handleClick(e: React.MouseEvent<HTMLDivElement>) {
    // check if the right mouse button was clicked
    const isVisible = e.button === 2;

    if (isVisible === true) {
      // prevent other actions from happening
      e.stopPropagation();
      e.preventDefault();

      const left = e.pageX;
      const top = e.pageY - ArrowOffset;

      // update our state
      this.setState((prevState, props) => {
        return {
          isVisible,
          left,
          top,
        };
      });
    }
  }

  private handleHide() {
    this.setState((prevState, props) => {
      return {
        isVisible: false,
        left: undefined,
        top: undefined,
      };
    });
  }

  render() {
    const menuItems: React.ReactChild[] = React.Children
      .toArray(this.props.children);

    return (
      <div className='ContextMenu'>
        <div className='ContextMenu-target' onContextMenu={ this.handleClick }>
          { menuItems.shift() }
        </div>
        <Overlay show={ this.state.isVisible } rootClose onHide={ this.handleHide }>
          <ContextMenuContainer>
            { this.renderMenu(menuItems) }
          </ContextMenuContainer>
        </Overlay>
      </div>
    );
  }

  private renderMenu(menuItems: React.ReactChild[]) {
    return this.wxr.renderConditional(this.state.isVisible === true, () => {
      return (
        <Popover id={ this.props.id } placement='right' title={ this.props.header }
          arrowOffsetTop={ ArrowOffset } positionLeft={ this.state.left } positionTop={ this.state.top }
        >
          <ul className='dropdown-menu'>
            {
              // if onSelect is provided we need to inject it into all the menu items
              this.wxr.renderNullable(
                this.props.onSelect,
                onSelect => React.Children
                  .map(menuItems, (x: React.ReactElement<any>) =>
                    React.cloneElement(x, { onSelect: () => onSelect(x.props) }),
                  ),
                () => menuItems,
              )
            }
          </ul>
        </Popover>
      );
    });
  }
}
