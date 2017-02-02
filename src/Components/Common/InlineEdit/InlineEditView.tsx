import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';
import { FormGroup, InputGroup, FormControl, Sizes, Popover, OverlayTrigger } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { BindableInput, BindableProps } from '../BindableInput/BindableInput';
import { CommandButton } from '../CommandButton/CommandButton';
import { InlineEditViewModel } from './InlineEditViewModel';

import './InlineEdit.less';

interface InlineEditProps<T> extends BaseViewProps, BindableProps {
  controlId?: string;
  inputType?: string;
  placeholder?: string;
  keyboard?: boolean;
  clickToEdit?: boolean;
  bsSize?: Sizes;
  template?: (x: T, view: InlineEditView) => any;
  editTemplate?: (x: T, view: InlineEditView) => any;
  errorContent?: any | ((viewModel: InlineEditViewModel<any>, view: InlineEditView) => any);
  errorPlacement?: string;
}

export class InlineEditView extends BaseView<InlineEditProps<any>, InlineEditViewModel<any>> {
  public static displayName = 'InlineEditView';

  static defaultProps = {
    inputType: 'text',
    placeholder: 'Enter New Value...',
    template: (x: any, view: InlineEditView) => x.toString(),
    editTemplate: (x: any, view: InlineEditView) => (
      <FormControl type={ view.props.inputType } placeholder={ view.props.placeholder } />
    ),
    errorContent: (
      <div>
        <div><strong>Sorry, your change was not saved.</strong></div>
        <div>Please try again.</div>
      </div>
    ),
    errorPlacement: 'right',
  };

  private handleKeyDown(e: React.KeyboardEvent<any>) {
    switch (e.keyCode) {
      case 13: // ENTER key
        this.state.save.execute(null);
        break;
      case 27: // ESC key
        this.state.cancel.execute(null);
        break;
      default:
        break;
    }
  }

  private focusAndSelectControlText(component: Element) {
    const control = findDOMNode(component) as HTMLInputElement;

    if (control != null) {
      // focus the control
      if (control.focus != null) {
        control.focus();
      }

      // select the content of the control
      if (control.select != null) {
        control.select();
      }
    }
  }

  updateOn() {
    return [
      this.state.isEditing.changed,
      this.state.hasSavingError.changed,
      this.state.save.canExecuteObservable,
    ];
  }

  render() {
    return this.renderConditional(this.state.isEditing, () => this.renderEditor(), () => this.renderValue());
  }

  private renderErrorTooltip() {
    return (
      <Popover id='tooltip' className='InlineEditView-popover alert-danger'>
        <div className='InlineEditView-errorContent'>
          {
            this.renderConditional(this.props.errorContent instanceof Function, () => {
              return this.props.errorContent.apply(this, [ this.state, this ]);
            }, () => this.props.errorContent)
          }
        </div>
      </Popover>
    );
  }

  private renderEditor() {
    const { className, props, rest } = this.restProps(x => {
      const { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, clickToEdit, template, editTemplate, errorContent, errorPlacement } = x;
      return { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, clickToEdit, template, editTemplate, errorContent, errorPlacement };
    });

    return (
      <FormGroup { ...rest } className={ classNames('InlineEditView', className)}>
        <InputGroup>
          {
            this.renderConditional(this.state.hasSavingError, () => (
              <OverlayTrigger placement={ props.errorPlacement } overlay={ this.renderErrorTooltip() }>
                <InputGroup.Addon className='InlineEditView-error'>
                  <Icon className='alert-danger' name='exclamation' />
                </InputGroup.Addon>
              </OverlayTrigger>
            ))
          }
          { this.renderBindableInput() }
          <InputGroup.Button>
            <CommandButton bsSize={ this.props.bsSize } bsStyle='success' command={ this.state.save }>
              <Icon name='check' />
            </CommandButton>
            <CommandButton bsSize={ this.props.bsSize } bsStyle='danger' command={ this.state.cancel }>
              <Icon name='times' />
            </CommandButton>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

  private renderBindableInput() {
    const { props } = this.restProps(x => {
      const { converter, valueProperty, onChangeProperty, valueGetter, valueSetter } = x;
      return { converter, valueProperty, onChangeProperty, valueGetter, valueSetter };
    });

    const onKeyDown = this.props.keyboard === true ? (e: React.KeyboardEvent<any>) => this.handleKeyDown(e) : null;

    return (
      <BindableInput { ...props } property={ this.state.editValue } onKeyDown={ onKeyDown } disabled={ this.state.save.canExecute(null) === false } >
        {
          React.cloneElement(
            this.props.editTemplate(this.state.editValue(), this),
            { ref: x => this.focusAndSelectControlText(x) },
          )
        }
      </BindableInput>
    );
  }

  private renderValue() {
    const { className, props, rest } = this.restProps(x => {
      const { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, clickToEdit, template, editTemplate, errorContent, errorPlacement } = x;
      return { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, clickToEdit, template, editTemplate, errorContent, errorPlacement };
    });

    const displayContent = (
      <span>{ this.props.template(this.state.value(), this) }</span>
    );

    return this.renderConditional(
      props.clickToEdit === true,
      () => (
        <CommandButton { ...rest } className={ classNames('InlineEditView', className)} bsStyle='link' command={ this.state.edit }>
          { displayContent }
        </CommandButton>
      ),
      () => displayContent,
    );
  }
}
