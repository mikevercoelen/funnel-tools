const puppeteer = require('puppeteer')

const WOODHOUSE_URL = 'http://woodhouse-pr1691.nestiostaging.com/6/welcome'

async function main () {
  const browser = await puppeteer.launch({
    headless: 'new'
  })

  const page = await browser.newPage()

  await page.goto(WOODHOUSE_URL)

  await page.setViewport({ width: 1920, height: 1080 })
}

main()
