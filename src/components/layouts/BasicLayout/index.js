import React from 'react'
import PropTypes from 'prop-types'
import { Layout } from 'antd'
import { PageHeader } from 'components'
import './BasicLayout.less'

const {
  Header, Content, Footer,
} = Layout


const propTypes = {
  header: PropTypes.node,
  sider: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.any,
}

const BasicLayout = ({
  children, footer,
}) => {
  return (
    <Layout>
      <Layout>
        <Header style={{ position: 'fixed', width: '100%', padding: '0px 100px', zIndex: 9999 }}>
          <PageHeader />
        </Header>

        <Content style={{ marginTop: 64 }}>
          { children }
        </Content>
        { footer &&
          <Footer>
            { footer }
          </Footer>
        }
      </Layout>
    </Layout>
  )
}

BasicLayout.propTypes = propTypes

export default BasicLayout
