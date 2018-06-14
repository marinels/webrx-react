import * as React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { RoutingBreadcrumb } from '../../React';
import { CommandButton } from '../CommandButton/CommandButton';
import { ContentTooltip } from '../ContentTooltip/ContentTooltip';

export interface BreadcrumbsProps {
  id?: string;
  pinnable?: boolean;
  items?: RoutingBreadcrumb[];
}

export interface BreadcrumbsComponentProps extends React.HTMLProps<any>, BreadcrumbsProps {
}

export class Breadcrumbs extends React.Component<BreadcrumbsComponentProps> {
  static defaultProps: Partial<BreadcrumbsProps> = {
    id: 'breadcrumbs',
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { pinnable, items } = x;
      return { pinnable, items };
    });

    return this.wxr.renderIterable(
      props.items,
      (x, i, a) => {
        return this.renderCrumb(x, i, i === a.length - 1);
      },
      x => x.length === 0 ? null : (
        <div { ...rest } className={ this.wxr.classNames('Breadcrumbs', 'hidden-xs', className) }>
          <div className='Breadcrumbs-container'>
            <Breadcrumb>{ x }</Breadcrumb>
            {
              this.wxr.renderConditional(props.pinnable, () => (
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

  protected renderCrumb(crumb: RoutingBreadcrumb, index: number, active: boolean) {
    const breadcrumb = (
      <Breadcrumb.Item key={ crumb.key }
        active={ active } href={ crumb.href } title={ crumb.title } target={ crumb.target }
      >
        { crumb.content }
      </Breadcrumb.Item>
    );

    return this.wxr
      .renderNullable(
        crumb.tooltip,
        x => (
          <ContentTooltip key={ crumb.key } id={ `${ crumb.key }-tt` }
            content={ x } context={ breadcrumb } placement={ x.placement || 'bottom' }
          />
        ),
        () => breadcrumb,
      );
  }

  protected toggleBreadcrumbsPin() {
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
}
