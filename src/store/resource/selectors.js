export const initialState = {}
export const initialResourceState = {
  list: [],
  detail: null,
  loading: false,
}

export const getResourceState = (state = initialState, resource) => state[resource] || initialResourceState

export const getList = (state = initialState, resource) => getResourceState(state, resource).list

// export const getListCount = (state = initialState, resource) => getResourceState(state, resource).listCount

export const getDetail = (state = initialState, resource) => getResourceState(state, resource).detail


export const getLoading = (state = initialState, resource) => getResourceState(state, resource).loading
