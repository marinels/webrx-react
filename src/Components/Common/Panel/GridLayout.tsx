import * as React from 'react';

import { PanelItemContext, PanelItemProp, PanelItemProps, PanelTemplateProps, PanelRenderProps, PanelItemTemplate } from './Panel';

/**
 * a row context only knows about its row number
 * NOTE: the inherited index always has the same value as the row
 */
export interface GridRowContext extends PanelItemContext {
  row: number;
}

/**
 * a column context knows both its row number and column number
 * the index represents the index of the panel item being rendered
 */
export interface GridColumnContext extends GridRowContext {
  column: number;
}

/**
 * a layout element represents props for a component that helps define
 * the grid layout (i.e. GridRowDefinitions and RowDefinition)
 */
export interface GridLayoutElementProps<T = {}, TContext extends GridRowContext = GridRowContext> extends PanelItemProps<T, TContext>, PanelTemplateProps<TContext>, PanelRenderProps {
}

/**
 * a row layout element with a height prop
 */
export interface RowDefinitionProps<T = {}> extends GridLayoutElementProps<T> {
  height?: number;
}

/**
 * a component to define a grid row, optionally with a static height value
 * if height is omitted, height will auto stretch to consume available space
 */
export class RowDefinition extends React.Component<RowDefinitionProps> {
}

/**
 * a row collection layout element to define row layout elements as children
 */
export interface GridRowDefinitionsProps<T = {}> extends GridLayoutElementProps<T> {
  children?: React.ReactElement<RowDefinitionProps<T>> | Array<React.ReactElement<RowDefinitionProps<T>>>;
}

/**
 * a component to define the row layout component collection
 */
export class GridRowDefinitions extends React.Component<GridRowDefinitionsProps> {
}

/**
 * a column layout element with a width prop
 * width can be a ratio represented as a string (i.e., '1*' for 1 unit)
 * NOTE: if using multiple stretch columns, the number of units used
 * becomes the divisor (i.e., '1*', '2*', '4*' to denote 1/7, 2/7, 4/7)
 */
export interface ColumnDefinitionProps<T = {}> extends GridLayoutElementProps<T, GridColumnContext> {
  width?: number | string;
}

/**
 * a component to define a grid column, optionally with a width value
 * if width is omitted, width will auto stretch to consume '1*' of space
 */
export class ColumnDefinition extends React.Component<ColumnDefinitionProps> {
  static defaultProps = {
    width: '*',
  };
}

/**
 * a column collection layout element to define column layout elements as children
 */
export interface GridColumnDefinitionsProps<T = {}> extends GridLayoutElementProps<T, GridColumnContext> {
  children?: React.ReactElement<ColumnDefinitionProps<T>> | Array<React.ReactElement<ColumnDefinitionProps<T>>>;
}

/**
 * a component to define the column layout component collection
 */
export class GridColumnDefinitions extends React.Component<GridColumnDefinitionsProps> {
}

export type GridLayoutDefinitionGroupElement<T = {}> = React.ReactElement<GridRowDefinitionsProps<T> | GridColumnDefinitionsProps<T>>;
export type GridLayoutDefinitionElement<T = {}> = React.ReactElement<RowDefinitionProps<T> | ColumnDefinitionProps<T>>;

/**
 * this class is used internally to compute the grid layout metadata
 */
export class GridLayoutDefinition {
  public static generateKey(row: number, column?: number) {
    return `${ row }.${ column || '' }`;
  }

  public readonly amount: number | undefined;
  public readonly stretch: boolean;
  public readonly itemClassName: PanelItemProp<string, GridRowContext | GridColumnContext> | undefined;
  public readonly itemStyle: PanelItemProp<React.CSSProperties, GridRowContext | GridColumnContext> | undefined;
  public readonly itemProps: PanelItemProp<{}, GridRowContext | GridColumnContext> | undefined;
  public readonly compact: boolean | undefined;
  public readonly itemTemplate: PanelItemTemplate<GridRowContext | GridColumnContext> | undefined;

  constructor(definition?: GridLayoutDefinitionElement, definitionGroup?: GridLayoutDefinitionGroupElement) {
    let { val, type } = this.getLayoutParam(definition);
    let { amount, stretch } = this.getAmountAndStretch(val);

    if (type === RowDefinition && stretch === true) {
      amount = undefined;
      stretch = false;
    }
    else if (type === ColumnDefinition && amount == null && stretch === true) {
      amount = 1;
    }

    this.amount = amount;
    this.stretch = stretch;

    if (definitionGroup != null) {
      this.itemClassName = definitionGroup.props.itemClassName;
      this.itemStyle = definitionGroup.props.itemStyle;
      this.itemProps = definitionGroup.props.itemProps;
      this.compact = definitionGroup.props.compact;
      this.itemTemplate = definitionGroup.props.itemTemplate;
    }

    if (definition != null) {
      if (definition.props.itemClassName != null) {
        this.itemClassName = definition.props.itemClassName;
      }

      if (definition.props.itemStyle != null) {
        this.itemStyle = definition.props.itemStyle;
      }

      if (definition.props.itemProps != null) {
        this.itemProps = definition.props.itemProps;
      }

      if (definition.props.compact != null) {
        this.compact = definition.props.compact;
      }

      if (definition.props.itemTemplate != null) {
        this.itemTemplate = definition.props.itemTemplate;
      }
    }
  }

  protected getAmountAndStretch(val: string | number | undefined) {
    if (String.isString(val)) {
      if (val === '*') {
        return { amount: 1, stretch: true };
      }
      else if (val.length > 1) {
        if (val[val.length - 1] === '*') {
          return { amount: parseInt(val), stretch: true };
        }
        else {
          return { amount: parseInt(val), stretch: false };
        }
      }
      else {
        return { amount: parseInt(val), stretch: false };
      }
    }
    else if (val != null) {
      return { amount: val, stretch: false };
    }
    else {
      return { amount: undefined, stretch: true };
    }
  }

  protected getLayoutParam(definition?: GridLayoutDefinitionElement) {
    if (definition != null && React.isValidElement<RowDefinitionProps & ColumnDefinitionProps>(definition)) {
      return { val: definition.props.height || definition.props.width, type: definition.type };
    }
    else {
      return { val: undefined, type: undefined };
    }
  }
}
