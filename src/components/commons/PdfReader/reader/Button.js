import React from 'react'
import PropTypes from 'prop-types'
import { Button as Button2 } from 'antd'

const Button = ({
  classname, icon, clickHandler,
}) => (
  <Button2 className={classname} onClick={clickHandler} icon={icon} />
)

Button.propTypes = {
  classname: PropTypes.string,
  icon: PropTypes.string,
  clickHandler: PropTypes.func.isRequired,
}

Button.defaultProps = {
  classname: '',
  icon: 'user',
}

export default Button
