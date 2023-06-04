const puppeteer = require('puppeteer')
const { waitForSelector, pollUntilTrue } = require('./utils/browser')

const STEP_PAY = {
  // TODO: for some reason, the card number needs a first digit that can be ignored
  cardNumber: '44242424242424242',

  // TODO: the first digit will always be a 0
  expiry: '1229',

  // TODO: needs an extra digit that can be ignored
  cvc: '2222'
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

async function stepRentalApplication (page, {
  firstName,
  lastName,
  email,
  phone,
  birthday,
  password,
  acceptsTexts
}) {
  await page.waitForSelector('input[name="first_name"]')

  await page.type('input[name="first_name"]', firstName)
  await page.type('input[name="last_name"]', lastName)
  await page.type('input[name="email"]', email)
  await page.type('input[name="phone_number"]', phone)
  await page.type('#birthday-picker', birthday)
  await page.type('input[name="password"]', password)

  if (acceptsTexts) {
    await page.click('input[name="sms_opt_in"]')
  }

  await page.click('button[type="submit"]')
}

async function stepCurrentAddress (page, {
  address,
  floor,
  city,
  state,
  zip
}) {
  await page.waitForSelector('input[name="address_street"]')

  await page.type('input[name="address_street"]', address)
  await page.type('input[name="address_line_2"]', floor)
  await page.type('input[name="address_city"]', city)
  await page.type('input[name="address_state"]', state)
  await page.type('input[name="address_postal_code"]', zip)

  // Submit the form
  await page.keyboard.press('Enter')
}

// TODO: customize move-in-date
async function stepLeaseTerms (page, {
  unit,
  terms
}) {
  async function selectUnit () {
    await page.evaluate((unit) => {
      return new Promise((resolve, reject) => {
        (async () => {
          const btnOpenSelectUnit = document.querySelector('button.MuiAutocomplete-popupIndicator')
          btnOpenSelectUnit.click()

          const unitOptionsList = await waitForSelector('ul.MuiAutocomplete-listbox')
          const unitOptions = Array.from(unitOptionsList.querySelectorAll('li'))

          let desiredUnitOption = unitOptions[0]

          if (unit && unit !== '') {
            desiredUnitOption = unitOptions.find(o => o.textContent.includes(unit))
          }

          if (!desiredUnitOption) {
            const possibleOptions = unitOptions.map(o => o.textContent).join(', ')

            return reject(new Error(`Could not find unit option ${unit}. Is it available? These are available: ${possibleOptions}`))
          }

          desiredUnitOption.click()
          resolve()
        })()
      })
    }, unit)
  }

  async function selectLeaseTerm () {
    await page.evaluate((terms) => {
      return new Promise((resolve, reject) => {
        (async () => {
          const btnOpenLeaseTerms = document.querySelector('#lease-term')
          btnOpenLeaseTerms.click()

          const leaseTermsList = await waitForSelector('#menu-lease_term ul')

          // The list goes into a loading state first, so we need to wait for it to finish, we can do that by querying for the second li
          await waitForSelector('#menu-lease_term ul li:nth-child(2)')

          const leaseTermsOptions = Array.from(leaseTermsList.querySelectorAll('li'))

          const desiredLeaseTermOption = terms
            ? leaseTermsOptions.find(o => o.dataset.value === terms)
            : leaseTermsOptions.find(o => o.dataset.value === '12') // Default 12 months

          if (!desiredLeaseTermOption) {
            const possibleOptions = leaseTermsOptions.map(o => o.textContent).join(', ')

            return reject(new Error(`Could not find lease term option ${terms}. Is it available? These are available: ${possibleOptions}`))
          }

          desiredLeaseTermOption.click()
          resolve()
        })()
      })
    }, terms)
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
        resolve()
      })()
    })
  })
}

