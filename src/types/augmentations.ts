// tslint:disable:no-unused-variable

import { HTMLProps, ClassicComponent, ClassicComponentClass } from 'react';

declare module 'react-bootstrap' {
  // injecting fill prop for <Table />
  interface TableProps {
    fill?: boolean;
  }

  // add missing <Navbar.Form />
  interface NavbarFormProps extends HTMLProps<NavbarForm> {
    componentClass?: any;
    pullRight?: boolean;
  }
  type NavbarForm = ClassicComponent<NavbarFormProps, {}>;
  let NavbarForm: ClassicComponentClass<NavbarFormProps>;

  interface NavbarClass {
    Form: typeof NavbarForm;
  }
}
