import * as React from 'react';

import { wxr } from '../../React';

export interface PanelItemContext {
  index: number;
}

export type PanelItemProp<TValue, TContext extends PanelItemContext = PanelItemContext> = TValue | ((context: TContext) => TValue);

export interface PanelItemProps<T extends PanelItemContext = PanelItemContext> {
  itemClassName?: PanelItemProp<string, T>;
  itemStyle?: PanelItemProp<React.CSSProperties, T>;
}

export interface PanelProps extends React.HTMLAttributes<PanelProps>, PanelItemProps {
}

export abstract class Panel<TProps extends PanelProps> extends React.Component<TProps> {
  public static displayName = 'Panel';

  public static defaultComponentClass = 'div';

  public static getPanelItemPropValue<TValue, TContext extends PanelItemContext>(prop: PanelItemProp<TValue, TContext> | undefined, context: TContext) {
    if (prop instanceof Function) {
      return prop(context);
    }

    return prop;
  }

  protected renderPanel(panelClassName?: string, panelProps?: PanelProps) {
    const { className, props, rest } = React.Component.restProps(panelProps || this.props, x => {
      const { itemClassName, itemStyle } = x;
      return { itemClassName, itemStyle };
    });

    return (
      <div { ...rest } className={ wxr.classNames('Panel', panelClassName, className) }>
        { this.renderItems() }
      </div>
    );
  }

  protected renderItems(children?: React.ReactNode) {
    const props: PanelProps = this.props;

    return React.Children
      .map(children || this.props.children, (x, i) => {
        return this.renderItem(x, i);
      });
  }

  protected renderItem(
    itemTemplate: React.ReactNode,
    index: number,
  ) {
    const key = this.getItemKey(itemTemplate, index);
    const className = wxr.classNames('Panel-Item', Panel.getPanelItemPropValue(this.props.itemClassName, { index }));
    const style = Panel.getPanelItemPropValue(this.props.itemStyle, { index });
    return (
      <div key={ key } className={ className } style={ style }>
        { itemTemplate }
      </div>
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
