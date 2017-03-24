import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Observable, IDisposable } from 'rx';
import { Enumerable } from 'ix';
import { Grid, Row, Col } from 'react-bootstrap';

import './BootstrapGuide.less';

export interface BootstrapGuideProps {
}

export class BootstrapGuide extends React.Component<BootstrapGuideProps, any> {
  private mouseMoveSub: IDisposable | undefined;

  componentDidMount() {
    const guide = findDOMNode(this.refs['guide']) as HTMLDivElement;

    if (guide != null) {
      const hline = findDOMNode(this.refs['hline']) as HTMLDivElement;
      const vline = findDOMNode(this.refs['vline']) as HTMLDivElement;

      this.mouseMoveSub = Observable
        .fromEvent(document, 'mousemove')
        .doOnNext((e: MouseEvent) => {
          guide.style.visibility = e.shiftKey === true ? 'visible' : 'hidden';
        })
        .filter((e: MouseEvent) => e.shiftKey === true)
        .subscribe((e: MouseEvent) => {
          guide.style.top = `${ Math.max(0, e.clientY - guide.clientHeight) }px`;

          if (hline != null) {
            hline.style.top = `${ e.pageY }px`;
          }

          if (vline != null) {
            vline.style.left = `${ e.pageX }px`;
          }
        });
    }
  }

  componentWillUnmount() {
    this.mouseMoveSub = Object.dispose(this.mouseMoveSub);
  }

  render() {
    return (
      <div ref='guide' className='BootstrapGuide'>
        <Grid>
          <Row>
            {
              Enumerable
                .range(1, 12)
                .select(x => (
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
}
