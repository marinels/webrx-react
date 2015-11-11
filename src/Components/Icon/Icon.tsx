'use strict';

import * as React from 'react';
import { Glyphicon } from 'react-bootstrap';
import * as FontAwesomeIcon from 'react-fa';
import * as classNames from 'classnames';

import './Icon.less';

interface IIconProps {
  name?: string;
  fixedWidth?: boolean;
  hidden?: boolean;
  props?: any;
}

export class Icon extends React.Component<IIconProps, any> {
  public displayName = 'Icon';

  static defaultProps = {
    name: 'bs-NONE'
  }

  render() {
    let IconComponent: any;

    let iconClassNames: any = {
      'Icon': true,
      'Icon-hidden': this.props.hidden === true,
      'Icon-fixedWidth': this.props.fixedWidth === true
    };
    let props: any = {};

    if (this.props.name.indexOf('fa-') === 0) {
      IconComponent = FontAwesomeIcon;
      props['name'] = this.props.name.substring(3);
    } else if (this.props.name.indexOf('bs-') === 0) {
      IconComponent = Glyphicon;
      props['glyph'] = this.props.name.substring(3);
    } else {
      IconComponent = 'span';
    }

    return <IconComponent className={classNames(iconClassNames)} {...props} {...this.props.props} />;
  }
}

export default Icon;
