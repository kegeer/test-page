import React from 'react'
import PropTypes from 'prop-types'
import { Col, Row } from 'antd'

import { BasicLayout } from 'components'
import { PaperViewer } from 'containers'


const propTypes = {
  match: PropTypes.object.isRequired,
}
const PaperPage = ({ match }) => {
  const { filename } = match.params
  console.log(filename)
  return (
    <BasicLayout>
      <PaperViewer filename={filename} />
    </BasicLayout>
  )
}

PaperPage.propTypes = propTypes


export default PaperPage
