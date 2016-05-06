/// <reference path="../../../typings/main/ambient/react/index.d.ts" />

declare namespace __ReactFA {
  export interface IconProps extends __React.HTMLAttributes {
    // we need to override the HTMLAttributes size type
    size?: any;

    rotate?: string;
    flip?: string;
    fixedWidth?: boolean;
    spin?: boolean;
    pulse?: boolean;
    stack?: string;
    inverse?: boolean;
    Component?: any;
  }
  export class Icon extends __React.Component<IconProps, any> { }

  export interface IconStackProps extends __React.HTMLAttributes {
    // we need to override the HTMLAttributes size type
    size?: any;
  }
  export class IconStack extends __React.Component<IconStackProps, any> { }
}

import ReactFAExports = __ReactFA;

declare module 'react-fa' {
  export import Icon = ReactFAExports.Icon;
  export import IconProps = ReactFAExports.IconProps;
  export import IconStack = ReactFAExports.IconStack;
  export import IconStackProps = ReactFAExports.IconStackProps;
  export default ReactFAExports.Icon;
}
