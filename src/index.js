const puppeteer = require('puppeteer')
const { createEmail } = require('./utils/generator')
const { waitForSelector, pollUntilTrue } = require('./utils/browser')

const WOODHOUSE_URL = 'http://woodhouse-pr1691.nestiostaging.com/6/welcome'

const FIRST_NAME = 'John'
const LAST_NAME = 'Doe'

const STEP_APPLICATION = {
  firstName: FIRST_NAME,
  lastName: LAST_NAME,
  email: createEmail(FIRST_NAME, LAST_NAME),
  phone: '5555555555',
  birthday: '01011990',
  password: 'home1234',
  acceptsTexts: true
}

const STEP_CURRENT_ADDRESS = {
  address: '1234 Main St',
  floor: '1',
  city: 'Denver',
  state: 'CO',
  zip: '80202'
}

// TODO: add moveInDate
const STEP_LEASE_TERMS = {
  unit: 'FF15',
  terms: '18'
}

async function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// TODO: get rid of xpaths
async function stepAccept (page) {
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
}

async function stepRentalApplication (page) {
  await page.waitForSelector('input[name="first_name"]')

  await page.type('input[name="first_name"]', STEP_APPLICATION.firstName)
  await page.type('input[name="last_name"]', STEP_APPLICATION.lastName)
  await page.type('input[name="email"]', STEP_APPLICATION.email)
  await page.type('input[name="phone_number"]', STEP_APPLICATION.phone)
  await page.type('#birthday-picker', STEP_APPLICATION.birthday)
  await page.type('input[name="password"]', STEP_APPLICATION.password)

  if (STEP_APPLICATION.acceptsTexts) {
    await page.click('input[name="sms_opt_in"]')
  }

  await page.click('button[type="submit"]')
}

async function stepCurrentAddress (page) {
  await page.waitForSelector('input[name="address_street"]')

  await page.type('input[name="address_street"]', STEP_CURRENT_ADDRESS.address)
  await page.type('input[name="address_line_2"]', STEP_CURRENT_ADDRESS.floor)
  await page.type('input[name="address_city"]', STEP_CURRENT_ADDRESS.city)
  await page.type('input[name="address_state"]', STEP_CURRENT_ADDRESS.state)
  await page.type('input[name="address_postal_code"]', STEP_CURRENT_ADDRESS.zip)

  // Submit the form
  await page.keyboard.press('Enter')
}

// TODO: customize move-in-date
async function stepLeaseTerms (page) {
  async function selectUnit () {
    await page.evaluate(({ STEP_LEASE_TERMS }) => {
      return new Promise((resolve, reject) => {
        (async () => {
          const btnOpenSelectUnit = document.querySelector('button.MuiAutocomplete-popupIndicator')
          btnOpenSelectUnit.click()

          const unitOptionsList = await waitForSelector('ul.MuiAutocomplete-listbox')
          const unitOptions = Array.from(unitOptionsList.querySelectorAll('li'))

          const desiredUnitOption = STEP_LEASE_TERMS.unit
            ? unitOptions.find(o => o.textContent.includes(STEP_LEASE_TERMS.unit))
            : unitOptions[0]

          if (!desiredUnitOption) {
            return reject(new Error(`Could not find unit option ${STEP_LEASE_TERMS.unit}. Is it available?`))
          }

          desiredUnitOption.click()
          resolve()
        })()
      })
    }, {
      STEP_LEASE_TERMS
    })
  }

  async function selectLeaseTerm () {
    await page.evaluate(({ STEP_LEASE_TERMS }) => {
      return new Promise((resolve, reject) => {
        (async () => {
          const btnOpenLeaseTerms = document.querySelector('#lease-term')
          btnOpenLeaseTerms.click()

          const leaseTermsList = await waitForSelector('#menu-lease_term ul')

          // The list goes into a loading state first, so we need to wait for it to finish, we can do that by querying for the second li
          await waitForSelector('#menu-lease_term ul li:nth-child(2)')

          const leaseTermsOptions = Array.from(leaseTermsList.querySelectorAll('li'))

          const desiredLeaseTermOption = STEP_LEASE_TERMS.terms
            ? leaseTermsOptions.find(o => o.dataset.value === STEP_LEASE_TERMS.terms)
            : leaseTermsOptions.find(o => o.dataset.value === '12') // Default 12 months

          if (!desiredLeaseTermOption) {
            return reject(new Error(`Could not find lease term option ${STEP_LEASE_TERMS.terms}. Is it available?`))
          }

          desiredLeaseTermOption.click()
          resolve()
        })()
      })
    }, {
      STEP_LEASE_TERMS
    })
  }

  async function submit () {
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        (async () => {
          await waitForSelector('button[type="submit"]')

          const buttons = Array.from(document.querySelectorAll('button'))
          const btnAgree = buttons.find((btn) => btn.textContent.includes('Continue'))

          btnAgree.click()
          resolve()
        })()
      })
    })
  }

  await page.waitForSelector('#move-in-date-label')

  await selectUnit()
  await selectLeaseTerm()
  await submit()
}

