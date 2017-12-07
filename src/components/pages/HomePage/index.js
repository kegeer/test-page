import React from 'react'
import { Col, Row } from 'antd'

import { BasicLayout } from 'components'
import { PapersList } from 'containers'

const HomePage = () => {
  return (
    <BasicLayout>
      <Row>
        <Col span={16} offset={4}>
          <PapersList />
        </Col>
      </Row>
    </BasicLayout>
  )
}

export default HomePage
