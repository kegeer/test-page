import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Button, Input } from 'antd'
import './index.less'


const { TextArea } = Input
const propTypes = {
  showComment: PropTypes.bool.isRequired,
  closeComment: PropTypes.func.isRequired,
  selectors: PropTypes.any,
  filename: PropTypes.string,
  saveComment: PropTypes.func.isRequired,
  highlightSelectors: PropTypes.func.isRequired,
}

class Comment extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      body: '',
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.saveComment = this.saveComment.bind(this)
  }
  // componentDidMount() {
  //   if (!this.props.selectors) {
  //     this.closeComment()
  //   }
  // }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectors !== nextProps.selectors) {
      this.props.closeComment()
    }
  }

  handleInputChange(field) {
    return (e) => {
      this.setState({
        [field]: e.target.value,
      })
    }
  }
  saveComment() {
    try {
      this.props.saveComment({
        filename: this.props.filename,
        title: this.state.title,
        body: this.state.body,
        selectors: this.props.selectors,
      })
      this.props.highlightSelectors()
      this.props.closeComment()
      this.setState({
        title: '',
        body: '',
      })
    } catch (e) {
      console.error(e)
    }
  }


  render() {
    const { title, body } = this.state
    const { showComment, closeComment } = this.props
    return (
      <div className={`pdf-comment-wrapper ${showComment ? 'active' : ''}`} style={{ padding: '12px 24px' }}>
        <Button type="danger" shape="circle" icon="delete" onClick={closeComment}  />
        <div style={{ margin: '12px 0' }} />
        <h2>阅读随笔</h2>
        <div style={{ margin: '3px 0' }} />
        <Input placeholder="标题" value={title} onChange={this.handleInputChange('title')} />
        <div style={{ margin: '6px 0' }} />
        <TextArea rows={6} value={body} onChange={this.handleInputChange('body')} placeholder="内容" />
        <div style={{ margin: '12px 0' }} />
        <Button icon="save" onClick={this.saveComment} type="primary">保存</Button>
      </div>
    )
  }
}

Comment.propTypes = propTypes

export default Comment
