import * as React from 'react';
import { Grid, ProgressBar } from 'react-bootstrap';
import { Subscription } from 'rxjs';

import { Property } from '../../../WebRx';
import { wxr } from '../../React';

export function renderLoadable(
  isLoading: Property<boolean> | boolean | undefined | null,
  loadingComponent?: React.ReactNode | (() => React.ReactNode),
  loadedComponent?: () => React.ReactNode,
) {
  let action: () => React.ReactNode;

  if (loadingComponent instanceof Function) {
    action = loadingComponent;
  } else if (String.isString(loadingComponent)) {
    const text = loadingComponent;

    action = () => <Loading text={text} />;
  } else if (
    !React.isValidElement(loadingComponent) &&
    Object.isObject(loadingComponent)
  ) {
    const props: {} = loadingComponent;

    action = () => <Loading {...props} />;
  } else {
    action = () => <Loading />;
  }

  return wxr.renderConditional(isLoading, action, loadedComponent);
}

export function renderSizedLoadable(
  isLoading: Property<boolean> | boolean | undefined | null,
  text: string,
  fontSize: number | string,
  loadedComponent?: () => React.ReactNode,
) {
  return renderLoadable(
    isLoading,
    {
      text,
      fontSize,
    },
    loadedComponent,
  );
}

export function renderGridLoadable(
  isLoading: Property<boolean> | boolean | undefined | null,
  text: string,
  fontSize: number | string,
  loadedComponent?: () => React.ReactNode,
) {
  return renderLoadable(
    isLoading,
    {
      text,
      fontSize,
      componentClass: Grid,
    },
    loadedComponent,
  );
}

export interface LoadingProps {
  progress?: Property<number> | number;
  text?: string;
  fontSize?: number | string;
  componentClass?: any;
}

export interface LoadingComponentProps
  extends React.HTMLProps<any>,
    LoadingProps {}

export class Loading extends React.Component<LoadingComponentProps> {
  public static displayName = 'Loading';

  public static readonly renderLoadable = renderLoadable;
  public static readonly renderSizedLoadable = renderSizedLoadable;
  public static readonly renderGridLoadable = renderGridLoadable;

  static defaultProps: Partial<LoadingProps> = {
    progress: 100,
    text: 'Loading...',
    componentClass: 'div',
  };

  private changedSubscription = Subscription.EMPTY;

  componentDidMount() {
    if (this.wx.isProperty(this.props.progress) === true) {
      this.changedSubscription = (this.props.progress as Property<
        number
      >).changed.subscribe(() => {
        this.forceUpdate();
      });
    }
  }

  componentWillUnmount() {
    this.changedSubscription = Subscription.unsubscribe(
      this.changedSubscription,
    );
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { progress, text, fontSize, componentClass } = x;
      return { progress, text, fontSize, componentClass };
    });

    const Component = props.componentClass;

    return (
      <Component
        {...rest}
        className={this.wxr.classNames('Loading', className)}
      >
        <ProgressBar
          style={{ fontSize: props.fontSize }}
          active
          now={this.getProgressValue()}
          label={props.text}
        >
          {children}
        </ProgressBar>
      </Component>
    );
  }

  private getProgressValue() {
    return this.wx.isProperty(this.props.progress) === true
      ? (this.props.progress as Property<number>).value
      : (this.props.progress as number);
  }
}