// TODO: make it possible possible to select rental options now (add a person, gurantor, pet, parking, storage, wine cooler etc.)
async function stepSetupRentalProfile (page) {
  await page.waitForSelector('#co_applicants')

  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      (async () => {
        await waitForSelector('button[type="submit"]')

        const buttons = Array.from(document.querySelectorAll('button'))
        const btnAgree = buttons.find((btn) => btn.textContent.includes('Continue'))

        btnAgree.click()
        resolve()
      })()
    })
  })
}

async function stepVerifyIncome (page) {
  await page.waitForSelector('img[alt="padlock"]')

  await page.evaluate(() => {
    return new Promise((resolve) => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const btnNoIncome = buttons.find((btn) => btn.textContent.includes("I Don't Have Income or Assets"))
      btnNoIncome.click()
      resolve()
    })
  })
}

async function stepConfirmIncome (page) {
  await page.waitForSelector('img[alt="coin"]')

  await page.evaluate(() => {
    return new Promise((resolve) => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const btnSubmitConfirmIncome = buttons.find((btn) => btn.textContent.includes('Continue'))
      btnSubmitConfirmIncome.click()
      resolve()
    })
  })
}

async function stepScreeningDetails (page) {
  await page.waitForSelector('img[alt="portfolio"]')

  await page.evaluate(() => {
    return new Promise((resolve) => {
      (async () => {
        const radioNoSecurityNumber = await waitForSelector('input[value="false"]')
        radioNoSecurityNumber.click()

        const checkAuthorizeFunnel = await waitForSelector('input[name="disclaimer"]')
        checkAuthorizeFunnel.click()

        const btnSubmitScreening = await waitForSelector('button[type="submit"]')
        btnSubmitScreening.click()

        resolve()
      })()
    })
  })
}

async function stepApplicationPayments (page) {
  await page.waitForSelector('img[alt="wallet"]')

  await page.evaluate(() => {
    return new Promise((resolve) => {
      const btnSubmitApplicationPayments = document.querySelector('button[type="submit"]')
      btnSubmitApplicationPayments.click()
      resolve()
    })
  })
}

async function stepPaymentTerms (page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      (async () => {
        const btnSubmit = document.querySelector('button[type="submit"]')
        await pollUntilTrue(() => btnSubmit.disabled === false)

        btnSubmit.click()
      })()
    })
  })
}

async function main () {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  await page.goto(WOODHOUSE_URL)

  await page.addScriptTag({
    content: `${waitForSelector} ${pollUntilTrue}`
  })

  await page.setViewport({ width: 1080, height: 1024 })

  await stepAccept(page)
  await stepRentalApplication(page)
  await stepCurrentAddress(page)
  await stepLeaseTerms(page)
  await stepSetupRentalProfile(page)
  await stepVerifyIncome(page)
  await stepConfirmIncome(page)
  await stepScreeningDetails(page)
  await stepApplicationPayments(page)
  await stepPaymentTerms(page)

  await wait(500000000)
}

main()
