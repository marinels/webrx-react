import * as ObservableHelpers from './ObservableHelpers';
import * as BindingHelpers from './BindingHelpers';
import * as RenderHelpers from './RenderHelpers';

export const wxr = <WebRxReactStatic>{};

export interface WebRxReactStatic {
  logObservable: typeof ObservableHelpers.logObservable;
  logMemberObservables: typeof ObservableHelpers.logMemberObservables;
  getObservableOrAlert: typeof ObservableHelpers.getObservableOrAlert;
  getObservableResultOrAlert: typeof ObservableHelpers.getObservableResultOrAlert;
  subscribeOrAlert: typeof ObservableHelpers.subscribeOrAlert;
}
wxr.logObservable = ObservableHelpers.logObservable;
wxr.logMemberObservables = ObservableHelpers.logMemberObservables;
wxr.getObservableOrAlert = ObservableHelpers.getObservableOrAlert;
wxr.getObservableResultOrAlert = ObservableHelpers.getObservableResultOrAlert;
wxr.subscribeOrAlert = ObservableHelpers.subscribeOrAlert;

export interface WebRxReactStatic {
  bindObservableToCommand: typeof BindingHelpers.bindObservableToCommand;
  bindEventToProperty: typeof BindingHelpers.bindEventToProperty;
  bindEventToCommand: typeof BindingHelpers.bindEventToCommand;
}
wxr.bindObservableToCommand = BindingHelpers.bindObservableToCommand;
wxr.bindEventToProperty = BindingHelpers.bindEventToProperty;
wxr.bindEventToCommand = BindingHelpers.bindEventToCommand;

export interface WebRxReactStatic {
  renderEnumerable: typeof RenderHelpers.renderEnumerable;
  renderConditional: typeof RenderHelpers.renderConditional;
  renderNullable: typeof RenderHelpers.renderNullable;
  renderLoadable: typeof RenderHelpers.renderLoadable;
  renderSizedLoadable: typeof RenderHelpers.renderSizedLoadable;
  renderGridLoadable: typeof RenderHelpers.renderGridLoadable;
  focusElement: typeof RenderHelpers.focusElement;
  classNames: typeof RenderHelpers.classNames;
}
wxr.renderEnumerable = RenderHelpers.renderEnumerable;
wxr.renderConditional = RenderHelpers.renderConditional;
wxr.renderNullable = RenderHelpers.renderNullable;
wxr.renderLoadable = RenderHelpers.renderLoadable;
wxr.renderSizedLoadable = RenderHelpers.renderSizedLoadable;
wxr.renderGridLoadable = RenderHelpers.renderGridLoadable;
wxr.focusElement = RenderHelpers.focusElement;
wxr.classNames = RenderHelpers.classNames;
