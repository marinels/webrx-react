///<reference path="../react/react.d.ts"/>

declare module 'react-fa' {
  interface IconProps {
    name: string;
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
    style?: React.CSSProperties;
  }

  interface Icon extends React.ReactElement<IconProps> { }
  interface IconClass extends React.ComponentClass<IconProps> { }
  var Icon: IconClass;

  export = Icon;
}
