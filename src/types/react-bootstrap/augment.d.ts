// The react-bootstrap typing are sometimes a bit out of date
// these overrides will fill in the missing type definitions

import { HTMLProps } from 'react';
import 'react-bootstrap';

declare module 'react-bootstrap' {
  // injecting bsClass
  interface FormControlFeedbackProps {
    bsClass?: string;
  }

  // injecting fill
  interface TableProps {
    fill?: boolean;
  }

  // <Navbar.Form />
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
