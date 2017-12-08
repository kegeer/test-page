import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


const propTypes = {
  highlight: PropTypes.any,
  emphasized: PropTypes.bool,
  pageNumber: PropTypes.number,
  // onMouseenterHg: PropTypes.func,
  // onMouseleaveHg: PropTypes.func,
  onClickHighlight: PropTypes.func,
}

const defaultProps = {
  emphasized: false,
}

const PdfHighlight = (props) => {
  const {
    highlight,
    emphasized,
    pageNumber,
    onClickHighlight,
  } = props
  return (
    highlight.selectors &&
    highlight.selectors.pdfRectangles.map(rectangle => (
      // 生成唯一key我也是拼了
      <div
        key={`${Math.random()}${new Date().getTime()}`}
        className={
          classNames('xs-pdf-highlight', {
                'xs-pdf-highlight-emphasize': emphasized,
              })}
        style={{
                position: 'absolute',
                top: `${rectangle.top * 100}%`,
                left: `${rectangle.left * 100}%`,
                height: `${rectangle.height * 100}%`,
                width: `${rectangle.width * 100}%`,
              }}
        // onClick={onClickHighlight({ highlight, pageNumber })}
        // onMouseOver={onClickHighlight({ highlight, pageNumber })}
      />
    ))
  )
}


PdfHighlight.propTypes = propTypes

PdfHighlight.defaultProps = defaultProps

export default PdfHighlight
