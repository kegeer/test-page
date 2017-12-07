import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon, Col, Row } from 'antd'
import { PaperShare } from 'containers'
import { Link, withRouter } from 'react-router-dom'
import './PageHeader.less'

const propTypes = {
  match: PropTypes.object,
}


class PageHeader extends PureComponent {
  constructor(props) {
    super(props)
    const { path } = this.props.match
    this.state = {
      current: path,
    }
  }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    })
  }

  render() {
    return (
        <Row>
          <Col span={6}>
            <h1>爱学术</h1>
          </Col>
          <Col span={6} style={{ float: 'right' }}>
            <PaperShare />
          </Col>
          <Col span={12}>
            <Menu
              onClick={this.handleClick}
              selectedKeys={[this.state.current]}
              mode="horizontal"
              id="nav"
            >
              <Menu.Item key="/">
                <Link to="/">
                  <Icon type="home" />
                  主页
                </Link>
              </Menu.Item>

              <Menu.Item key="/publication">
                <Link to="/publication"><Icon type="book" />出版物</Link>
              </Menu.Item>
              <Menu.Item key="/papers">
                <Link to="/papers"><Icon type="file" />文章</Link>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>

    )
  }
}

PageHeader.propTypes = propTypes

export default withRouter(PageHeader)
