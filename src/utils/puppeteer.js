import puppeteer from 'puppeteer'
import { pollUntilTrue, waitForSelector } from './browser'
import { info } from './log'

export async function createBrowserWithPage (isHeadless, url) {
  info(`Launching browser to ${url}`)

  const browser = await puppeteer.launch({
    headless: isHeadless === true ? 'new' : false,
    protocolTimeout: 5000000,
    timeout: 500000
  })

  const page = await browser.newPage()

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
