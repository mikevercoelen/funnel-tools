const { info } = require('./utils/log')
const { createBrowserWithPage } = require('./utils/puppeteer')

async function stepLogin (page, {
  email,
  password
}) {
  await page.waitForSelector('#id_username')
  await page.type('#id_username', email)
  await page.type('#id_password', password)
  await page.keyboard.press('Enter')
}

async function approveApplicant ({
  isHeadless = false,
  chuckUrl,
  email
}) {
  const { page, browser } = await createBrowserWithPage(isHeadless, chuckUrl)

  await stepLogin(page, {
    email: 'teamalpha@nestio.com',
    password: 'test'
  })

  info('✅ Logged in')

  await browser.close()
}

module.exports = {
  approveApplicant
}
