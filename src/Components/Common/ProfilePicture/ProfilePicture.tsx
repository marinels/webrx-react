import * as React from 'react';
import { Image } from 'react-bootstrap';
import { Icon, IconSize } from 'react-fa';

export interface ProfilePictureProps {
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

export interface ProfilePictureComponentProps
  extends React.HTMLProps<any>,
    ProfilePictureProps {}

const dataUriPrefix = 'data:image;base64,';

export class ProfilePicture extends React.Component<
  ProfilePictureComponentProps
> {
  public static displayName = 'ProfilePicture';

  static defaultProps: Partial<ProfilePictureProps> = {
    size: 65,
    responsive: false,
    rounded: false,
    circle: false,
    thumbnail: false,
    defaultIcon: 'user',
    iconSize: '4x',
  };

  private getImageSource() {
    const src = this.props.src || this.props.defaultSrc;

    if (String.isNullOrEmpty(src)) {
      return src;
    }

    // check if the source uri is already formatted
    if (src.indexOf(dataUriPrefix) >= 0 || /^https?:/.test(src)) {
      return src;
    }

    // otherwise assume we need to format a data uri
    return `${dataUriPrefix}${src}`;
  }

  render() {
    const imageSource = this.getImageSource();

    return (imageSource && this.renderImage(imageSource)) || this.renderIcon();
  }

  private renderIcon() {
    const { className, props, rest } = this.restProps(x => {
      const {
        src,
        size,
        responsive,
        rounded,
        circle,
        thumbnail,
        defaultSrc,
        defaultIcon,
        iconSize,
        style,
      } = x;
      return {
        src,
        size,
        responsive,
        rounded,
        circle,
        thumbnail,
        defaultSrc,
        defaultIcon,
        iconSize,
        style,
      };
    });

    const iconClassNames = {
      'ProfilePicture-iconThumbnail': props.thumbnail,
      'ProfilePicture-iconRounded': props.rounded,
    };

    const iconStyle = Object.assign({}, props.style, {
      width: props.size,
      height: props.size,
      lineHeight: `${props.size}px`,
    });

    return (
      <div
        {...rest}
        style={iconStyle}
        className={this.wxr.classNames(
          'ProfilePicture',
          'ProfilePicture-icon',
          iconClassNames,
          className,
        )}
      >
        <Icon name={props.defaultIcon!} size={props.iconSize} />
      </div>
    );
  }

  private renderImage(imageSource: string) {
    const { className, props, rest } = this.restProps(x => {
      const {
        src,
        size,
        responsive,
        rounded,
        circle,
        thumbnail,
        defaultSrc,
        defaultIcon,
        iconSize,
        style,
      } = x;
      return {
        src,
        size,
        responsive,
        rounded,
        circle,
        thumbnail,
        defaultSrc,
        defaultIcon,
        iconSize,
        style,
      };
    });

    const responsiveStyle = Object.assign({}, props.style, {
      width: this.props.responsive === true ? 'auto' : props.size,
      height: this.props.responsive === true ? '100%' : props.size,
      lineHeight: this.props.responsive === true ? null : `${props.size}px`,
    });

    const imageProps = {
      src: imageSource,
      responsive: props.responsive,
      rounded: props.rounded,
      circle: props.circle,
      thumbnail: props.thumbnail,
    };

    const imageStyle = this.props.responsive
      ? undefined
      : { maxHeight: props.size, maxWidth: props.size };

    return (
      <div
        {...rest}
        className={this.wxr.classNames(
          'ProfilePicture',
          'ProfilePicture-image',
          className,
        )}
        style={responsiveStyle}
      >
        <Image {...imageProps} style={imageStyle} />
      </div>
    );
  }
}
