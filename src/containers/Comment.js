import React from 'react'
import { connect } from 'react-redux'
import { resourceCreateRequest } from 'store/actions'
import { Comment } from 'components'

const CommentContainer = props => <Comment {...props} />

const mapDispatchToProps = dispatch => ({
  saveComment: data => dispatch(resourceCreateRequest('annotations', data)),
})

export default connect(null, mapDispatchToProps)(CommentContainer)
