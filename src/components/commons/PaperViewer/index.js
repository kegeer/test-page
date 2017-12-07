import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { PdfReader } from 'components'

const propTypes = {
  pdf: PropTypes.any.isRequired,
}

class PaperViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
    }
  }
  componentDidMount() {
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
    // const { pdf } = this.props
    return file &&
      (<PdfReader
        file={file}
        renderType="canvas"
        scale={1.5}
      />)
  }
}

PaperViewer.propTypes = propTypes

export default PaperViewer