async function stepPay (page) {
  async function selectPaymentMethod () {
    await page.waitForSelector('#payment-method-selector')

    await page.evaluate(() => {
      return new Promise((resolve) => {
        (async () => {
          function openMenu () {
            const paymentMethodSelector = document.querySelector('#payment-method-selector')
            const e = new Event('keydown', {
              bubbles: true
            })

            e.key = 'ArrowDown'
            paymentMethodSelector.dispatchEvent(e)
          }

          async function selectCard () {
            const paymentMethodOptionsList = await waitForSelector('.MuiPopover-root')
            const paymentMethodOptions = Array.from(paymentMethodOptionsList.querySelectorAll('li'))
            const cardOption = paymentMethodOptions.find(o => o.dataset.value === 'card')
            cardOption.click()
          }

          function focusPaymentMethod () {
            const paymentMethodSelector = document.querySelector('#payment-method-selector')
            paymentMethodSelector.focus()
          }

          async function waitForCreditcardNumber () {
            // wait for an element on the page that has label content "Credit/Debit Card Number"
            return pollUntilTrue(() => {
              const labels = Array.from(document.querySelectorAll('label'))
              const creditCardNumberLabel = labels.find(l => l.textContent.includes('Credit/Debit Card Number'))
              return !!creditCardNumberLabel
            })
          }

          openMenu()
          await selectCard()
          await waitForCreditcardNumber()
          focusPaymentMethod()

          resolve()
        })()
      })
    })

    await page.waitForSelector('.StripeElement')

    // TODO: this number might be flaky, depending on the network / speed of machine?
    await wait(1500)

    await page.keyboard.press('Tab')
    await page.keyboard.type(STEP_PAY.cardNumber, {
      delay: 150
    })

    await page.keyboard.press('Tab')
    await page.keyboard.type(STEP_PAY.expiry, {
      delay: 50
    })

    await page.keyboard.press('Tab')
    await page.keyboard.type(STEP_PAY.cvc, {
      delay: 50
    })

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
  }

  await selectPaymentMethod()
}

async function stepPaymentSuccessful (page) {
  await page.waitForSelector('img[alt="receipt"]')

  await page.evaluate(() => {
    return new Promise((resolve) => {
      const btnSubmit = document.querySelector('button[type="submit"]')
      btnSubmit.click()
      resolve()
    })
  })
}

async function stepIdVerify (page) {
  async function requestIdVerify () {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        (async () => {
          await pollUntilTrue(() => {
            const buttons = Array.from(document.querySelectorAll('button'))
            const btnAgree = buttons.find((btn) => btn.textContent.includes('Request Text'))
            return !!btnAgree
          })

          const btnSubmit = document.querySelector('button[type="submit"]')
          btnSubmit.click()
          resolve()
        })()
      })
    })
  }

  async function submitVerifyCode () {
    await page.waitForSelector('input[name="code"]')
    await page.type('input[name="code"]', '12345')
    await page.keyboard.press('Enter')
  }

  await requestIdVerify()
  await submitVerifyCode()
}

async function createApplicant ({
  woodhouseUrl,
  firstName,
  lastName,
  email,
  phone,
  birthday,
  password,
  acceptsTexts,
  address,
  floor,
  city,
  state,
  zip,
  unit,
  terms
}) {
  const browser = await puppeteer.launch({
    headless: false,
    protocolTimeout: 5000000,
    timeout: 500000
  })

  const page = await browser.newPage()

  await page.goto(woodhouseUrl)

  await page.addScriptTag({
    content: `${waitForSelector} ${pollUntilTrue}`
  })

  await page.setViewport({ width: 1080, height: 1024 })

  await stepAccept(page)

  await stepRentalApplication(page, {
    firstName,
    lastName,
    email,
    phone,
    birthday,
    password,
    acceptsTexts
  })

  await stepCurrentAddress(page, {
    address,
    floor,
    city,
    state,
    zip
  })

  await stepLeaseTerms(page, {
    unit,
    terms
  })

  await stepSetupRentalProfile(page)
  await stepVerifyIncome(page)
  await stepConfirmIncome(page)
  await stepScreeningDetails(page)
  await stepApplicationPayments(page)
  await stepPaymentTerms(page)
  await stepPay(page)
  await stepPaymentSuccessful(page)
  await stepIdVerify(page)
  await wait(500000000)
}

module.exports = {
  createApplicant
}
