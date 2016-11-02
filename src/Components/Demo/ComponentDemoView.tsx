import * as React from 'react';
import { Enumerable } from 'ix';
import { Grid, Row, Col, PageHeader, DropdownButton, MenuItem, Alert } from 'react-bootstrap';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../React/BaseView';
import { ComponentDemoViewModel } from './ComponentDemoViewModel';
import { Default as ViewMap } from './ViewMap';

import './ComponentDemo.less';

export interface ComponentDemoProps extends BaseViewProps {
}

export class ComponentDemoView extends BaseView<ComponentDemoProps, ComponentDemoViewModel> {
  public static displayName = 'ComponentDemoView';

  updateOn() {
    return [
      this.state.columns.changed,
      this.state.component.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps();

    const cols = this.state.columns();

    return (
      <div { ...rest } className={ classNames('ComponentDemo', className) }>
        <Grid fluid={ cols === 0 }>
          <Row>
            <Col md={ 12 }>
              { this.renderHeader() }
            </Col>
          </Row>
          <Row>
            <Col md={ cols === 0 ? 12 : cols }>
              <div className='ComponentDemo-view'>
                { this.renderComponentView() }
              </div>
            </Col>
          </Row>
        </Grid>
        <Grid className='ComponentDemo-footer'>
          <Row>
            <Col md={ 12 }>
              { this.renderDropdown(cols) }
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

  private getComponentName() {
    return this.state.component() == null ?
      'Invalid Component' :
      Object.getName(this.state.component());
  }

  private renderHeader() {
    return (
      <PageHeader>
        <span>{ `${ this.getComponentName() } Demo` }</span>
      </PageHeader>
    );
  }

  private renderComponentView() {
    let view: any;
    const componentName = this.getComponentName();
    const component = this.state.component();

    if (component != null) {
      this.logger.debug(`Loading View for "${ componentName }"...`);

      const activator = ViewMap[componentName];

      if (activator != null) {
        view = activator(component, this.state.componentRoute());
      }
    }

    if (view == null) {
      view = (
        <Alert bsStyle='danger'>
          { component == null ? `No Component for ${ this.state.componentRoute() }` : `No View Mapped for ${ componentName }`}
        </Alert>
      );
    }
    else {
      this.logger.debug(`Rendering View...`, view);
    }

    return view;
  }

  private renderDropdown(cols: number) {
    return (
      <DropdownButton id='col-width' bsStyle='info'
        title={ `Column Width (${ cols === 0 ? 'Full Width' : cols })` }
        onSelect={ this.bindEventToProperty(x => x.columns) }
      >
        {
          Enumerable
            .range(1, 13)
            .reverse()
            .map(x => x % 13)
            .map(x => (
              <MenuItem key={ x } eventKey={ x } active={ cols === x }>{ x === 0 ? 'Full Width' : x }</MenuItem>
            ))
            .toArray()
        }
      </DropdownButton>
    );
  }
}
