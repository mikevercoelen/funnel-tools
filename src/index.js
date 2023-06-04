const puppeteer = require('puppeteer')
const { createEmail } = require('./utils/generator')

const WOODHOUSE_URL = 'http://woodhouse-pr1691.nestiostaging.com/6/welcome'

const FIRST_NAME = 'John'
const LAST_NAME = 'Doe'

const USER_INFO = {
  firstName: FIRST_NAME,
  lastName: LAST_NAME,
  email: createEmail(FIRST_NAME, LAST_NAME),
  phone: '5555555555',
  birthday: '01011990',
  password: 'home1234',
  acceptsTexts: true
}

const USER_INFO_CURRENT_ADDRESS = {
  address: '1234 Main St',
  floor: '1',
  city: 'Denver',
  state: 'CO',
  zip: '80202'
}

const today = new Date()

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

// const USER_INFO_LEASE_TERMS = {
//   moveInDate: getDateFormatted(tomorrow),
//   unit: 'FF15',
//   leaseTerm: '12'
// }

async function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main () {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  await page.goto(WOODHOUSE_URL)

  await page.setViewport({ width: 1080, height: 1024 })

  // Click accept
  await page.waitForSelector('button[type="submit"]')
  await page.click('button[type="submit"]')

  // Accept Consent to Electronic Signature
  await page.waitForXPath('//*[@id="root"]/div/div[1]/div[2]/div[2]/div[1]/label[1]/span[1]')
  const [consent] = await page.$x('//*[@id="root"]/div/div[1]/div[2]/div[2]/div[1]/label[1]/span[1]')
  await consent.click()

  // Accept TOS
  await page.waitForXPath('//*[@id="root"]/div/div[1]/div[2]/div[2]/div[1]/label[2]/span[1]')
  const [tos] = await page.$x('//*[@id="root"]/div/div[1]/div[2]/div[2]/div[1]/label[2]/span[1]')
  await tos.click()

  // Click agree and continue
  await page.waitForXPath('//*[@id="root"]/div/div[1]/div[2]/div[2]/div[2]/button')
  const [agree] = await page.$x('//*[@id="root"]/div/div[1]/div[2]/div[2]/div[2]/button')
  await agree.click()

  // Fill in the user form
  await page.waitForSelector('input[name="first_name"]')
  await page.type('input[name="first_name"]', USER_INFO.firstName)
  await page.type('input[name="last_name"]', USER_INFO.lastName)
  await page.type('input[name="email"]', USER_INFO.email)
  await page.type('input[name="phone_number"]', USER_INFO.phone)
  await page.type('#birthday-picker', USER_INFO.birthday)
  await page.type('input[name="password"]', USER_INFO.password)

  if (USER_INFO.acceptsTexts) {
    await page.click('input[name="sms_opt_in"]')
  }

  // Get the element that is the submit button
  await page.click('button[type="submit"]')

  // Fill in current address
  await page.waitForSelector('input[name="address_street"]')
  await page.type('input[name="address_street"]', USER_INFO_CURRENT_ADDRESS.address)
  await page.type('input[name="address_line_2"]', USER_INFO_CURRENT_ADDRESS.floor)
  await page.type('input[name="address_city"]', USER_INFO_CURRENT_ADDRESS.city)
  await page.type('input[name="address_state"]', USER_INFO_CURRENT_ADDRESS.state)
  await page.type('input[name="address_postal_code"]', USER_INFO_CURRENT_ADDRESS.zip)

  // Submit the form
  await page.keyboard.press('Enter')

  // Fill in lease terms
  await page.waitForSelector('#move-in-date-label')
  // await page.type('#move-in-date', USER_INFO_LEASE_TERMS.moveInDate)

  // await page.waitForSelector('#lease-term')
  // await page.type('#lease-term', USER_INFO_LEASE_TERMS.leaseTerm)

  await wait(500)

  const btnOpenSelectUnit = await page.waitForSelector('button.MuiAutocomplete-popupIndicator')

  await btnOpenSelectUnit.click()

  const optionsList = await page.waitForSelector('ul.MuiAutocomplete-listbox')
  const options = await optionsList.$$('li')

  // await wait(2000)

  await options[0].click()

  // Select lease term
  const leaseTerm = await page.waitForSelector('#lease-term')
  await leaseTerm.click()

  await wait(1000)

  const leaseTermsList = await page.waitForSelector('#menu-lease_term ul')

  await wait(1000)

  const leaseTermOptions = await leaseTermsList.$$('li')
  await leaseTermOptions[2].click()

  await wait(1000)

  const btnSubmit = await page.waitForSelector('button[type="submit"]')
  await btnSubmit.click()

  // TODO: it's possible to select rental options now (add a person, gurantor, pet, parking, storage, wine cooler etc.)

  await page.waitForSelector('#co_applicants')
  const btnRentalProfileSubmit = await page.waitForSelector('button[type="submit"]')

  console.log(btnRentalProfileSubmit)

  await wait(1000)

  await btnRentalProfileSubmit.click()

  // Wait for the Verify income page, then click the "I don't have income or assets" button
  await page.waitForSelector('img[alt="padlock"]')

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const btnNoIncome = buttons.find((btn) => btn.textContent.includes("I Don't Have Income or Assets"))
    btnNoIncome.click()
  })

  await page.waitForSelector('img[alt="coin"]')

  await wait(1000)

  const btnSubmitConfirmIncome = await page.waitForSelector('button[type="submit"]')
  await btnSubmitConfirmIncome.click()

  await wait(2000)

  const radioNoSecurityNumber = await page.waitForSelector('input[value="false"]')
  await radioNoSecurityNumber.click()

  const checkAuthorizeFunnel = await page.waitForSelector('input[name="disclaimer"]')
  await checkAuthorizeFunnel.click()

  const btnSubmitScreening = await page.waitForSelector('button[type="submit"]')
  await btnSubmitScreening.click()

  await wait(1000)

  // Application Payments
  await page.waitForSelector('img[alt="wallet"]')

  const btnSubmitApplicationPayments = await page.waitForSelector('button[type="submit"]')
  await btnSubmitApplicationPayments.click()

  // Payment Terms

  await wait(3500)

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))

    console.log(buttons)

    const btnAgree = buttons.find((btn) => btn.textContent.includes('Agree and Continue'))

    console.log(btnAgree)

    btnAgree.click()
  })
}

main()
