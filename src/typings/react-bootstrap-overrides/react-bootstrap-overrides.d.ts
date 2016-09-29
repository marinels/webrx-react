/// <reference path="../../../typings/main/ambient/react/index.d.ts" />

// The react-bootstrap typing are a bit out of date
// these overrides will fill in the missing components

declare module 'react-bootstrap' {
  import React = require('react');

  interface FormGroupProps extends React.HTMLAttributes {
    bsClass?: string;
    bsSize?: string;
    controlId?: string;
    validationState?: string;
  }
  class FormGroup extends React.Component<FormGroupProps, any> { }

  interface FormControlProps extends React.HTMLAttributes {
    bsClass?: string;
    componentClass?: string;
    id?: string;
    type?: string;
  }
  interface FormControlFeedbackProps extends React.HTMLAttributes {
    bsClass?: string;
  }
  class FormControlFeedback extends React.Component<FormControlFeedbackProps, any> { }
  class FormControl extends React.Component<FormControlProps, any> {
    static Feedback: FormControlFeedback;
  }

  interface ControlLabelProps extends React.HTMLAttributes {
    bsClass?: string;
    htmlFor?: string;
    srOnly?: boolean;
  }
  class ControlLabel extends React.Component<ControlLabelProps, any> { }

  interface CheckboxProps extends React.HTMLAttributes {
    bsClass?: string;
    disabled?: boolean;
    inline?: boolean;
    validationState?: string;
  }
  class Checkbox extends React.Component<CheckboxProps, any> { }

  interface RadioProps extends React.HTMLAttributes {
    bsClass?: string;
    disabled?: boolean;
    inline?: boolean;
    validationState?: string;
  }
  class Radio extends React.Component<RadioProps, any> { }

  interface HelpBlockProps extends React.HTMLAttributes {
    bsClass?: string;
  }
  class HelpBlock extends React.Component<HelpBlockProps, any> { }

  interface FormProps extends React.HTMLAttributes {
    bsClass?: string;
    componentClass?: string;
    horizontal?: boolean;
    inline?: boolean;
  }
  class Form extends React.Component<FormProps, any> { }

  interface InputGroupProps extends React.HTMLAttributes {
    bsClass?: string;
    bsSize?: string;
  }
  class InputGroupAddon extends React.Component<React.HTMLAttributes, any> { }
  class InputGroupButton extends React.Component<React.HTMLAttributes, any> { }
  class InputGroup extends React.Component<InputGroupProps, any> {
    static Addon: InputGroupAddon;
    static Button: InputGroupButton;
  }

  interface ImageProps extends React.HTMLAttributes {
    src: string;
    responsive?: boolean;
    rounded?: boolean;
    circle?: boolean;
    thumbnail?: boolean;
    title?: string;
    width?: number;
    height?: number;
  }
  class Image extends React.Component<ImageProps, any> { }

  interface NavbarWrapperProps extends React.HTMLAttributes {
    componentClass?: any;
    pullRight?: boolean;
  }

  class NavbarForm extends React.Component<NavbarWrapperProps, {}> {
  }

  class NavbarText extends React.Component<NavbarWrapperProps, {}> {
  }

  class NavbarLink extends React.Component<NavbarWrapperProps, {}> {
  }

  interface NavbarClass {
    Form: typeof NavbarForm;
    Text: typeof NavbarText;
    Link: typeof NavbarLink;
  }

  interface CollapseProps extends React.HTMLAttributes {
    dimension?: string;
    getDimensionValue?: Function;
    in?: boolean;
    onEnter?: Function;
    onEntered?: Function;
    onEntering?: Function;
    onExit?: Function;
    onExited?: Function;
    onExiting?: Function;
    role?: string;
    timeout?: number;
    transitionAppear?: boolean;
    unmountOnExit?: boolean;
  }
  class Collapse extends React.Component<CollapseProps, any> { }

  interface ClearfixProps extends React.HTMLAttributes {
    componentClass?: string;
    visibleLgBlock?: boolean;
    visibleMdBlock?: boolean;
    visibleSmBlock?: boolean;
    visibleXsBlock?: boolean;
  }
  class Clearfix extends React.Component<ClearfixProps, any> { }
}
