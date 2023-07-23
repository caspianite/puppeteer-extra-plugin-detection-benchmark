const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

class Plugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts)
  }

  get name() {
    return 'hello-world'
  }

  async onPageCreated(page) {
    this.debug('page created', page.url())
    const ua = await page.browser().userAgent()
    this.debug('user agent', ua)
  }
}

module.exports = function(pluginConfig) {
  return new Plugin(pluginConfig)
}


