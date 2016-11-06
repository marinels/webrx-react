/// <reference path="../../../typings/globals/react/index.d.ts" />

// The react-bootstrap typing are sometimes a bit out of date
// these overrides will fill in the missing type definitions

declare namespace ReactBootstrap {
  // Import React
  import React = __React;

  // injecting bsClass
  interface FormControlFeedbackProps {
    bsClass?: string;
  }

  // <Navbar.Form />
  interface NavbarFormProps extends React.HTMLProps<NavbarForm> {
    componentClass?: any;
    pullRight?: boolean;
  }
  type NavbarForm = React.ClassicComponent<NavbarFormProps, {}>;
  let NavbarForm: React.ClassicComponentClass<NavbarFormProps>;

  // <Navbar.Text />
  interface NavbarTextProps extends React.HTMLProps<NavbarText> {
    componentClass?: any;
    pullRight?: boolean;
  }
  type NavbarText = React.ClassicComponent<NavbarTextProps, {}>;
  let NavbarText: React.ClassicComponentClass<NavbarTextProps>;

  // <Navbar.Link />
  interface NavbarLinkProps extends React.HTMLProps<NavbarLink> {
    componentClass?: any;
    pullRight?: boolean;
  }
  type NavbarLink = React.ClassicComponent<NavbarLinkProps, {}>;
  let NavbarLink: React.ClassicComponentClass<NavbarLinkProps>;

  interface NavbarClass {
    Form: typeof NavbarForm;
    Text: typeof NavbarText;
    Link: typeof NavbarLink;
  }
}
