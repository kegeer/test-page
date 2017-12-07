import React from 'react'
import { connect } from 'react-redux'
import { PapersList } from 'components'
import { fromEntities, fromResource } from 'store/selectors'
import { resourceListReadRequest } from 'store/actions'

const PapersListContainer = props => <PapersList {...props} />

const mapStateToProps = state => ({
  loading: fromResource.getLoading(state, 'posts'),
  papersList: fromEntities.getList(state, 'posts', fromResource.getList(state, 'posts')),
})


const mapDispatchToProps = dispatch => ({
  getPapersList: params => dispatch(resourceListReadRequest('posts', params)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PapersListContainer)
