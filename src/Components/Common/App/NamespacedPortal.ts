import { Portal } from 'react-overlays';
import 'react-bootstrap';

declare module 'react-bootstrap' {
  interface PortalProps {
    container: any;
  }
}

export function updateDefaultPortalContainer(container: React.ReactInstance) {
  if (Portal.defaultProps == null || Portal.defaultProps.container !== container) {
    Portal.defaultProps = Object.assign({}, Portal.defaultProps, { container });
  }
}
