const puppeteer = require('puppeteer')
const { waitForSelector, pollUntilTrue } = require('./browser')
const { info } = require('./log')

async function createBrowserWithPage (isHeadless, url) {
  info(`Launching browser to ${url}`)

  const browser = await puppeteer.launch({
    headless: isHeadless === true ? 'new' : false,
    protocolTimeout: 5000000,
    timeout: 500000
  })

  const page = await browser.newPage()

  // This is so Google Authentication works
  await page.setBypassCSP(true)

  await page.goto(url)

  await page.addScriptTag({
    content: `${waitForSelector} ${pollUntilTrue}`
  })

  await page.setViewport({ width: 1080, height: 1024 })

  info('Browser launched')

  return { page, browser }
}

module.exports = {
  createBrowserWithPage
}
