import * as React from 'react';

import { wxr } from '../../React';

/**
 * A panel item context is metadata passed to a panel item to give some
 * context as to where in the container it is being rendered.
 */
export interface PanelItemContext {
  index: number;
}

export type PanelFragment = React.ReactChild | false;

/**
 * panel item prop can be statically assigned or dynamically determined
 * based on a provided item context
 */
export type PanelItemProp<TValue, TContext extends PanelItemContext = PanelItemContext> = TValue | ((context: TContext) => TValue);

/**
 * panel items can be wrapped in a different component
 * this allows composing new items with an existing panel
 */
export type PanelItemTemplate<TContext extends PanelItemContext = PanelItemContext> = (fragment: PanelFragment, context: TContext) => PanelFragment;

/**
 * panel item props allow component to inject props to the rendered
 * block structure.
 */
export interface PanelItemProps<T extends PanelItemContext = PanelItemContext> {
  /**
   * apply custom class name to the corresponding panel item
   */
  itemClassName?: PanelItemProp<string, T>;

  /**
   * apply custom style to the corresponding panel item
   */
  itemStyle?: PanelItemProp<React.CSSProperties, T>;

  /**
   * apply custom props to the corresponding panel item
   */
  itemProps?: PanelItemProp<{}, T>;
}

export interface PanelTemplateProps<T extends PanelItemContext = PanelItemContext> {
  /**
   * apply a custom template to the renderd panel item
   */
  itemTemplate?: PanelItemTemplate<T>;
}

export interface PanelRenderProps {
  compact?: boolean;
}

export interface PanelProps extends PanelItemProps, PanelTemplateProps, PanelRenderProps {
}

export abstract class Panel<TProps extends PanelProps> extends React.Component<TProps> {
  public static displayName = 'Panel';

  public static defaultComponentClass = 'div';

  public static getPanelItemPropValue<TValue, TContext extends PanelItemContext>(prop: (PanelItemProp<TValue, TContext>) | undefined, context: TContext) {
    if (prop instanceof Function) {
      return prop(context);
    }

    return prop;
  }

  protected renderPanel(panelClassName?: string, panelProps?: PanelProps, componentClass?: React.ReactType): JSX.Element {
    const { className, children, props, rest } = React.Component.restProps(panelProps || this.props, x => {
      const { itemClassName, itemStyle, itemProps, itemTemplate, compact } = x;
      return { itemClassName, itemStyle, itemProps, itemTemplate, compact };
    });

    const Component = componentClass || Panel.defaultComponentClass;
    const componentClassName = wxr.classNames(
      'Panel',
      { 'compact': props.compact },
      panelClassName,
      className,
    );

    return (
      <Component { ...rest } className={ componentClassName }>
        { this.renderItems(children) }
      </Component>
    );
  }

  protected renderItems(children?: React.ReactNode, componentClass?: React.ReactType) {
    const props: PanelProps = this.props;

    return React.Children
      .map(children || this.props.children, (x, i) => {
        return this.renderItem(x, i, componentClass);
      });
  }

  protected renderItem(
    itemTemplate: PanelFragment,
    index: number,
    componentClass?: React.ReactType,
  ): PanelFragment {
    const context = { index };
    const key = this.getItemKey(itemTemplate, index);
    const className = wxr.classNames('Panel-Item', Panel.getPanelItemPropValue(this.props.itemClassName, context));
    const style = Panel.getPanelItemPropValue(this.props.itemStyle, context);
    const props: {} | undefined = Panel.getPanelItemPropValue(this.props.itemProps, context) || {};
    const template = this.props.itemTemplate;
    const Component = componentClass == null ? Panel.defaultComponentClass : componentClass;

    const fragment = Component === '' && React.isValidElement<any>(itemTemplate) ?
      React.cloneElement(itemTemplate, { key, className, style, ...props }) :
      (
        <Component key={ key } className={ className } style={ style } { ...props }>
          { itemTemplate }
        </Component>
      );

    if (template == null) {
      return fragment;
    }

    return template(fragment, context);
  }

  protected getItemKey(
    itemTemplate: PanelFragment,
    index: number,
  ) {
    let key: any = index;

    if (itemTemplate != null && React.isValidElement(itemTemplate) && itemTemplate.key != null) {
      key = itemTemplate.key;
    }

    return key;
  }
}
