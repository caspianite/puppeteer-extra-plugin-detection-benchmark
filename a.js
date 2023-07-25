let y = false; 
const puppeteer = require('puppeteer-extra')
const p = require('./index')

async function a() {

  puppeteer.use(
    p({targetsObject: [
        {
            "title": "example (for testing)",
            "link": "https://pastebin.com/",
            "failureSelectorString": "xpath//html/body/div/p",
            "successSelectorString": "xpath///a[@href='/ssig"
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

}

a()
