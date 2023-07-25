'use strict'

const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')




const defaultTargetsObj = require('./targets.json')

/**
 * benchmark your detection rate against a list of target websites
 * 
 * @param {Object} page - puppeteer page
 * @param {Object} opts - Options
 * @param {number} opts.timeout - timeout for the test selector in ms
 * @param {String} opts.discordWebhookURL - if used (not undefined) will send detected results to the discord webhook
 * @param {Object} opts.targetsObject - targets json object
 * @param {Function} opts.hookFunction - optional function to synchronously call if browser is detected, no arguments can be passed
 * @param {boolean} opts.interceptResources - scrape all the .js URLs of the target 
 * @returns {Array} returns a list of results.
 * 
 * @example
 * 
 * const puppeteer = require('puppeteer-extra')
 * const p = require('./index')
 * 
 * puppeteer.use(p({}))
 * 
 * puppeteer.launch({ headless: false }).then(async browser => {
 *   const page = await browser.newPage()
 *   
 * 
 *   let x = await page.benchmark()
 *   console.log(x)
 * })
 * 
 * 
 */


class Plugin extends PuppeteerExtraPlugin {
  constructor (opts = {}) {
    super(opts)
  }

  get name () {
    return 'detection-benchmark'
  }

  get defaults () {
    return {
      timeout: 5000,
      discordWebhookURL: undefined,
      targetsObject: defaultTargetsObj,
      hookFunction: null,
      interceptResources: true

    }
  }

  async getIPv4 (page) {
    const ip = await page.evaluate(async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        return data.ip
      } catch (error) {
        console.error('Error fetching IP:', error)
      }
    })
    return ip
  }

  async benchmark (page, options) {
    if (options.interceptResources) {
      await page.setRequestInterception(true)
    }

    const results = []

    for (const entry of options.targetsObject) {
      const result = {
        title: entry.title,
        link: entry.link,
        result: undefined
      }

      const resources = []

      if (options.interceptResources) {
        page.on('request', interceptedRequest => {
          if (interceptedRequest.url().includes('.js')) {
            resources.push(interceptedRequest.url())
          }

          interceptedRequest.continue()
        })
      }

      
      console.log("began checking", entry.link)
      await page.goto(entry.link)

      try {
        console.log("checking for success selector", entry.successSelectorString)
        if (await page.waitForSelector(entry.successSelectorString, { timeout: options.targetsObject.timeout })) {
          
          result.result = 'success'
        }
      } catch {
        result.result = 'ambiguous'

        console.log("checking for failure selector", entry.successSelectorString)
        
        try {

          if (await page.waitForSelector(entry.failureSelectorString, { timeout: options.targetsObject.timeout })) {
            console.log("found failure selector", entry.failureSelectorString)
            result.result = 'failure'
          }

        }
        catch {
          console.log("checked for failure selector", entry.failureSelectorString)

        }


        if (options.hookFunction instanceof Function) {
          await options.hookFunction()
        }

        result.screenshot = await page.screenshot()
        result.ip = await page.getIPv4(page)
        result.selector_tried = entry.successSelectorString
        if (options.interceptResources) {
          result.resources = resources
        }
      }

      setTimeout(() => {}, 100)



      results.push(result)
      console.log("finished checking", entry.link)
    }
    console.log(results)
    return results
  }

  async onPageCreated (page) {
    page.getIPv4 = this.getIPv4.bind(page, page)
    page.benchmark = this.benchmark.bind(page, page, this.opts)
  }
}

module.exports = function (pluginConfig) {
  return new Plugin(pluginConfig)
}
