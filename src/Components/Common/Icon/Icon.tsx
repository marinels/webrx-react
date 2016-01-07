'use strict';

import * as React from 'react';
import * as classNames from 'classnames';

import './Icon.less';

interface IIconProps {
  key?: string | number;
  name?: string;
  className?: string;
  size?: string;
  rotate?: number;
  flip?: string;
  fixedWidth?: boolean;
  spin?: boolean;
  pulse?: boolean;
  stack?: string;
  inverse?: boolean;
  Component?: string;
  hidden?: boolean;
}

export class Icon extends React.Component<IIconProps, any> {
  public displayName = 'Icon';

  static defaultProps = {
    name: 'fa-picture-o'
  }

  render() {
    let IconComponent: any;

    let iconClassNames: any = {
      'Icon': true,
      'Icon-hidden': this.props.hidden === true
    };
    let props: any = null;

    if (this.props.name.indexOf('fa-') === 0) {
      IconComponent = require('react-fa');
      props = Object.assign({}, this.props);
      props.name = props.name.substring(3);
    } else if (this.props.name.indexOf('bs-') === 0) {
      IconComponent = require<any>('react-bootstrap').Glyphicon;
      props = {
        glyph: this.props.name.substring(3)
      }
      iconClassNames.fixedWidth = this.props.fixedWidth;
    } else {
      IconComponent = 'img';
      props = {
        src: 'http://placeholdit.imgix.net/~text?txtsize=12&txt=Icon&w=18&h=18&txttrack=0&txtpad=1',
        title: this.props.name,
        alt: this.props.name
      }
    }

    return <IconComponent className={classNames(iconClassNames)} {...props} />;
  }
}

export default Icon;
