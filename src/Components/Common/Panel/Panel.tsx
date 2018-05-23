import * as React from 'react';

/**
 * A panel item context is metadata passed to a panel item to give some
 * context as to where in the container it is being rendered.
 */
export interface PanelItemContext {
  index: number;
}

export type PanelFragment = React.ReactNode;

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
export interface PanelItemProps<T = {}, TContext extends PanelItemContext = PanelItemContext> {
  /**
   * apply custom class name to the corresponding panel item
   */
  itemClassName?: PanelItemProp<string, TContext>;

  /**
   * apply custom style to the corresponding panel item
   */
  itemStyle?: PanelItemProp<React.CSSProperties, TContext>;

  /**
   * apply custom props to the corresponding panel item
   */
  itemProps?: PanelItemProp<T, TContext>;
}

export interface PanelTemplateProps<T extends PanelItemContext = PanelItemContext> {
  /**
   * apply a custom template to the renderd panel item
   */
  itemTemplate?: PanelItemTemplate<T>;
}

export interface PanelRenderProps {
  compact?: boolean;

  /**
   * apply a custom content to an empty panel with no items to render
   */
  emptyContent?: PanelFragment;
}

export interface PanelProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends PanelItemProps<T, TContext>, PanelTemplateProps<TContext>, PanelRenderProps {
  fill?: boolean;
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
      const { itemClassName, itemStyle, itemProps, itemTemplate, compact, emptyContent } = x;
      return { itemClassName, itemStyle, itemProps, itemTemplate, compact, emptyContent };
    });

    const Component = componentClass || Panel.defaultComponentClass;
    const componentClassName = this.wxr.classNames(
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
      })
      .asIterable()
      .filter(x => x ? true : false)
      .defaultIfEmpty(this.renderEmpty())
      .toArray();
  }

  protected renderEmpty() {
    if (this.props.emptyContent) {
      return (
        <div key='empty' className='Panel-empty'>
          { this.props.emptyContent }
        </div>
      );
    }

    return false;
  }

  protected renderItem(
    itemTemplate: PanelFragment,
    index: number,
    componentClass?: React.ReactType,
  ): PanelFragment {
    const context = { index };

    const fragment = this.renderItemFragment(
      itemTemplate,
      context,
      componentClass == null ? Panel.defaultComponentClass : componentClass,
    );

    if (this.props.itemTemplate == null) {
      return fragment;
    }

    return this.props.itemTemplate(fragment, context);
  }

  protected renderItemFragment(
    itemTemplate: PanelFragment,
    context: PanelItemContext,
    Component: React.ReactType,
  ): PanelFragment {
    if (itemTemplate) {
      const key = this.getItemKey(itemTemplate, context.index);
      const className = this.wxr.classNames('Panel-Item', Panel.getPanelItemPropValue(this.props.itemClassName, context));
      const style = Panel.getPanelItemPropValue(this.props.itemStyle, context);
      const props: {} | undefined = Panel.getPanelItemPropValue(this.props.itemProps, context) || {};

      return Component === '' && React.isValidElement<any>(itemTemplate) ?
        React.cloneElement(itemTemplate, { key, className, style, ...props }) :
        (
          <Component key={ key } className={ className } style={ style } { ...props }>
            { itemTemplate }
          </Component>
        );
    }

    return null;
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
