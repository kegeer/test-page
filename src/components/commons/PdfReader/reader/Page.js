import React, { Component } from 'react'
import PropTypes from 'prop-types'
import 'pdfjs-dist/build/pdf.combined'
import 'waypoints/lib/noframework.waypoints'
import 'waypoints/lib/shortcuts/inview'
import { getPixelRatio, getViewerport } from '../lib/Viewport'
import PdfHighlight from './PdfHighlight'
import PdfPopup from './PdfPopup'
import LinkService from './LinkService'


const { PDFJS, Waypoint } = window

class Page extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scale: props.scale,
      isInview: false,
      scaleChange: false,
      emphasizedHighlights: [],
    }
    this.linkService = new LinkService(this.onLinkDestinationCreate, this.scrollToAnchor)

    this.renderPageSVG = this.renderPageSVG.bind(this)
    this.renderPageCanvas = this.renderPageCanvas.bind(this)
    this.renderTextLayer = this.renderTextLayer.bind(this)
    this.onHighlightClick = this.onHighlightClick.bind(this)
    this.renderAnnotationsLayer = this.renderAnnotationsLayer.bind(this)
    this.onLinkDestinationCreate = this.onLinkDestinationCreate.bind(this)
    this.scrollToAnchor = this.scrollToAnchor.bind(this)
  }

  componentDidMount() {
    this.initPage()
    // console.log(this._textLayerDiv[0], 'hatext')
    // this._textLayerDiv.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scale !== this.state.scale) {
      this.setState({ scale: nextProps.scale }, () => {
        this.updatePage(nextProps.scale)
      })
    }
    if (nextProps.selectors !== this.props.selectors) {
      this.props.clearTempHighlightsByPage()
    }
  }


  // onHighlightMouseenter = (highlight) => {
  //   console.log(highlight, 'mouse enter highlight')
  // }
  // onHighlightMouseleave = (highlight) => {
  //   console.log(highlight, 'mouse leave highlight')
  // }
  onHighlightClick({ highlight, pageNumber }) {
    // console.log(highlight, 'click highlight')
    // console.log(pageNumber, 'click highlight pageNumber')
  }


  onLinkDestinationCreate() {}

  getViewport = () => {
    const { page } = this.props
    const { scale } = this.state
    const rotate = this.props.rotate || 0
    const canvas = this._canvas

    return getViewerport(page, scale, rotate, canvas)
  }
  // TODO 所有导航链接可以通过prop导入，在本页不太可能完成所有功能
  async scrollToAnchor(anchor) {
    // if (!anchor) return
    // if (anchor !== this.anchor) {
    //   this.anchor = anchor
    // }
    //
    // let match
    // match = /^p:(\d+)$/.exec(anchor)
    // if (match) {
    //   const pageNumber = parseInt(match[1], 10)
    //   if (pageNumber === this.pageNumber) return
    //   return this.scrollToId(anchor)
    // }
    // match = /^pdfd:(.*)$/.exec(anchor)
    // if (match) {
    //   return await this.scrollToDest(match[1])
    // }
    // match = /^pdfdr:(.*)$/.exec(anchor)
    // if (match) {
    //   const destRef = JSON.parse(match[1])
    //   return await this.scrollToDestRef(destRef)
    // }
    //
    // match = /^s:([\w-]+$/.exec(anchor)
    // if (match) {
    //   return await this.scrollToSelection(match[1])
    // }
  }

  // scrollToId (id) {
  //   const element = document.getElementById(id)
  //   if (!element) return;
  //
  // }
  //
  // scrollToDest(dest) {
  //   // const destRef = await
  // }
  // async scrollToDestRef (destRef) {
  //
  // }

  refreshWaypoints = () => {
    Waypoint.refreshAll()
  }


  initWaypoint = (pageHeight) => {
    const { page, onVisibleOnViewport } = this.props
    const context = document.querySelector('.pdf-viewer')
    this.waypoints = [
      new Waypoint({
        offset: pageHeight / 4,
        element: this._page,
        context,
        handler: (direction) => {
          if (direction === 'down') {
            onVisibleOnViewport(page.pageIndex)
          }
        },
      }),

      new Waypoint({
        offset: -pageHeight / 3,
        element: this._page,
        context,
        handler: (direction) => {
          if (direction === 'up') {
            onVisibleOnViewport(page.pageIndex)
          }
        },
      }),

      new Waypoint.Inview({
        element: this._page,
        context,
        enter: () => {
          this.setState({ isInview: true }, () => {
            if (!this.pageRendered) {
              this.renderPage()
            } else if (this.state.scaleChange) {
              this.setState({ scaleChange: false }, () => {
                this.renderPage()
              })
            }
          })
        },
        exited: () => {
          this.setState({ isInview: false })
        },
      }),
    ]
  };
  roundSize = (size) => {
    return {
      height: Math.floor(size.height),
      width: Math.floor(size.width),
    }
  }

  cleanPage = () => {
    if (this.props.renderType === 'svg') {
      this._svg.innerHTML = ''
    } else {
      const ctx = this._canvas.getContext('2d')
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }
  }

  initPage = () => {
    const { viewport, viewportDefaultRatio } = this.getViewport()
    this.renderPagePlaceholder(viewportDefaultRatio)
    this.initWaypoint(viewport.height)
  };

  updatePage = () => {
    this.renderPagePlaceholder(this.getViewport().viewportDefaultRatio)
    this.refreshWaypoints()
    this.cleanPage()
    if (this.state.isInview) {
      this.renderPage()
    } else {
      this.setState({ scaleChange: true })
    }
  }


  renderPage = () => {
    const { page, renderType } = this.props
    const viewports = this.getViewport()
    const pixelRatio = getPixelRatio(this._canvas)
    // console.log(pixelRatio, 'pixelRatio')

    this.renderPagePlaceholder(viewports.viewportDefaultRatio)
    if (renderType === 'svg') {
      this.renderPageSVG(page, pixelRatio, viewports)
    } else {
      this.renderPageCanvas(page, pixelRatio, viewports)
    }

    this.renderTextLayer(page, viewports.viewportDefaultRatio)
    // this.renderAnnotationsLayer(page, pixelRatio, viewports);

    this.pageRendered = true
  };

  renderPagePlaceholder = (viewportDefaultRatio) => {
    this._page.style.width = `${viewportDefaultRatio.width}px`
    this._page.style.height = `${viewportDefaultRatio.height}px`
  };

  async renderPageSVG(page, pixelRatio, { viewportDefaultRatio }) {
    this._svg.style.width = `${viewportDefaultRatio.width}px`
    this._svg.style.height = `${viewportDefaultRatio.height}px`

    // SVG rendering by PDF.js
    await page.getOperatorList()
      .then((opList) => {
        const svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs)
        return svgGfx.getSVG(opList, viewportDefaultRatio)
      })
      .then((svg) => {
        this._svg.innerHTML = ''
        this._svg.appendChild(svg)
      })
  }


  async renderPageCanvas(page, pixelRatio, { viewport }) {
    const size = this.roundSize(viewport)
    this._canvas.height = Math.round(size.height * pixelRatio)
    this._canvas.width = Math.round(size.width * pixelRatio)
    this._canvas.style.height = `${size.height / pixelRatio}px`
    this._canvas.style.width = `${size.width / pixelRatio}px`

    const canvasContext = this._canvas.getContext('2d')
    canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    const renderContext = {
      canvasContext,
      viewport,
    }

    if (this.pageRender && this.pageRender._internalRenderTask.running) {
      this.pageRender._internalRenderTask.cancel()
    }

    this.pageRender = await page.render(renderContext)
  }

  async renderTextLayer(page, viewportDefaultRatio) {
    if (!this._textContent) {
      this._textContent = await page.getTextContent()
    }
    this._textContent.innerHTML = ''
    this._textLayer = PDFJS.renderTextLayer({
      container: this._textLayerDiv,
      textContent: this._textContent,
      viewport: viewportDefaultRatio,
      enhanceTextSelection: true,
    })

    await this._textLayer
    this._textLayer.expandTextDivs(true)
    this._textLayerDiv.normalize()
  }

  async renderAnnotationsLayer(page, pixelRatio, { viewport }) {
    const _viewport = viewport.clone({ dontFlip: true })
    // _viewport.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (!this._annotations) {
      this.annotations = await page.getAnnotations()
    }
    this._annotationsLayer.innerHTML = ''
    await PDFJS.AnnotationLayer.render({
      annotations: this.annotations,
      div: this._annotationsLayer,
      linkService: this.linkService,
      page,
      viewport: _viewport,
    })
  }

  render() {
    const {
      page, renderType, highlights, popupTarget, onSaveHighlight, commentOnHighlight, tempHighlightsByPage,
    } = this.props
    // console.log(highlights, 'page hgs');
    // const { emphasizedHighlights } = this.state
    const pageNumber = page.pageIndex + 1
    return (
      <div
        ref={div => (this._page = div)}
        className="pdf-page"
        id={`pdf-page-${page.pageIndex}`}
      >
        <div className="pdf-context">
          {renderType === 'svg'
          ? <div ref={div => (this._svg = div)} className="svg" />
          : <canvas ref={canvas => (this._canvas = canvas)} />}
        </div>

        <div
          ref={div => (this._textLayerDiv = div)}
          className="textLayer"
          id={page.pageIndex}
        />
        <div
          ref={div => (this._annotationsLayer = div)}
          className="annnotationLayer"
          id={page.pageIndex}
        />

        <div ref={div => (this._highlightLayer = div)} className="xs-pdf-highlights">
          {/* 生成唯一key我也是拼了 */}
          {
            highlights && highlights.map(highlight => (
              <PdfHighlight
                key={`${pageNumber}_${Math.random()}_${new Date().getTime()}`}
                highlight={highlight}
                pageNumber={pageNumber}
                onClickHighlight={this.onHighlightClick}
              />
            ))
          }
          {
            tempHighlightsByPage && tempHighlightsByPage.map(highlight => (
              <PdfHighlight
                key={`${pageNumber}_${Math.random()}_${new Date().getTime()}`}
                highlight={highlight}
                pageNumber={pageNumber}
                onClickHighlight={this.onHighlightClick}
              />
            ))
          }
        </div>
        {
          popupTarget &&
          popupTarget.selectors &&
          <PdfPopup target={popupTarget} pageNumber={pageNumber} onSaveHighlight={onSaveHighlight} commentOnHighlight={commentOnHighlight} />
        }
      </div>
    )
  }
}

Page.propTypes = {
  scale: PropTypes.number.isRequired,
  selectors: PropTypes.object,
  renderType: PropTypes.string.isRequired,
  page: PropTypes.object.isRequired,
  onVisibleOnViewport: PropTypes.func.isRequired,
  rotate: PropTypes.number.isRequired,
  highlights: PropTypes.array,
  tempHighlightsByPage: PropTypes.array,
  popupTarget: PropTypes.any,
  onSaveHighlight: PropTypes.func.isRequired,
  commentOnHighlight: PropTypes.func.isRequired,
  clearTempHighlightsByPage: PropTypes.func.isRequired,
}

export default Page
