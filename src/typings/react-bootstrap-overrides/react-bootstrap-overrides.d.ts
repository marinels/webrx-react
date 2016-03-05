declare module 'react-bootstrap' {
  interface ITitleProp {
    // title renders as a tooltip
    title?: string;
  }

  interface InputProps extends ITitleProp {
    // If you don't want the form-group class applied apply the prop named standalone
    // see: https://react-bootstrap.github.io/components.html#forms
    standalone?: boolean;
  }

  interface LabelProps extends ITitleProp {
  }

  // <Image />
  // this component is missing entirely from the typings
  interface ImageProps extends __React.Props<ImageClass> {
    src: string;
    responsive?: boolean;
    rounded?: boolean;
    circle?: boolean;
    thumbnail?: boolean;
    title?: string;
    width?: number;
    height?: number;
  }
  interface Image extends __React.ReactElement<ImageProps> { }
  interface ImageClass extends __React.ComponentClass<ImageProps> { }
  let Image: ImageClass;
}
