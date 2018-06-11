import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Observable, Subscription } from 'rxjs';
import { Iterable } from 'ix';
import { Grid, Row, Col } from 'react-bootstrap';

// the offset is needed to prevent the guide from interfering with mouse clicks
export const BootstrapGuideOffset = 5;

export interface BootstrapGuideProps {
}

export class BootstrapGuide extends React.Component<BootstrapGuideProps> {
  private mouseMoveSub = Subscription.EMPTY;

  componentDidMount() {
    const guide = findDOMNode(this.refs['guide']) as HTMLDivElement;

    if (guide != null) {
      const hline = findDOMNode(this.refs['hline']) as HTMLDivElement;
      const vline = findDOMNode(this.refs['vline']) as HTMLDivElement;

      this.mouseMoveSub = Observable
        .fromEvent(document, 'mousemove')
        .do((e: MouseEvent) => {
          guide.style.visibility = e.shiftKey === true ? 'visible' : 'hidden';
        })
        .filter((e: MouseEvent) => e.shiftKey === true)
        .subscribe((e: MouseEvent) => {
          guide.style.top = `${ this.calculateTop(guide, e) }px`;

          if (hline != null) {
            hline.style.top = `${ Math.max(0, e.pageY - BootstrapGuideOffset) }px`;
          }

          if (vline != null) {
            vline.style.left = `${ Math.max(0, e.pageX - BootstrapGuideOffset) }px`;
          }
        });
    }
  }

  componentWillUnmount() {
    this.mouseMoveSub = Subscription.unsubscribe(this.mouseMoveSub);
  }

  render() {
    return (
      <div ref='guide' className='BootstrapGuide'>
        <Grid>
          <Row>
            {
              Iterable
                .range(1, 12)
                .map(x => (
                  <Col key={ x } className='BootstrapGuide-col' xs={ 1 }>
                    <div className='BootstrapGuide-block'>{ `Col ${ x }` }</div>
                  </Col>
                ))
                .toArray()
            }
          </Row>
        </Grid>
        <div ref='hline' className='BootstrapGuide-line BootstrapGuide-hline'></div>
        <div ref='vline' className='BootstrapGuide-line BootstrapGuide-vline'></div>
      </div>
    );
  }

  private calculateTop(guide: HTMLDivElement, e: MouseEvent) {
    const parent = (guide.offsetParent as HTMLDivElement);
    const offset = parent.offsetTop;
    const maxY = parent.clientHeight - guide.clientHeight;
    return Math.min(maxY, Math.max(0, e.pageY - guide.clientHeight - offset - BootstrapGuideOffset));
  }
}
