'use strict';

import * as Ix from 'ix';
import * as React from 'react';

import { Grid, Row, Col, PageHeader, Panel, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import ComponentDemoViewModel from './ComponentDemoViewModel';
import { default as ViewMap, IViewActivator } from './ViewMap';

import './ComponentDemo.less';

interface IComponentDemoProps extends IBaseViewProps {
}

export class ComponentDemoView extends BaseView<IComponentDemoProps, ComponentDemoViewModel> {
  public static displayName = 'ComponentDemoView';

  private getComponentName(component: { getDisplayName(): string }) {
    if (component == null) {
      return 'Invalid Component';
    }

    return component.getDisplayName == null ? component.toString() : component.getDisplayName();
  }

  private getView(component: any) {
    let activator: IViewActivator = null;

    if (component != null) {
      let type = this.getComponentName(component);
      this.logger.debug('Loading View for "{0}"', type);
      activator = ViewMap[type];
    }

    return activator == null ? null : activator(component, this.state.componentRoute);
  }

  updateOn() {
    return [
      this.state.columns.changed,
      this.state.component.changed
    ];
  }

  render() {
    let component = this.state.component();
    let view = this.getView(component);

    let componentName = this.getComponentName(component);
    let viewName = view == null ? 'No View Found' : `${Object.getName(view.type)} Demo`;

    let cols = this.state.columns();
    let widthVal = cols === 0 ? 12 : cols;
    let widthName = cols === 0 ? 'Full Width' : widthVal;

    return (
      <div className='ComponentDemo'>
        <Grid fluid={cols === 0}>
          <Row>
            <Col md={12}>
              <PageHeader style={({textAlign: 'center'})}>
                {viewName}
              </PageHeader>
            </Col>
          </Row>
          <Row>
            <Col md={widthVal}>
              <Panel className='ComponentDemo-view' header={componentName} bsStyle='primary'>
                {view}
              </Panel>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className='pull-right'>
                <DropdownButton id='col-width' bsStyle='info' title={`Column Width (${widthName})`}
                  onSelect={this.bindCallback(x => x.columns, (e, x) => x[0])}>
                  {
                    Ix.Enumerable
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

export default ComponentDemoView;
