import * as React from 'react';
import { Image } from 'react-bootstrap';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';

import './ProfilePicture.less';

interface IProfilePictureProps extends React.HTMLProps<HTMLDivElement> {
  src: string;
  responsive?: boolean;
  rounded?: boolean;
  circle?: boolean;
  thumbnail?: boolean;
  defaultSrc?: string;
  defaultIcon?: string;
  iconSize?: string;
  block?: boolean;
}

const dataUriPrefix = 'data:image;base64,';

export class ProfilePicture extends React.Component<IProfilePictureProps, any> {
  public static displayName = 'ProfilePicture';

  static defaultProps = {
    defaultIcon: 'user',
    block: false,
  };

  render() {
    const { rest, props } = this.restProps(x => {
      const { src, responsive, rounded, circle, thumbnail, defaultSrc, defaultIcon, iconSize, block } = x;
      return { src, responsive, rounded, circle, thumbnail, defaultSrc, defaultIcon, iconSize, block };
    });

    let src = props.src || props.defaultSrc;

    if (String.isNullOrEmpty(src) === false && src.indexOf(dataUriPrefix) < 0) {
      src = `${dataUriPrefix}${src}`;
    }

    let image: JSX.Element = null;

    if (src == null) {
      image = <Icon className={classNames({'fa-border': props.thumbnail, 'fa-rounded': props.rounded})} name={props.defaultIcon} size={props.iconSize} />;
    }
    else {
      image = <Image src={src} responsive={props.responsive}
        rounded={props.rounded} circle={props.circle} thumbnail={props.thumbnail} />;
    }

    let blockStyle = Object.assign({
      width: rest.width,
      height: rest.height,
      display: props.block ? 'block' : 'inline-block',
    }, this.props.style);

    return (
      <div className='ProfilePicture' {...rest} style={blockStyle}>
        {image}
      </div>
    );
  }
}
