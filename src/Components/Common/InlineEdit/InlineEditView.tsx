import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';
import { FormGroup, InputGroup, FormControl, Sizes } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { BindableInput } from '../BindableInput/BindableInput';
import { CommandButton } from '../CommandButton/CommandButton';
import { InlineEditViewModel } from './InlineEditViewModel';

import './InlineEdit.less';

interface InlineEditProps<T> extends BaseViewProps {
  controlId?: string;
  inputType?: string;
  placeholder?: string;
  converter?: (x: any) => any;
  valueProperty?: string;
  onChangeProperty?: string;
  valueGetter?: (property: any) => any;
  valueSetter?: (property: any, value: any) => void;
  keyboard?: boolean;
  bsSize?: Sizes;
  template?: (x: T, view: InlineEditView) => any;
  editTemplate?: (x: T, view: InlineEditView) => any;
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

  private focusAndSelectControlText() {
    const control = ReactDOM.findDOMNode(this.refs['control']) as HTMLInputElement;

    if (control != null) {
      control.focus();

      if (control.select != null) {
        control.select();
      }
    }
  }

  updateOn() {
    return [
      this.state.isEditing.changed,
      this.state.save.canExecuteObservable,
    ];
  }

  updated(prevProps: InlineEditProps<any>) {
    super.updated(prevProps);

    this.focusAndSelectControlText();
  }

  render() {
    return this.renderConditional(this.state.isEditing, () => this.renderEditor(), () => this.renderValue());
  }

  private renderEditor() {
    const { className, rest } = this.restProps(x => {
      const { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, template, editTemplate } = x;
      return { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, template, editTemplate };
    });

    return (
      <FormGroup { ...rest } className={ classNames('InlineEditView', className)}>
        <InputGroup>
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
            { ref: 'control' }
          )
        }
      </BindableInput>
    );
  }

  private renderValue() {
    const { className, rest } = this.restProps(x => {
      const { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, template, editTemplate } = x;
      return { controlId, inputType, placeholder, converter, valueProperty, onChangeProperty, valueGetter, valueSetter, keyboard, template, editTemplate };
    });

    return (
      <CommandButton { ...rest } className={ classNames('InlineEditView', className)} bsStyle='link' command={ this.state.edit }>
        <span>{ this.props.template(this.state.value(), this) }</span>
      </CommandButton>
    );
  }
}
