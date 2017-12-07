import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import last from 'lodash/last'
import { Icon } from 'antd'

const propTypes = {
  target: PropTypes.any,
  pageNumber: PropTypes.number,
  onSaveHighlight: PropTypes.func.isRequired,
  commentOnHighlight: PropTypes.func.isRequired,
}

class PdfPopup extends PureComponent {
  getRect = () => {
    const { target, pageNumber } = this.props
    if (!target || !target.selectors) return null
    const { selectors } = target
    if (!selectors.pdfRectangles) {
      console.warn('selectors object does not have a pdfRectangles property')
      return null
    }
    const rect = selectors.isBackwards ? selectors.pdfRectangles[0] : last(selectors.pdfRectangles)
    if (rect.pageNumber !== pageNumber) return null
    return rect
  }

  render() {
    const { target, onSaveHighlight, commentOnHighlight } = this.props
    const rect = this.getRect()
    return rect &&
      (<div
        style={{
          top: `${!target.selectors.isBackwards && (rect.top + rect.height) * 100}%`,
          left: `${!target.selectors.isBackwards && (rect.left + rect.width) * 100}%`,
          bottom: `${target.selectors.isBackwards && (1 - rect.top) * 100}%`,
          right: `${target.selectors.isBackwards && (1 - rect.left) * 100}%`,
        }}
        className="xs-popup-buttons"
      >
        <div className="xs-popup-content">
          <div className="xs-popup-button">
            <span>
              <button onClick={onSaveHighlight}>
                <Icon type="star-o" />
              </button>
            </span>
            <span>
              <button onClick={commentOnHighlight}>
                <Icon type="edit" />
              </button>
            </span>
          </div>
        </div>
      </div>)
  }
}

PdfPopup.propTypes = propTypes

export default PdfPopup
