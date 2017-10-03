// tslint:disable:no-unused-variable no-shadowed-variable

// include additional imports
import './imports';

// this is a patch for a bug in react-overlays that prevents modals from functioning properly
// see: https://github.com/react-bootstrap/react-overlays/issues/188
import { Modal } from 'react-overlays';
Modal.prototype.componentWillMount = function() {
  this.setModalNode = function(ref: any) {
    this.modalNode = ref;
    if (ref != null && this.props.show) {
      this.onShow();
    }
  }.bind(this);
};
Modal.prototype.componentDidMount = function() {
  this._isMounted = true;
};
