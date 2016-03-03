'use strict';

import * as React from 'react';
import { Image, ImageProps } from 'react-bootstrap';
import * as Icon from 'react-fa';
import * as classNames from 'classnames';

import './ProfilePicture.less';

interface IProfilePictureProps extends ImageProps {
  defaultSrc?: string;
  defaultIcon?: string;
  iconSize?: string;
  block?: boolean;
}

const dataUriPrefix = 'data:image;base64,';

export class ProfilePictureView extends React.Component<IProfilePictureProps, any> {
  public static displayName = 'ProfilePictureView';

  static defaultProps = {
    defaultIcon: 'user',
    block: false,
  };

  render() {
    let src = this.props.src || this.props.defaultSrc;

    if (String.isNullOrEmpty(src) === false && src.indexOf(dataUriPrefix) < 0) {
      src = `${dataUriPrefix}${src}`;
    }

    let image: JSX.Element = null;

    if (src == null) {
      let iconStyle = {
        'borderRadius': this.props.rounded ? '4px' : '0',
      };

      image = <Icon className={classNames({'fa-border': this.props.thumbnail})} style={iconStyle} name={this.props.defaultIcon} size={this.props.iconSize} />;
    } else {
      image = <Image src={src} responsive={this.props.responsive}
        rounded={this.props.rounded} circle={this.props.circle} thumbnail={this.props.thumbnail} />;
    }

    let blockStyle = Object.assign({
      width: this.props.width,
      height: this.props.height,
      display: this.props.block ? 'block' : 'inline-block',
    }, this.props.style);

    return (
      <div className='ProfilePicture' style={blockStyle} title={this.props.title}>
        {image}
      </div>
    );
  }
}

export default ProfilePictureView;
