import React from 'react';
import PropTypes from 'prop-types';
import raf from 'raf';
import { Event } from './helper';

const getWindowRectHeight = () => {
  return window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
};

/**
 * Filter to limit the scope of the display
 *
 * children: ({ rectRef, top, bottom, stateTs }) => {
 *
 * }
 */
export default class VirtualizedMaskFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rect: { top: 0, bottom: 0 },
      stateTs: Date.now(),
    };
  }

  mutationObserver = null;

  componentDidMount() {
    const { useWindow } = this.props;
    /** getRect */
    this.getRect();

    // bind
    Event.addHandler(window, 'resize', this.getRect);
    Event.addHandler(window, 'scroll', this.rerender);
    if (!useWindow) {
      Event.addHandler(this.rectRef, 'scroll', this.rerender);

      // observe
      this.mutationObserver = new MutationObserver(() => {
        // trigger rerender
        this.rerender();
        this.getRect();
      });

      this.mutationObserver.observe(this.rectRef, { attributes: true });
    }
  }

  componentWillUnmount() {
    const { useWindow } = this.props;

    Event.removeHandler(window, 'resize', this.getRect);
    Event.removeHandler(window, 'scroll', this.rerender);
    if (!useWindow) {
      Event.removeHandler(this.rectRef, 'scroll', this.rerender);

      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  getRect = () => {
    const { useWindow } = this.props;
    if (this.rectRef) {
      let _rect;
      if (useWindow) {
        _rect = {
          top: 0,
          bottom: getWindowRectHeight(),
        };
      } else {
        _rect = this.rectRef.getBoundingClientRect();
      }

      const { top, bottom } = _rect;
      this.setState({
        rect: { top, bottom },
      });
    }
  };

  handleRectRef = (ref) => {
    const { useWindow } = this.props;
    if (useWindow) {
      this.rectRef = window;
    } else {
      this.rectRef = ref;
    }
  };
  rectRef = null;

  rerender = () => {
    raf(() => {
      this.setState({
        stateTs: Date.now(),
      });
    });
  };

  render() {
    const { children } = this.props;
    const { rect, stateTs } = this.state;

    const params = {
      rectRef: this.handleRectRef,
      stateTs,
      ...rect,
    };
    return (
      <React.Fragment>
        {children(params)}
      </React.Fragment>
    );
  }
}

VirtualizedMaskFilter.propTypes = {
  children: PropTypes.func.isRequired,
  useWindow: PropTypes.bool,
};

