import * as React from 'react';
import { FormControl, FormGroup, InputGroup, Sizes } from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import { Icon } from 'react-fa';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { BindableInput, BindableProps } from '../BindableInput/BindableInput';
import { CommandButton } from '../CommandButton/CommandButton';
import {
  ContentTooltip,
  TooltipPlacement,
} from '../ContentTooltip/ContentTooltip';
import { InlineEditViewModel } from './InlineEditViewModel';

export interface InlineEditProps extends BindableProps {
  controlId?: string;
  inputType?: string;
  placeholder?: string;
  keyboard?: boolean;
  clickToEdit?: boolean;
  bsSize?: Sizes;
  template?: (value: any, view: InlineEditView) => any;
  editTemplate?: (value: any, view: InlineEditView) => any;
  errorContent?:
    | any
    | ((
        viewModel: Readonly<InlineEditViewModel<{}>>,
        view: InlineEditView,
      ) => any);
  errorPlacement?: TooltipPlacement;
}

export interface InlineEditViewProps
  extends BaseViewProps<InlineEditViewModel<{}>>,
    InlineEditProps {}

export class InlineEditView extends BaseView<
  InlineEditViewProps,
  InlineEditViewModel<{}>
> {
  public static displayName = 'InlineEditView';

  static defaultProps: Partial<InlineEditProps> = {
    inputType: 'text',
    placeholder: 'Enter New Value...',
    template: (x: any, view: InlineEditView) => x.toString(),
    editTemplate: (x: any, view: InlineEditView) => (
      <FormControl
        type={view.props.inputType}
        placeholder={view.props.placeholder}
      />
    ),
    errorContent: (
      <div>
        <div>
          <strong>Sorry, your change was not saved.</strong>
        </div>
        <div>Please try again.</div>
      </div>
    ),
    errorPlacement: 'right',
  };

  private handleKeyDown(e: React.KeyboardEvent<any>) {
    switch (e.keyCode) {
      case 13: // ENTER key
        this.viewModel.save.execute(null);
        break;
      case 27: // ESC key
        this.viewModel.cancel.execute(null);
        break;
      default:
        break;
    }
  }

  private focusAndSelectControlText(component: Element | null) {
    if (component == null) {
      return;
    }

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

  updateOn(viewModel: Readonly<InlineEditViewModel<{}>>) {
    return [
      viewModel.isEditing.changed,
      viewModel.hasSavingError.changed,
      viewModel.save.canExecuteObservable,
    ];
  }

  render() {
    return this.wxr.renderConditional(
      this.viewModel.isEditing,
      () => this.renderEditor(),
      () => this.renderValue(),
    );
  }

  private renderErrorTooltip() {
    return (
      <div className="InlineEditView-errorContent">
        {this.wxr.renderConditional(
          this.props.errorContent instanceof Function,
          () => {
            return this.props.errorContent(this.viewModel, this);
          },
          () => this.props.errorContent,
        )}
      </div>
    );
  }

  private renderEditor() {
    const { className, props, rest } = this.restProps(x => {
      const {
        controlId,
        inputType,
        placeholder,
        converter,
        valueProperty,
        onChangeProperty,
        valueGetter,
        valueSetter,
        keyboard,
        clickToEdit,
        template,
        editTemplate,
        errorContent,
        errorPlacement,
      } = x;
      return {
        controlId,
        inputType,
        placeholder,
        converter,
        valueProperty,
        onChangeProperty,
        valueGetter,
        valueSetter,
        keyboard,
        clickToEdit,
        template,
        editTemplate,
        errorContent,
        errorPlacement,
      };
    });

    return (
      <FormGroup
        {...rest}
        className={this.wxr.classNames('InlineEditView', className)}
      >
        <InputGroup>
          {this.wxr.renderConditional(this.viewModel.hasSavingError, () => (
            <ContentTooltip
              id={`${props.controlId || 'inlineedit'}-tt`}
              className="InlineEditView-popover alert-danger"
              placement={props.errorPlacement}
              popover
              content={this.renderErrorTooltip()}
            >
              <InputGroup.Addon className="InlineEditView-error">
                <Icon className="alert-danger" name="exclamation" />
              </InputGroup.Addon>
            </ContentTooltip>
          ))}
          {this.renderBindableInput()}
          <InputGroup.Button>
            <CommandButton
              bsSize={this.props.bsSize}
              bsStyle="success"
              command={this.viewModel.save}
            >
              <Icon name="check" />
            </CommandButton>
            <CommandButton
              bsSize={this.props.bsSize}
              bsStyle="danger"
              command={this.viewModel.cancel}
            >
              <Icon name="times" />
            </CommandButton>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    );
  }

  private renderBindableInput() {
    const { props } = this.restProps(x => {
      const {
        converter,
        valueProperty,
        onChangeProperty,
        valueGetter,
        valueSetter,
      } = x;
      return {
        converter,
        valueProperty,
        onChangeProperty,
        valueGetter,
        valueSetter,
      };
    });

    const onKeyDown =
      this.props.keyboard === true
        ? (e: React.KeyboardEvent<any>) => this.handleKeyDown(e)
        : undefined;

    return (
      <BindableInput
        {...props}
        boundProperty={this.viewModel.editValue}
        onKeyDown={onKeyDown}
        disabled={this.viewModel.save.canExecute === false}
      >
        {React.cloneElement(
          this.props.editTemplate!(this.viewModel.editValue.value, this),
          {
            ref: (x: Element | null) => this.focusAndSelectControlText(x),
          },
        )}
      </BindableInput>
    );
  }

  private renderValue() {
    const { className, props, rest } = this.restProps(x => {
      const {
        controlId,
        inputType,
        placeholder,
        converter,
        valueProperty,
        onChangeProperty,
        valueGetter,
        valueSetter,
        keyboard,
        clickToEdit,
        template,
        editTemplate,
        errorContent,
        errorPlacement,
      } = x;
      return {
        controlId,
        inputType,
        placeholder,
        converter,
        valueProperty,
        onChangeProperty,
        valueGetter,
        valueSetter,
        keyboard,
        clickToEdit,
        template,
        editTemplate,
        errorContent,
        errorPlacement,
      };
    });

    const displayContent = (
      <span>{this.props.template!(this.viewModel.value.value, this)}</span>
    );

    return this.wxr.renderConditional(
      props.clickToEdit === true,
      () => (
        <CommandButton
          {...rest}
          className={this.wxr.classNames('InlineEditView', className)}
          bsStyle="link"
          command={this.viewModel.edit}
        >
          {displayContent}
        </CommandButton>
      ),
      () => displayContent,
    );
  }
}
