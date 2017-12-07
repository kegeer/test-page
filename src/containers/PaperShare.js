import React from 'react'
import { connect } from 'react-redux'
import { PaperShare } from 'components'
import { resourceCreateRequest } from 'store/actions'
// import { fromResource } from 'store/selectors'

const PaperShareContainer = props => <PaperShare {...props} />


// const mapStateToProps = state => ({
//   isSuccess : state => fromResource.isSuccess(state, 'posts'),
// })
const mapDispatchToProps = dispatch => ({
  sharePaper: data => dispatch(resourceCreateRequest('posts', data)),
})

export default connect(null, mapDispatchToProps)(PaperShareContainer)
