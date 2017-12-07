import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Upload, Input } from 'antd'
import { apiUrl } from 'config'
import pick from 'lodash/pick'

const { TextArea } = Input

const propTypes = {
  sharePaper: PropTypes.func.isRequired,
}

class PaperShare extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      confirmLoading: false,
      description: '',
      fileList: [],
    }
  }

  showPaperModal = () => {
    this.setState({
      visible: true,
    })
  }
  handleCancel =() => {
    this.setState({
      description: '',
      fileList: [],
      visible: false,
    })
  }
  handleOk = () => {
    const form = {
      description: this.state.description,
      fileList: this.state.fileList,
    }
    this.props.sharePaper(form)
    this.handleCancel()
  }

  handleInputChange = (e) => {
    this.setState({
      description: e.target.value,
    })
  }
  handleFileChange = (info) => {
    let { fileList } = info
    fileList = fileList.map((file) => {
      // const resFile = {}
      if (file.response && file.response.paper) {
        file.uid = file.response.paper.id
        file.name = file.response.paper.originalFilename
        file.status = 'done'
      }
      file = pick(file, ['uid', 'name', 'status'])
      return file
    })
    this.setState({ fileList })
  }
  render() {
    const {
      visible, confirmLoading, description, fileList,
    } = this.state

    return (
      <div style={{ float: 'right' }}>
        <Button type="primary" icon="paper-clip" size="large" onClick={this.showPaperModal}>推荐文章</Button>
        <Modal
          title="推荐文章"
          width={800}
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <TextArea rows={4} value={description} onChange={this.handleInputChange} />
          <Upload
            action={`${apiUrl}/papers`}
            listType="text"
            fileList={fileList}
            multiple
            onChange={this.handleFileChange}
          >
            <Button icon="upload" type="primary" size="large" style={{ marginTop: 8 }}>添加文章</Button>
          </Upload>
        </Modal>
      </div>

    )
  }
}

PaperShare.propTypes = propTypes

export default PaperShare
