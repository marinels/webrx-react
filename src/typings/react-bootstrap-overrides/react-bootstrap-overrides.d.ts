/// <reference path="../../../typings/main/ambient/react/index.d.ts" />

// tslint:disable:no-unused-variable

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
  class FormGroup extends __React.Component<FormGroupProps, any> { }

  interface FormControlProps extends React.HTMLAttributes {
    bsClass?: string;
    componentClass?: string;
    id?: string;
    type?: string;
  }
  interface FormControlFeedbackProps extends React.HTMLAttributes {
    bsClass?: string;
  }
  class FormControlFeedback extends __React.Component<FormControlFeedbackProps, any> { }
  class FormControl extends __React.Component<FormControlProps, any> {
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
}
