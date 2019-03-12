import React from 'react';
import raf from 'raf';
import PropTypes from 'prop-types';

const _hasRecord = data => data && data.length > 0;

export default class VirtualizedList extends React.Component {

  /** The default buffer size */
  static BUFFER_SIZE = 3;

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      const prevHas = _hasRecord(prevProps.data);
      const currHas = _hasRecord(this.props.data);

      // Rerender after data loaded
      if (!prevHas && currHas) {
        this.rerender();
      }
    }
  }

  rerender = () => {
    raf(() => {
      this.setState({});
    });
  };

  getStateFromProps = (props) => {
    const {
      rowHeight,
      data,
      maskFilterRectTop,
      maskFilterRectBottom,
      bufferSize,
    } = props;

    const { top, bottom } = this.getRectFromRef();

    let listHeight = 0;
    let showHeight = 0;
    let showData = [];
    let offsetTop = 0;
    let offsetBottom = 0;
    const hasRecord = _hasRecord(data);
    const dataLength = hasRecord ? data.length : 0;

    if (hasRecord) {
      listHeight = dataLength * rowHeight;

      // The part to display
      if (!((top <= maskFilterRectTop && bottom <= maskFilterRectTop) ||
        (top >= maskFilterRectBottom && bottom >= maskFilterRectBottom)
      )) {
        /** Expand the buffer viewport size and finally render the buffer area */
        const bufferHeight = (typeof bufferSize === 'undefined' ?
          VirtualizedList.BUFFER_SIZE :
          bufferSize) * rowHeight;

        const _bufferTop = maskFilterRectTop - bufferHeight;
        const _bufferBottom = maskFilterRectBottom + bufferHeight;

        /** Calculate the visible boundary distance */
        const _offsetTop = _bufferTop > top ? _bufferTop - top : 0;
        const _offsetBottom = bottom > _bufferBottom ? bottom - _bufferBottom : 0;

        /** Calculate data interception range */
        const _offsetTopLen = Math.floor(_offsetTop / rowHeight);
        const _offsetBottomLen = Math.floor(_offsetBottom / rowHeight);

        offsetTop = _offsetTopLen * rowHeight;
        offsetBottom = _offsetBottomLen * rowHeight;
        showHeight = listHeight - offsetTop - offsetBottom;

        if (_offsetBottomLen === 0) {
          showData = data.slice(_offsetTopLen);
        } else {
          showData = data.slice(_offsetTopLen, -_offsetBottomLen);
        }
      }
    }

    return {
      hasRecord,
      dataLength,
      listHeight,
      showHeight,
      showData,
      offsetTop,
      offsetBottom,
    };
  };

  getRectFromRef = () => {
    let rect = { top: 0, bottom: 0 };
    if (this.ref) {
      const _rect = this.ref.getBoundingClientRect();
      rect = {
        top: _rect.top,
        bottom: _rect.bottom,
      };
    }
    return rect;
  };

  storeRef = (ref) => {
    this.ref = ref;
  };
  ref = null;

  render() {
    const { showRender, noRowsRender, style = {} } = this.props;
    const {
      hasRecord,
      listHeight,
      showHeight,
      showData,
      offsetTop,
      offsetBottom,
    } = this.getStateFromProps(this.props);

    if (!hasRecord) {
      return noRowsRender();
    }

    const _style = {
      height: `${listHeight}px`,
      position: 'relative',
      ...style,
    };

    const _showStyle = {
      position: 'absolute',
      height: `${showHeight}px`,
      top: `${offsetTop}px`,
      bottom: `${offsetBottom}px`,
      left: '0px',
      right: '0px',
    };

    return (
      <div ref={this.storeRef} style={_style}>
        <div style={_showStyle}>
          {showRender(showData)}
        </div>
      </div>
    );
  }
}

VirtualizedList.propTypes = {
  /** Filter viewport top */
  maskFilterRectTop: PropTypes.number.isRequired,
  /** Filter viewport bottom */
  maskFilterRectBottom: PropTypes.number.isRequired,
  /** Filter update ts */
  maskFilterStateTs: PropTypes.number.isRequired,
  /** All data */
  data: PropTypes.array.isRequired,
  /** Row height */
  rowHeight: PropTypes.number.isRequired,
  /** Override the default buffer size */
  bufferSize: PropTypes.number,
  /** Display area rendering */
  showRender: PropTypes.func.isRequired,
  /** No data placeholder rendering */
  noRowsRender: PropTypes.func.isRequired,
};
