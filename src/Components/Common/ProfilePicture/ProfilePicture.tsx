import * as React from 'react';
import { Image } from 'react-bootstrap';
import { Icon, IconSize } from 'react-fa';

import { wxr } from '../../React';

export interface ProfilePictureProps extends React.HTMLAttributes<ProfilePicture> {
  src?: string;
  size?: number;
  responsive?: boolean;
  rounded?: boolean;
  circle?: boolean;
  thumbnail?: boolean;
  defaultSrc?: string;
  defaultIcon?: string;
  iconSize?: IconSize;
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

  private getImageSource() {
    let src = this.props.src || this.props.defaultSrc;

    // if we're using a src URI, ensure it contains a data URI prefix
    if (!String.isNullOrEmpty(src) && src.indexOf(dataUriPrefix) < 0) {
      src = `${ dataUriPrefix }${ src }`;
    }

    return src;
  }

  render() {
    return wxr.renderNullable(
      this.getImageSource(),
      x => this.renderImage(x),
      () => this.renderIcon(),
    );
  }

  private renderIcon() {
    const { className, props, rest } = this.restProps(x => {
      const { src, size, responsive, rounded, circle, thumbnail, defaultSrc, defaultIcon, iconSize, style } = x;
      return { src, size, responsive, rounded, circle, thumbnail, defaultSrc, defaultIcon, iconSize, style };
    });

    const iconClassNames = {
      'ProfilePicture-iconThumbnail': props.thumbnail,
      'ProfilePicture-iconRounded': props.rounded,
    };

    const iconStyle = Object.assign({}, props.style, {
      width: props.size,
      height: props.size,
      lineHeight: `${ props.size }px`,
    });

    return (
      <div { ...rest } className={ wxr.classNames('ProfilePicture', 'ProfilePicture-icon', iconClassNames, className) } style={ iconStyle }>
        <Icon name={ props.defaultIcon! } size={ props.iconSize } />
      </div>
    );
  }

  private renderImage(src: string) {
    const { className, props, rest } = this.restProps(x => {
      const { size, defaultSrc, defaultIcon, iconSize, style } = x;
      return { size, defaultSrc, defaultIcon, iconSize, style };
    });

    const imageStyle = Object.assign({}, props.style, {
      width: this.props.responsive === true ? null : props.size,
      height: this.props.responsive === true ? null : props.size,
    });

    return (
      <Image { ...rest } className={ wxr.classNames('ProfilePicture', className) } style={ imageStyle }
        src={ src } width={ props.size } height={ props.size }
      />
    );
  }
}
