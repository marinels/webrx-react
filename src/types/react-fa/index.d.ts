import { Component, ComponentClass, HTMLProps } from 'react';

export = ReactFA;

declare namespace ReactFA {
  type IconSize = 'lg' | '2x' | '3x' | '4x' | '5x';

  interface IconProps extends HTMLProps<Icon> {
      name: string;
      // we need to override the HTMLProps size typing
      size?: IconSize | any;
      spin?: boolean;
      rotate?: string;
      flip?: string;
      fixedWidth?: boolean;
      pulse?: boolean;
      stack?: string;
      inverse?: boolean;
      Component?: string | Function;
  }

  type Icon = Component<IconProps, any>;
  let Icon: ComponentClass<IconProps>;

  interface IconStackProps extends HTMLProps<Icon> {
    // we need to override the HTMLProps size typing
    size?: IconSize | any;
    children: IconProps[];
  }

  type IconStack = Component<IconStackProps, any>;
  let IconStack: ComponentClass<IconStackProps>;
}
