import { initialState } from './selectors'
import { MODAL_HIDE, MODAL_SHOW } from './actions'

export default (state = initialState, { type, payload = {} }) => {
  switch (type) {
    case MODAL_SHOW:
      return {
        ...state,
        [payload.name]: true,
      }
    case MODAL_HIDE:
      if (payload.name) {
        return {
          ...state,
          [payload.name]: false,
        }
      }
      return initialState
    default:
      return state
  }
}
