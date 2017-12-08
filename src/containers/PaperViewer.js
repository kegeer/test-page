import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { PaperViewer } from 'components'
import { fromResource, fromEntities } from 'store/selectors'
import { resourceDetailReadRequest, resourceSubListReadRequest } from 'store/actions'

// const PaperViewerContainer = props => <PaperViewer {...props} />

class PaperViewerContainer extends React.Component {
  static propTypes = {
    filename: PropTypes.string.isRequired,
    getPaper: PropTypes.func.isRequired,
    pdf: PropTypes.any,
    getHighlights: PropTypes.func.isRequired,
    annotations: PropTypes.arrayOf(PropTypes.any),
  }
  static defaultProps = {
    pdf: null,
  }

  componentWillMount() {
    this.props.getPaper(this.props.filename)
  }
  componentDidMount() {
    this.props.getHighlights(this.props.filename, null)
  }

  render() {
    const { pdf, annotations } = this.props
    return (
      pdf &&
        <PaperViewer
          pdf={pdf}
          annotations={annotations}
        />
    )
  }
}
const mapStateToProps = state => ({
  pdf: fromResource.getDetail(state, 'papers'),
  // annotations: fromResource.getList(state, 'annotations'),
  annotations: fromEntities.getList(state, 'annotations', fromResource.getList(state, 'annotations')),
})


const mapDispatchToProps = dispatch => ({
  getPaper: filename => dispatch(resourceDetailReadRequest('papers', filename)),
  getHighlights: (filename, params) => dispatch(resourceSubListReadRequest('annotations', `papers/${filename}`, params)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PaperViewerContainer)
