import * as React from 'react';
import { Modal, Portal } from 'react-overlays';

export function updateDefaultContainer(container: React.ReactInstance | null) {
  if (container != null) {
    updateDefaultContainerProp(container, Portal);
    updateDefaultContainerProp(container, Modal);
  }
}

export function updateDefaultContainerProp(
  container: React.ReactInstance,
  componentClass: React.ComponentClass<Portal.PortalProps>,
) {
  if (componentClass.defaultProps == null || componentClass.defaultProps.container !== container) {
    componentClass.defaultProps = Object.assign({}, componentClass.defaultProps, { container });
  }
}
