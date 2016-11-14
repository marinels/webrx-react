// tslint:disable:no-unused-variable

// react-bootstrap
import { HTMLProps } from 'react';
import 'react-bootstrap';

declare module 'react-bootstrap' {
  // injecting fill prop for <Table />
  interface TableProps {
    fill?: boolean;
  }

  // add missing <Navbar.Form />
  interface NavbarFormProps extends React.HTMLProps<NavbarForm> {
    componentClass?: any;
    pullRight?: boolean;
  }
  type NavbarForm = React.ClassicComponent<NavbarFormProps, {}>;
  let NavbarForm: React.ClassicComponentClass<NavbarFormProps>;

  interface NavbarClass {
    Form: typeof NavbarForm;
  }
}

// webrx RxJS augmentations
import { IDisposable } from 'rx';

declare module 'rx' {
  interface Observable<T> {
    // the invokeCommand Rx augmentations aren't currently published so we'll add them here for now
    invokeCommand<TResult>(command: wx.ICommand<TResult>): IDisposable;
    invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): IDisposable;
  }
}
