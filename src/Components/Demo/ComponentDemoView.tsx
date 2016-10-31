import * as React from 'react';
import { Enumerable } from 'ix';
import { Grid, Row, Col, PageHeader, DropdownButton, MenuItem, Alert } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../React/BaseView';
import { ComponentDemoViewModel } from './ComponentDemoViewModel';
import { Default as ViewMap, ViewActivator } from './ViewMap';

import './ComponentDemo.less';

export interface ComponentDemoProps extends BaseViewProps {
}

export class ComponentDemoView extends BaseView<ComponentDemoProps, ComponentDemoViewModel> {
  public static displayName = 'ComponentDemoView';

  private getComponentName(component: { getDisplayName(): string, displayName: string }) {
    if (component == null) {
      return 'Invalid Component';
    }

    return (component.getDisplayName instanceof Function) ?
      component.getDisplayName() :
      (component.displayName || component.toString());
  }

  private getView(component: any) {
    let activator: ViewActivator = null;

    if (component != null) {
      let type = this.getComponentName(component);
      this.logger.debug(`Loading View for "${type}"...`);
      activator = ViewMap[type];
    }

    return activator == null ? null : activator(component, this.state.componentRoute);
  }

  updateOn() {
    return [
      this.state.columns.changed,
      this.state.component.changed,
    ];
  }

  render() {
    let component = this.state.component();
    let view = this.getView(component);

    let componentName = this.getComponentName(component);

    let cols = view == null ? 12 : this.state.columns();
    let widthVal = cols === 0 ? 12 : cols;
    let widthName = cols === 0 ? 'Full Width' : widthVal;

    if (view == null) {
      view = (
        <Alert bsStyle='danger'>{component == null ? 'No Component for This Route' : `No View Mapped for ${componentName}`}</Alert>
      );
    }
    else {
      this.logger.debug(`Rendering View...`, view);
    }

    return (
      <div className='ComponentDemo'>
        <Grid fluid={cols === 0}>
          <Row>
            <Col md={12}>
              <PageHeader>
                <span>{componentName} Demo</span>
              </PageHeader>
            </Col>
          </Row>
          <Row>
            <Col md={widthVal}>
              <div className='ComponentDemo-view'>
                {view}
              </div>
            </Col>
          </Row>
        </Grid>
        <Grid className='ComponentDemo-footer'>
          <Row>
            <Col md={12}>
              <div className='pull-right'>
                <DropdownButton id='col-width' bsStyle='info' title={`Column Width (${widthName})`}
                  onSelect={this.bindEventToProperty(x => x.columns)}>
                  {
                    Enumerable
                      .range(1, 13)
                      .reverse()
                      .select(x => x % 13)
                      .select(x =>
                        <MenuItem key={x} eventKey={x} active={cols === x}>{x === 0 ? 'Full Width' : x}</MenuItem>
                      )
                      .toArray()
                  }
                </DropdownButton>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
