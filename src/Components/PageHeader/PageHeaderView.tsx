'use strict';

import * as Rx from 'rx';

import * as React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import { Navbar, NavBrand, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Glyphicon } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import { PageHeaderViewModel } from './PageHeaderViewModel';

import './PageHeader.less';

interface IPageHeaderProps extends IBaseViewProps {
  brand?: string;
}

export class PageHeaderView extends BaseView<IPageHeaderProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';
  
  render() {
    let menuItems = this.state.menuItems.map(x => {
      let icon = x.glyph == null ? null : <Glyphicon glyph={x.glyph} />;
      return (
        <MenuItem key={x.uri} eventKey={x.uri}>
          <span className='MenuItem-text'>{icon}{x.title}</span>
        </MenuItem>
      );
    });

    let onSelect = this.bindEvent<any, any>(x => x.menuItemSelected, (e, args) => args[0] as string);

    return (
      <div className='PageHeader'>
        <Grid>
            <Row>
                <Col md={12}>
                    {/*
                      VERY IMPORTANT!!!
                      Because this Navbar component sits inside of a Grid, we need to
                      decorate it with `fluid` so that the internal `div.container`
                      stretches to full `width = 100%` to avoid pushing the gutters out.
                    */}
                    <Navbar fluid>
                        <NavBrand>
                            <a href='#/'>{this.props.brand || 'WebRx.React Rocks!!!'}</a>
                        </NavBrand>
                        <Nav right>
                          <NavDropdown id='PageHeaderMenu' onSelect={onSelect} title={<span className='Menu-title'><Glyphicon glyph='cog' />Menu</span>}>
                            {menuItems}
                          </NavDropdown>
                        </Nav>
                    </Navbar>
                </Col>
            </Row>
        </Grid>
    </div>
    );
  }
}

export default PageHeaderView;
