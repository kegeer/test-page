/**
 * Get the page viewport
 * @param { PageProxy } page
 * @param { Number } scale
 * @param { Number } rotate
 */

export const getPixelRatio = (canvas) => {
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1
  return dpr / bsr
}


export const getViewerport = (page, scale = 1, rotate = 0) => {
  const pixelRatio = window.devicePixelRatio || 1
  const viewport = page.getViewport(
    scale * pixelRatio,
    rotate,
  )

  const viewportDefaultRatio = page.getViewport(
    scale,
    rotate,
  )

  return {
    viewport,
    viewportDefaultRatio,
  }
}


export const getMinZoomScale = (page, container) => {
  const { viewportDefaultRatio } = getViewerport(page)
  const containerHeight = container.offsetHeight * 0.9
  const pageHeight = viewportDefaultRatio.height
  return containerHeight / pageHeight
}

export const getFitWidthScale = (page, container) => {
  const { viewportDefaultRatio } = getViewerport(page)
  const containerWidth = container.offsetWidth * 0.9
  const pageWidth = viewportDefaultRatio.width
  return containerWidth / pageWidth
}
