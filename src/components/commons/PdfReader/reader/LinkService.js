class LinkService {
  constructor(onLinkCreate, scrollToAnchor) {
    this.onLinkCreate = onLinkCreate;
    this.scrollToAnchor = scrollToAnchor;
  }
  getDestinationHash = (dest) => { return this.onLinkCreate({ dest }); }
  navigateTo = (dest) => {
    const anchor = Array.isArray(dest) ? `pdfdr:${JSON.stringify(dest)}` : `pdfd: ${dest}`;
    this.scrollToAnchor(anchor);
  }
}

export default LinkService
