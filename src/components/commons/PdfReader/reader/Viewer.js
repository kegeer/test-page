import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import flatten from 'lodash/flatten'
import filter from 'lodash/filter'
import uniq from 'lodash/uniq'
import jquery from 'jquery'
import rangy from 'rangy/lib/rangy-core'
import { Col, Row } from 'antd'

import Page from './Page'
import PdfComment from './PdfComment'

require('rangy/lib/rangy-textrange')
require('rangy/lib/rangy-serializer')
require('rangy/lib/rangy-selectionsaverestore')

// const rangy = require('rangy')

// const jquery = require('jquery')

window.rangy = rangy


class Viewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lastSelectors: undefined,
      lastSimpleSelection: null,
      selectors: undefined,
      highlights: [],
      highlightsByPage: {},
      popupTarget: undefined,
      showComment: false,
    }
    this.onTextSelect = this.onTextSelect.bind(this)
  }

  componentDidMount() {
    this._pages.addEventListener('mouseup', this.onMouseUp)
    this.elements = this._pages.getElementsByClassName('textLayer')
  }
  componentWillUnmount() {
    this._pages.removeEventListener('mouseup', this.onMouseUp)
  }

  onMouseUp = () => {
    this.onTextSelect()
  };


  onSelect = (selectors) => {
    // only call onSelect output if necessary
    if (isEqual(selectors, this.state.lastSelectors)) return

    this.setState({
      lastSelectors: selectors,
      selectors,
      popupTarget: { selectors },
    })


    console.log(this.state.selectors, 'haha selectors')
  };

  async onTextSelect() {
    const selection = rangy.getSelection()

    // no selection object or no anchor/focus
    if (!selection || !selection.anchorNode || !selection.focusNode) {
      return this.onSelect(undefined)
    }
    // selection not contained in element?
    if (!rangy.dom.isAncestorOf(this._pages, selection.anchorNode) ||
      !rangy.dom.isAncestorOf(this._pages, selection.focusNode)) {
      return this.onSelect(undefined)
    }

    // do not allow collapsed / empty selections
    if (!selection.toString()) {
      return this.onSelect(undefined)
    }

    // do not allow selections with zero or more than one ranges
    if (selection.rangeCount !== 1) {
      return this.onSelect(undefined)
    }

    // do nothing if start and end are equal to last selection
    // NOTE: this currently does not work because getRectanglesSelector
    //       creates new TextNodes in order to measure selections
    const simpleSelection = pick(
      selection,
      'anchorNode', 'anchorOffset', 'focusNode', 'focusOffset'
    )
    if (isEqual(simpleSelection, this.state.lastSimpleSelection)) return null

    this.setState({
      lastSimpleSelection: simpleSelection,
    })

    const range = selection.getAllRanges()[0]
    const pageRanges = []
    for (let i = 0; i < this.elements.length; i++) {
      if (!range.intersectsNode(this.elements[i])) continue
      const pageRange = rangy.createRange()
      pageRange.selectNodeContents(this.elements[i])
      pageRanges.push({
        pageNumber: parseInt(this.elements[i].id, 10) + 1,
        range: range.intersection(pageRange),
      })
    }

    const selectors = {
      textQuote: await this.getTextQuoteSelector(range, this._pages),
      isBackwards: selection.isBackwards(),
      pdfTextQuotes: await pageRanges.map((pageRange) => {
        const selector = this.getTextQuoteSelector(pageRange.range, this.elements[pageRange.pageNumber - 1])
        selector.pageNumber = pageRange.pageNumber
        return selector
      }),
      pdfTextPosition: await pageRanges.map((pageRange) => {
        const selector = this.getTextPositionSelector(pageRange.range, this.elements[pageRange.pageNumber - 1])
        selector.pageNumber = pageRange.pageNumber
        return selector
      }),
      pdfRectangles: await flatten(pageRanges.map((pageRange) => {
        const rectSelectors = this.getRectanglesSelector(range, this.elements[pageRange.pageNumber - 1])
        rectSelectors.forEach(selector => selector.pageNumber = pageRange.pageNumber)
        return rectSelectors
      })),
    }

    return this.onSelect(selectors)
  }

  getTextPositionSelector = (range, container) => {
    return range.toCharacterRange(container)
  };

  // compute textQuote selector for a range (relies on rangy's textRange)
  getTextQuoteSelector = (range, container) => {
    // create prefix/suffix range
    const prefixRange = range.cloneRange()
    const suffixRange = range.cloneRange()


    // move ranges to the left/right
    prefixRange.moveStart('character', -10)
    suffixRange.moveEnd('character', 10)

    // restrict ranges to element
    if (!rangy.dom.isAncestorOf(container, prefixRange.startContainer)) {
      prefixRange.setStart(container, 0)
    }
    if (!rangy.dom.isAncestorOf(container, suffixRange.endContainer)) {
      suffixRange.setEndAfter(container)
    }

    // move end/start of ranges to start/end of original range
    prefixRange.setEnd(range.startContainer, range.startOffset)
    suffixRange.setStart(range.endContainer, range.endOffset)

    return {
      content: range.text(),
      prefix: prefixRange.text(),
      suffix: suffixRange.text(),
    }
  };

  // returns all leaf text nodes that are descendants of node or are node
  getTextNodes = (node) => {
    if (!node) { return [] }
    if (node.nodeType === Node.TEXT_NODE) { return [node] }

    // process childs
    let nodes = []
    jquery(node).contents().each((index, el) => {
      nodes = nodes.concat(this.getTextNodes(el))
    })
    return nodes
  };

  getRectanglesSelector = (range, container, restoreSelection = true) => {
    const containerRect = container.getBoundingClientRect()

    // preserve current selection to work around browser bugs that result
    // in a changed selection
    // see https://github.com/timdown/rangy/issues/93
    // and https://github.com/timdown/rangy/issues/282
    const currentSelection = restoreSelection && rangy.serializeSelection(rangy.getSelection(), true)
    // split start container if necessary
    range.splitBoundaries()

    // get TextNodes inside the range
    const textNodes = filter(
      this.getTextNodes(container),
      range.containsNodeText.bind(range),
    )


    // wrap each TextNode in a span to measure it
    // See this discussion:
    // https://github.com/paperhive/paperhive-frontend/pull/68#discussion_r25970589
    const rects = textNodes.map((node) => {
      const $node = jquery(node)
      const $span = $node.wrap('<span/>').parent()
      const rect = $span.get(0).getBoundingClientRect()
      $node.unwrap()

      return {
        top: (rect.top - containerRect.top) / containerRect.height,
        left: (rect.left - containerRect.left) / containerRect.width,
        height: rect.height / containerRect.height,
        width: rect.width / containerRect.width,
      }
    })

    // re-normalize to undo splitBoundaries
    range.normalizeBoundaries()

    // restore selection (see above)
    if (restoreSelection && currentSelection) {
      rangy.deserializeSelection(currentSelection)
    }

    return rects
  };

  // renderHighlights = () => {
  //   const { highlightsByPage } = this.state
  //   this.props.highlights.forEach(highlight => {
  //     if (!highlight.selectors || !highlight.selectors.pdfRectangles) return;
  //     const pageNumbers = uniq(highlight.selectors.pdfRectangles.map(rect => rect.pageNumber))
  //     pageNumbers.forEach(pageNumber => {
  //       if (!highlightsByPage[pageNumber]) {
  //         highlightsByPage[pageNumber] = [];
  //       }
  //       highlightsByPage[pageNumber].push(highlight);
  //     })
  //   })
  //   this.setState({
  //     highlightsByPage,
  //   });
  // }

  saveHighlights = (e) => {
    e.stopPropagation()
    // this.saveHighlightsToServer(selectors)
    const { selectors, highlightsByPage } = this.state
    if (!selectors.pdfRectangles) return
    const pageNumbers = uniq(selectors.pdfRectangles.map(rec => rec.pageNumber))
    pageNumbers.forEach((pageNumber) => {
      if (!highlightsByPage[pageNumber]) {
        highlightsByPage[pageNumber] = []
      }
      highlightsByPage[pageNumber].push({ selectors })
    })
    this.setState({
      highlightsByPage,
      popupTarget: undefined,
    })
    console.log(this.state.highlightsByPage, 'highlightsByPage')
  };
  // saveHighlightsToServer = (selectors) => {
  //   const { filename } = this.props.match.params
  //   this.props.saveHiglights({
  //     filename,
  //     selectors,
  //   })
  // }
  commentOnHighlight = (e) => {
    this.saveHighlights(e)
    this.setState({
      showComment: true,
      popupTarget: undefined,
    })
  }
  render() {
    const {
      pages, rotate, renderType, scale, onPageChange,
    } = this.props
    const { highlightsByPage, popupTarget, showComment } = this.state
    return (
      <section className="pdf-viewer" ref={div => (this._pages = div)}>
        {
              pages.map((page, index) => (
                <Page
                  key={index}
                  page={page}
                  scale={scale}
                  rotate={rotate}
                  renderType={renderType}
                  onVisibleOnViewport={onPageChange}
                  highlights={highlightsByPage[page.pageNumber]}
                  popupTarget={popupTarget}
                  onSaveHighlight={this.saveHighlights}
                  commentOnHighlight={this.commentOnHighlight}
                />
              ))
            }
      </section>
    )
    // return (
    //   <Row>
    //     <Col span={18}>
    //       <section className="pdf-viewer" ref={div => (this._pages = div)}>
    //         {
    //           pages.map((page, index) => (
    //             <Page
    //               key={index}
    //               page={page}
    //               scale={scale}
    //               rotate={rotate}
    //               renderType={renderType}
    //               onVisibleOnViewport={onPageChange}
    //               highlights={highlightsByPage[page.pageNumber]}
    //               popupTarget={popupTarget}
    //               onSaveHighlight={this.saveHighlights}
    //               commentOnHighlight={this.commentOnHighlight}
    //             />
    //           ))
    //         }
    //       </section>
    //     </Col>
    //     <Col span={6}>
    //       <div className="pdf-sidebar">
    //         { showComment && <PdfComment /> }
    //       </div>
    //     </Col>
    //   </Row>
    // )
  }
}

Viewer.propTypes = {
  pages: PropTypes.array.isRequired,
  rotate: PropTypes.number.isRequired,
  renderType: PropTypes.string.isRequired,
  scale: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
}


export default Viewer
