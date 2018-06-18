import { Iterable } from 'ix';
import * as React from 'react';
import { Alert, Col, DropdownButton, Grid, MenuItem, PageHeader, Row } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../React';
import { ComponentDemoViewModel } from './ComponentDemoViewModel';

import './ComponentDemo.less';

export type ViewActivator = (
  component: any,
  componentRoute: string | undefined,
  responsive: boolean | undefined,
) => any;

export interface ViewActivatorMap {
  [key: string]: ViewActivator;
}

export interface ComponentDemoProps {
  viewMap: ViewActivatorMap;
  responsive?: boolean;
}

export interface ComponentDemoViewProps extends BaseViewProps<ComponentDemoViewModel>, ComponentDemoProps {
}

export class ComponentDemoView extends BaseView<ComponentDemoViewProps, ComponentDemoViewModel> {
  public static displayName = 'ComponentDemoView';

  updateOn(viewModel: Readonly<ComponentDemoViewModel>) {
    return [
      viewModel.columns.changed,
      viewModel.component.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { viewMap, responsive } = x;
      return { viewMap, responsive };
    });

    const cols = this.viewModel.columns.value;

    return (
      <div { ...rest } className={ this.wxr.classNames('ComponentDemo', className) }>
        <Grid fluid={ cols === 0 }>
          <Row>
            <Col md={ 12 }>
              { this.renderHeader() }
            </Col>
          </Row>
          <Row>
            {
              this.wxr.renderConditional(
                this.viewModel.componentRoute.value === 'help',
                () => this.renderComponentView(),
                () => (
                  <Col md={ cols === 0 ? 12 : cols }>
                    <div className='ComponentDemo-view'>
                      { this.renderComponentView() }
                    </div>
                  </Col>
                ),
              )
            }
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
    return this.viewModel.component.value == null ?
      'Invalid Component' :
      Object.getName(this.viewModel.component.value);
  }

  private renderHeader() {
    return this.wxr.renderConditional(
      this.viewModel.componentRoute.value !== 'help',
      () => (
        <PageHeader>
          <span>{ `${ this.getComponentName() } Demo` }</span>
        </PageHeader>
      ),
    );
  }

  private renderComponentView() {
    let view: any;
    const componentName = this.getComponentName();
    const component = this.viewModel.component.value;

    if (component != null) {
      this.logger.debug(`Loading View for "${ componentName }"...`);

      const activator = this.props.viewMap[componentName];

      if (activator != null) {
        view = activator(component, this.viewModel.componentRoute.value, this.props.responsive);
      }
    }

    if (view == null) {
      view = (
        <Alert bsStyle='danger'>
          {
            component == null ?
              `No Component for ${ this.viewModel.componentRoute.value }` :
              `No View Mapped for ${ componentName }`
          }
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
      <DropdownButton
        id='col-width'
        bsStyle='info'
        title={ `Column Width (${ cols === 0 ? 'Full Width' : cols })` }
        onSelect={ this.bindEventToCommand(x => x.setColumns) }
      >
        {
          Iterable
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
