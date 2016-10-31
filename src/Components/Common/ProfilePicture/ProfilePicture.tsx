import * as React from 'react';
import { Image } from 'react-bootstrap';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';

import './ProfilePicture.less';

export interface ProfilePictureProps extends React.HTMLProps<HTMLDivElement> {
  src: string;
  size?: number;
  responsive?: boolean;
  rounded?: boolean;
  circle?: boolean;
  thumbnail?: boolean;
  block?: boolean;
  defaultSrc?: string;
  defaultIcon?: string;
  iconSize?: string;
}

const dataUriPrefix = 'data:image;base64,';

export class ProfilePicture extends React.Component<ProfilePictureProps, any> {
  public static displayName = 'ProfilePicture';

  static defaultProps = {
    size: 65,
    responsive: false,
    rounded: false,
    circle: false,
    thumbnail: false,
    defaultIcon: 'user',
    iconSize: '4x',
  };

  render() {
    const { rest, props } = this.restProps(x => {
      const { src, size, responsive, rounded, circle, thumbnail, defaultSrc, defaultIcon, iconSize, block } = x;
      return { src, size, responsive, rounded, circle, thumbnail, defaultSrc, defaultIcon, iconSize, block };
    }, 'classNames', 'style');

    let src = props.src || props.defaultSrc;

    // if we're using a src URI, ensure it contains a data URI prefix
    if (String.isNullOrEmpty(src) === false && src.indexOf(dataUriPrefix) < 0) {
      src = `${dataUriPrefix}${src}`;
    }

    let image: any = null;

    if (src == null) {
      const iconClassNames = classNames(
        this.props.className,
        'ProfilePicture',
        'ProfilePicture-icon',
        { 'ProfilePicture-iconThumbnail': props.thumbnail, 'ProfilePicture-iconRounded': props.rounded }
      );
      const blockStyle = Object.assign({  }, this.props.style, {
        width: props.size,
        height: props.size,
      });

      image = (
        <div { ...rest } className={ iconClassNames } style={ blockStyle }>
          <Icon name={ props.defaultIcon } size={ props.iconSize } />
        </div>
      );
    }
    else {
      const imageClassNames = classNames(this.props.className, 'ProfilePicture');
      const imageStyle = Object.assign({
        width: props.responsive === true ? null : props.size,
        height: props.responsive === true ? null : props.size,
      }, this.props.style);

      image = (
        <Image { ...rest } className={ imageClassNames } style={ imageStyle } src={ src } width={ props.size } height={ props.size }
          responsive={ props.responsive } rounded={ props.rounded } circle={ props.circle } thumbnail={ props.thumbnail } />
      );
    }

    return image;
  }
}
