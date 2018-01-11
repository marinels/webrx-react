import * as React from 'react';

export interface GroupProps {
}

export interface GroupComponentProps extends React.ClassAttributes<any>, GroupProps {
}

export class Group extends React.Component {
  render() {
    return this.props.children || false;
  }
}
