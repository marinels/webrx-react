import * as React from 'react';
import { PortalProps } from 'react-bootstrap';
import { Portal } from 'react-overlays';

export function updateDefaultPortalContainer(container: React.ReactInstance | null) {
  const portalClass: React.ComponentClass<Portal.PortalProps> = Portal;
  if (container != null && (portalClass.defaultProps == null || portalClass.defaultProps.container !== container)) {
    portalClass.defaultProps = Object.assign({}, portalClass.defaultProps, { container });
  }
}
