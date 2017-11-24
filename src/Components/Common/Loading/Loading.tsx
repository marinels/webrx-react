import * as React from 'react';
import { Subscription } from  'rxjs';
import { Grid, ProgressBar } from 'react-bootstrap';

import { Property } from '../../../WebRx';
import { wxr } from '../../React';

export function renderLoadable(
  isLoading: Property<boolean> | boolean | undefined,
  loadingComponent: any,
  loadedComponent?: any,
) {
  let action = loadingComponent;

  if (String.isString(loadingComponent)) {
    const text = loadingComponent;

    action = () => (
      <Loading text={ text } />
    );
  }
  else if (Object.isObject(loadingComponent) && React.isValidElement(loadingComponent) === false) {
    const props = loadingComponent;

    action = () => (
      <Loading { ...props } />
    );
  }

  return wxr.renderConditional(isLoading, action, loadedComponent);
}

export function renderSizedLoadable(
  isLoading: Property<boolean> | boolean | undefined,
  text: string,
  fontSize: number | string,
  loadedComponent?: any,
) {
  return renderLoadable(isLoading, {
    text,
    fontSize,
  }, loadedComponent);
}

export function renderGridLoadable(
  isLoading: Property<boolean> | boolean | undefined,
  text: string,
  fontSize: number | string,
  loadedComponent?: any,
) {
  return renderLoadable(isLoading, {
    text,
    fontSize,
    componentClass: Grid,
  }, loadedComponent);
}


export interface LoadingProps {
  progress?: Property<number> | number;
  text?: string;
  fontSize?: number | string;
  componentClass?: any;
}

export interface LoadingComponentProps extends React.HTMLProps<any>, LoadingProps {
}

export class Loading extends React.Component<LoadingComponentProps> {
  public static displayName = 'Loading';

  public static readonly renderLoadable = renderLoadable;
  public static readonly renderSizedLoadable = renderSizedLoadable;
  public static readonly renderGridLoadable = renderGridLoadable;

  static defaultProps = {
    progress: 100,
    text: 'Loading...',
    componentClass: 'div',
  };

  private changedSubscription = Subscription.EMPTY;

  componentDidMount() {
    if (this.wx.isProperty(this.props.progress) === true) {
      this.changedSubscription = (this.props.progress as Property<number>).changed
        .subscribe(() => { this.forceUpdate(); });
    }
  }

  componentWillUnmount() {
    this.changedSubscription = Subscription.unsubscribe(this.changedSubscription);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { progress, text, fontSize, componentClass } = x;
      return { progress, text, fontSize, componentClass };
    });

    const Component = props.componentClass;

    return (
      <Component { ...rest } className={ this.wxr.classNames('Loading', className) }>
        <ProgressBar style={({ fontSize: props.fontSize })} active now={ this.getProgressValue() } label={ props.text }>
          { children }
        </ProgressBar>
      </Component>
    );
  }

  private getProgressValue() {
    return this.wx.isProperty(this.props.progress) === true ?
      (this.props.progress as Property<number>).value :
      this.props.progress as number;
  }
}
