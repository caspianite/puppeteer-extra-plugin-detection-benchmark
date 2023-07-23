const puppeteer = require('puppeteer-extra')
const p = require('./index')

puppeteer.use(p({}))

puppeteer.launch({headless: false}).then(async browser => {
  const page = await browser.newPage()
  //await page.setViewport({ width: 800, height: 600 })

  await page.benchmark()

  

  
})