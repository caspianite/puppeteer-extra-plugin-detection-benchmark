'use strict'

const test = require('ava')

test.beforeEach(t => {
    // Make sure we work with pristine modules
    delete require.cache[require.resolve('puppeteer-extra')]
  })


test('will get a failed result on example.com', async t => {
    let y = false; 
    let isFinished = false;
    const puppeteer = require('puppeteer-extra')
    const p = require('../index')
    puppeteer.use(
        p({targetsObject: [

            {
                "title": "example (for testing)",
                "link": "https://example.com/",
                "failureSelectorString": "xpath//html/body/div/p[2]/a",
                "successSelectorString": "xpath///a[@href='/ssignup']"
            }
  
      
  
        ]
    }))


    const browser = await puppeteer.launch({ headless: false })   
    const page = await browser.newPage()
    let x = await page.benchmark()
    console.log(x[0]["result"])  
    if (x[0]["result"] == "failed", "passed") {
        y = true;
    }
    await t.true(y, "passed") 
    

    })




  

  
  

  