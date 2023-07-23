'use strict'

const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

const defaultTargetsObj = require('./targets.json')

class Plugin extends PuppeteerExtraPlugin {


    constructor(opts = {}) {
        super(opts)

      }

      get name() {
        return 'detection-benchmark'
      }

      get defaults() {
        return {
            timeout: 5000,
            useDiscordWebhook: false,
            discordWebhookURL: undefined,
            targetsObject: defaultTargetsObj,
            hookFunction: null
            
        }

      }

  

      async getIPv4(page) {
        let ip = await page.evaluate(async () => {
          
            try {
              const response = await fetch('https://api.ipify.org?format=json');
              const data = await response.json();
              return data.ip;
            } catch (error) {
              console.error('Error fetching IP:', error);
            }
        })
        return ip
      } 

      async benchmark(page, options) {

        let results = []


        for(let entry of options.targetsObject) {
          let result = {
            title: entry["title"], 
            link: entry["link"],
            result: undefined
          }

          console.log(entry["link"])
          await page.goto(entry["link"])


          try {

            if (await page.waitForSelector(entry["successSelectorString"], {timeout: options.targetsObject.timeout})) {
              result["result"] = "success"
            }

          }

          catch {
            
            result["result"] = "ambiguous"

            if (page.waitForSelector(entry["failureSelectorString"], {timeout: (options.targetsObject.timeout / 2)})) {
              result["result"] = "failure"

              
            
            }

            if (options.hookFunction instanceof Function) {
              await options.hookFunction()
            }

            result["screenshot"] = await page.screenshot()
            result["ip"] = await page.getIPv4(page)
            result["selector_tried"] = entry["successSelectorString"]

            

          }

          setTimeout(() => {}, 100)

          results.push(result)


        }
        
        return results
      }

      async onPageCreated(page) {
        page.getIPv4 = this.getIPv4.bind(page, page)
        page.benchmark = this.benchmark.bind(page, page, this.opts)

      }
}


module.exports = function(pluginConfig) {
  return new Plugin(pluginConfig)
}