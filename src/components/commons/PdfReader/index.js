import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Velocity from 'velocity-animate'
import classnames from 'classnames'
import { Row, Col } from 'antd'

import 'pdfjs-dist/webpack'
import { getMinZoomScale, getFitWidthScale } from './lib/Viewport'
import Viewer from './reader/Viewer'
import ThumbnailViewer from './reader/ThumbnailViewer'
import ToolsBar from './reader/ToolsBar'
import Loader from './reader/Loader'

// import { Comment } from 'components'

import './Viewer.less'
import './Text.less'
import './Loader.less'

const { PDFJS } = window
window.Velocity = Velocity

class PDFReader extends Component {
  constructor(props) {
    super(props)
    const { scale, currentPage } = props
    this.state = {
      pdf: {},
      pages: [],
      isLoading: true,
      currentPage,
      scale,
      thumbnailsViewOpen: true,
      numPages: 0,
    }
  }

  componentWillMount() {
    this.loadDocument(this.props.file)
  }

  /**
   * Called when a document is loaded successfully.
   */
  onDocumentLoad = (pdf) => {
    this.setState({
      pdf,
      numPages: pdf.numPages
    })
    this.loadFirstPage()
  };

  /**
   * Called when a document fails to load.
   */
  onDocumentError = (error) => {
    this.setState({
      pdf: false,
    })
    throw new Error(error)
  };

  onViewerLoaded = () => {
    const { onViewLoadComplete } = this.props
    if (onViewLoadComplete) {
      onViewLoadComplete()
    }
  };


  /**
   * Load document
   * @param {*} args
   */

  loadDocument = (...args) => {
    PDFJS.getDocument(...args)
      .then(this.onDocumentLoad)
      .catch(this.onDocumentError)
  }

  scrollToPage = (pageIndex) => {
    // console.log(pageIndex, 'pageIndex')
    const page = document.getElementById(`pdf-page-${pageIndex}`)

    const context = document.querySelector('.pdf-viewer')
    Velocity(page, 'scroll', {
      container: context,
      duration: 0,
      queue: false,
    })
  };

  changePage = (pageIndex) => {
    this.setState({ currentPage: pageIndex })
  };

  zoom = (direction) => {
    const { scale, pages } = this.state
    const container = document.querySelector('.pdf-viewer')
    this.minZoomScale = getMinZoomScale(pages[0], container)

    switch (direction) {
      case 'in':
        this.setState({ scale: scale + 0.1 })
        break
      case 'out':
        this.setState(_state => ({
          scale: _state.scale - 0.1 > this.minZoomScale ? _state.scale - 0.1 : this.minZoomScale,
        }))
        break
      case 'fitWidth':
        this.setState({ scale: getFitWidthScale(pages[0], container) })
        break
      default:
        break
    }
  };

  loadFirstPage = () => {
    const { pdf } = this.state

    pdf.getPage(1)
      .then((page) => {
        this.setState({ pages: [page] }, () => {
          this.setState({ isLoading: false })
          this.loadPages(pdf, 2)
        })
      })
  }

  loadPages = (pdf, pageIndex) => {
    if (pageIndex <= pdf.numPages) {
      pdf.getPage(pageIndex).then((page) => {
        this.setState(_state => ({ pages: [..._state.pages, page] }))
        this.loadPages(pdf, pageIndex + 1)
      })
    } else {
      this.onViewerLoaded()
    }
  };

  toggleThumbnailsView = () => {
    this.setState(_state => ({ thumbnailsViewOpen: !_state.thumbnailsViewOpen }))
  }

  render() {
    const {
      pages,
      isLoading,
      currentPage,
      scale,
      thumbnailsViewOpen,
      pdf,
    } = this.state

    const {
      width,
      rotate,
      btnToggle,
      btnUp,
      btnDown,
      btnZoomIn,
      btnZoomOut,
      btnFitWidth,
      pageCountLabel,
      renderType,
      annotations,
    } = this.props

    return (
      <div
        className={classnames('pdf-reader', {
          'tumbnails-open': thumbnailsViewOpen,
        })}
      >
        { isLoading
          ? <Loader />
          : (
            <Row>
              <Col span={4}>
                <ThumbnailViewer
                  pages={pages}
                  currentPage={currentPage}
                  onSelect={this.scrollToPage}
                />
              </Col>
              <Col span={20}>
                <Viewer
                  pages={pages}
                  onPageChange={this.changePage}
                  scale={scale}
                  rotate={rotate}
                  width={width}
                  renderType={renderType}
                  annotations={annotations}
                  numPages={this.state.numPages}
                />
                <ToolsBar
                  btnToggle={btnToggle}
                  toggleHandler={this.toggleThumbnailsView}
                  btnUp={btnUp}
                  btnDown={btnDown}
                  scrollToPageHandler={this.scrollToPage}
                  btnZoomIn={btnZoomIn}
                  btnZoomOut={btnZoomOut}
                  btnFitWidth={btnFitWidth}
                  zoomHandler={this.zoom}
                  currentPage={currentPage}
                  numPages={pdf.numPages}
                  pageCountLabel={pageCountLabel}
                />
              </Col>
            </Row>)
        }
      </div>
    )
  }
}

PDFReader.defaultProps = {
  rotate: 0,
  scale: 1,
  renderType: 'canvas',
  currentPage: 0,
  btnToggle: {
    label: 'toggle panel',
    icon: 'bars',
  },
  btnUp: {
    label: 'Up',
    icon: 'up',
  },
  btnDown: {
    label: 'Down',
    icon: 'down',
  },
  btnZoomIn: {
    label: 'Zoom In',
    icon: 'plus',
  },
  btnZoomOut: {
    label: 'Zoom Out',
    icon: 'minus',
  },
  btnFitWidth: {
    label: 'Fit Width',
    icon: 'arrows-alt',
  },
  loadingLabel: 'PDF Document Loading ...',
  pageCountLabel: '/',
  onViewLoadComplete: null,
}

PDFReader.propTypes = {
  annotations: PropTypes.arrayOf(PropTypes.any),
  file: PropTypes.any,
  rotate: PropTypes.number,
  renderType: PropTypes.string,
  currentPage: PropTypes.number,
  scale: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  width: PropTypes.number,
  btnToggle: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      classname: PropTypes.string,
      iconClassname: PropTypes.string,
      iconButton: PropTypes.bool,
    }),
    PropTypes.element,
  ]),
  btnUp: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      classname: PropTypes.string,
      iconClassname: PropTypes.string,
      iconButton: PropTypes.bool,
    }),
    PropTypes.element,
  ]),
  btnDown: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      classname: PropTypes.string,
      iconClassname: PropTypes.string,
      iconButton: PropTypes.bool,
    }),
    PropTypes.element,
  ]),
  btnZoomIn: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      classname: PropTypes.string,
      iconClassname: PropTypes.string,
      iconButton: PropTypes.bool,
    }),
    PropTypes.element,
  ]),
  btnZoomOut: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      classname: PropTypes.string,
      iconClassname: PropTypes.string,
      iconButton: PropTypes.bool,
    }),
    PropTypes.element,
  ]),
  btnFitWidth: PropTypes.oneOfType([
    PropTypes.shape({
      label: PropTypes.string,
      classname: PropTypes.string,
      iconClassname: PropTypes.string,
      iconButton: PropTypes.bool,
    }),
    PropTypes.element,
  ]),
  loadingLabel: PropTypes.string,
  pageCountLabel: PropTypes.string,
  onViewLoadComplete: PropTypes.func,
}

export default PDFReader
