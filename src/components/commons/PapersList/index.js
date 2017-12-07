import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
// import qs from 'qs'
import { Avatar, Card, List, Icon, Button, Tag } from 'antd'
import './index.less'

const propTypes = {
  getPapersList: PropTypes.func.isRequired,
  papersList: PropTypes.arrayOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
}

const LIMIT = 15

class PapersList extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      limit: LIMIT,
      page: 1,
    }
  }
  componentDidMount() {
    this.props.getPapersList({
      limit: this.state.limit,
      page: this.state.page,
    })
  }

  fetchMore() {
    this.props.getPapersList({
      limit: LIMIT,
      page: Math.floor(this.props.papersList.length / LIMIT) + 1,
    })
  }
  render() {
    const { papersList, loading } = this.props
    console.log(papersList, 'papersList')

    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 8 }} /> { text }
      </span>
    )

    const loadMore = papersList.length > 0 ? (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button onClick={this.fetchMore} style={{ paddingLeft: 48, paddingRight: 48 }}>
          { loading ? <span><Icon type="loading" />加载中...</span> : '加载更多'}
        </Button>
      </div>
    ) : null


    const ListContent = ({
      data: {
        description, createdAt, author: { image, username }, papers,
      },
    }) => (
      <div className="listContent">
        <div className="extra">
          {
            image ? <Avatar src={image} size="large" /> : <Avatar icon="user" size="large" />
          }
          <span className="meta">
            <a href={`/profiles/${username}`}>{username}</a>
          发表在
            <em>{ moment(createdAt).format('YYYY-MM-DD hh:mm')}</em>
          </span>


        </div>
        <div className="description">
          {description}
        </div>
        <div className="papersList">
          { papers.map(file =>
            (
              <span key={file.filename}>
                <Icon type="file-pdf" style={{ fontSize: 18, color: '#08c' }} />
                <a href={`/papers/${file.filename.split('.')[0]}`}>{file.original_filename}</a>
              </span>))}
        </div>
      </div>
    )
    return (
      <div>
        <Card
          style={{ marginTop: 24 }}
          bordered={false}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
        >
          <List
            size="large"
            loading={papersList.length === 0 ? loading : false}
            rowKey="id"
            itemLayout="vertical"
            loadMore={loadMore}
            dataSource={papersList}
            renderItem={item => (
              <List.Item
                key={item.id}
                actions={[
                  <IconText type="star-o" text={item.star} />,
                  <IconText type="like-o" text={item.like} />,
                  <IconText type="message" text={item.message} />,
                ]}
                extra={
                  <div className="listItemExtra">
                    <Button type="secondary">Follow</Button>
                  </div>
                }
              >
                <ListContent data={item} />
              </List.Item>
            )}
          />
        </Card>
      </div>
    )
  }
}

PapersList.propTypes = propTypes

export default PapersList
