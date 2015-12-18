'use strict';

import * as Ix from 'ix';
import * as React from 'react';

import { Grid, Row, Col, PageHeader, Panel, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import ComponentDemoViewModel from './ComponentDemoViewModel'
import BaseViewModel from '../React/BaseViewModel';
import { default as ViewMap, IViewActivator } from './ViewMap';

interface IComponentDemoProps extends IBaseViewProps {
}

export class ComponentDemoView extends BaseView<IComponentDemoProps, ComponentDemoViewModel> {
  public static displayName = 'ComponentDemoView';

  private getView(viewModel: BaseViewModel) {
    let activator: IViewActivator = null;

    if (viewModel != null) {
      let type = viewModel.getDisplayName();
      this.logger.debug('Loading View for "{0}"', type);
      activator = ViewMap[type];
    }

    return activator == null ? null : activator(viewModel);
  }

  updateOn() {
    return [
      this.state.columns.changed,
      this.state.component.changed
    ]
  }

  render() {
    let viewModel = this.state.component();
    let view = this.getView(viewModel);

    let viewModelName = viewModel == null ? 'Invalid Component' : String.format('{0} Demo', viewModel.getDisplayName());
    let viewName = view == null ? 'No View Found' : String.format('{0} Demo', Object.getName(view.type));

    return (
      <div className='ComponentDemo'>
        <Grid>
          <Row>
            <Col md={12}>
              <PageHeader style={({textAlign: 'center'})}>
                {viewName}
              </PageHeader>
            </Col>
          </Row>
          <Row>
            <Col md={this.state.columns()}>
              <Panel header={viewModelName} bsStyle='primary'>
                {view}
              </Panel>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className='pull-right'>
                <DropdownButton id='col-width' bsStyle='info' title='Column Width'
                  onSelect={this.bindCallback(x => x.columns, x => x[1])}>
                  {
                    Ix.Enumerable
                      .range(1, 12)
                      .reverse()
                      .select(x =>
                        <MenuItem key={x} eventKey={x} active={this.state.columns() === x}>{x}</MenuItem>
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
