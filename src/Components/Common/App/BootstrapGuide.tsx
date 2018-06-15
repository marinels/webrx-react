import { Iterable } from 'ix';
import * as React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import { Observable, Subscription } from 'rxjs';

// the offset is needed to prevent the guide from interfering with mouse clicks
export const BootstrapGuideOffset = 5;

export class BootstrapGuide extends React.Component {
  private mouseMoveSub = Subscription.EMPTY;

  private guideRef = React.createRef<HTMLDivElement>();
  private hlineRef = React.createRef<HTMLDivElement>();
  private vlineRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const guide = this.guideRef.current;

    if (guide != null) {
      const hline = this.hlineRef.current;
      const vline = this.vlineRef.current;

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
      <div ref={ this.guideRef } className='BootstrapGuide'>
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
        <div ref={ this.hlineRef } className='BootstrapGuide-line BootstrapGuide-hline' />
        <div ref={ this.vlineRef } className='BootstrapGuide-line BootstrapGuide-vline' />
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
