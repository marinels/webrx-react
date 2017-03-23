import * as React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';

import { RoutingBreadcrumb } from '../../React/BaseRoutableViewModel';
import { renderConditional, renderEnumerable } from '../../React/RenderHelpers';
import { CommandButton } from '../CommandButton/CommandButton';

import './Breadcrumbs.less';

export interface BreadcrumbsProps extends React.HTMLProps<any> {
  id?: string;
  pinnable?: boolean;
  items?: RoutingBreadcrumb[];
}

export class Breadcrumbs extends React.Component<BreadcrumbsProps, any> {
  static defaultProps = {
    id: 'breadcrumbs',
  };

  private toggleBreadcrumbsPin() {
    const elem = document
      .getElementById(this.props.id!);

    if (elem != null) {
      if (/fixed/.test(elem.className)) {
        elem.className = 'Breadcrumbs';
      }
      else {
        elem.className = 'Breadcrumbs fixed';
      }
    }
  }

  render() {
    const { children, className, ref, pinnable, items, ...rest } = this.props;

    return renderEnumerable(
      items,
      (x, i, a) => (
        <Breadcrumb.Item key={ x.key } active={ i === a.length - 1 } href={ x.href } title={ x.title } target={ x.target }>
          { x.content }
        </Breadcrumb.Item>
      ),
      x => x.length === 0 ? null : (
        <div { ...rest } className={ classNames('Breadcrumbs', className) }>
          <div className='Breadcrumbs-container'>
            <Breadcrumb>{ x }</Breadcrumb>
            {
              renderConditional(pinnable, () => (
                <CommandButton className='Breadcrumbs-pin' bsStyle='link'
                  onClick={ () => this.toggleBreadcrumbsPin() }
                >
                  <Icon name='thumb-tack' size='lg' rotate='90' />
                </CommandButton>
              ))
            }
          </div>
        </div>
      ),
    );
  }
}
