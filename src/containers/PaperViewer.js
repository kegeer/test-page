import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { PaperViewer } from 'components'
import { fromResource } from 'store/selectors'
import { resourceDetailReadRequest } from 'store/actions'

// const PaperViewerContainer = props => <PaperViewer {...props} />

class PaperViewerContainer extends React.Component {
  static propTypes = {
    filename: PropTypes.string.isRequired,
    getPaper: PropTypes.func.isRequired,
    pdf: PropTypes.any,
  }
  static defaultProps = {
    pdf: null,
  }

  componentWillMount() {
    this.props.getPaper(this.props.filename)
  }

  render() {
    const { pdf } = this.props
    return (pdf && <PaperViewer pdf={pdf} />)
  }
}
const mapStateToProps = state => ({
  pdf: fromResource.getDetail(state, 'papers'),
})


const mapDispatchToProps = dispatch => ({
  getPaper: filename => dispatch(resourceDetailReadRequest('papers', filename)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PaperViewerContainer)
