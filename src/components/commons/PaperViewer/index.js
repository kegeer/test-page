import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { PdfReader } from 'components'

const propTypes = {
  filename: PropTypes.string,
  pdf: PropTypes.any.isRequired,
  annotations: PropTypes.arrayOf(PropTypes.any),
}

class PaperViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
    }
  }
  componentDidMount() {
    console.log(this.props.annotations, 'viewer')
    this.getFile()
  }

  async getFile() {
    const { pdf } = this.props
    const reader = new FileReader()
    reader.onload = () => (
      this.setState({
        file: new Uint8Array(reader.result),
      })
    )

    reader.readAsArrayBuffer(pdf)
  }

  render() {
    const { file } = this.state
    const { annotations} = this.props
    // const { pdf } = this.props
    return file &&
      (<PdfReader
        file={file}
        annotations={annotations}
        renderType="canvas"
        scale={1.5}
      />)
  }
}

PaperViewer.propTypes = propTypes

export default PaperViewer
