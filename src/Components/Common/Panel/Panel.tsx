import * as React from 'react';

import { wxr } from '../../React';

export interface PanelProps {
  componentClass?: React.ReactType;
}

export abstract class Panel<TProps extends PanelProps> extends React.Component<TProps> {
  public static displayName = 'Panel';

  public static defaultComponentClass = 'div';

  protected renderPanel(panelClassName?: string, panelProps?: PanelProps) {
    const { className, props, rest } = React.Component.restProps(panelProps || this.props, x => {
      const { componentClass } = x;
      return { componentClass };
    });

    return (
      <div { ...rest } className={ wxr.classNames('Panel', panelClassName, className) }>
        { this.renderItems() }
      </div>
    );
  }

  protected renderItems(children?: React.ReactNode) {
    const props: PanelProps = this.props;
    const Component = props.componentClass || Panel.defaultComponentClass;

    return React.Children
      .map(children || this.props.children, (x, i) => {
        return this.renderItem(x, i, Component);
      });
  }

  protected renderItem(
    itemTemplate: React.ReactNode,
    index: number,
    Component: React.ReactType,
  ) {
    const key = this.getItemKey(itemTemplate, index);
    return (
      <Component key={ key } className='Panel-Item'>{ itemTemplate }</Component>
    );
  }

  protected getItemKey(
    itemTemplate: React.ReactNode,
    index: number,
  ) {
    let key: any = index;

    if (itemTemplate != null && React.isValidElement(itemTemplate) && itemTemplate.key != null) {
      key = itemTemplate.key;
    }

    return key;
  }
}
