import React from 'react'
import { Switch, Route } from 'react-router-dom'

import {
  HomePage,
  PaperPage,
} from 'components'


const App = () => {
  return (
    <Switch>
      <Route path="/" component={HomePage} exact />
      <Route path="/papers/:filename" component={PaperPage} />
    </Switch>
  )
}

export default App
