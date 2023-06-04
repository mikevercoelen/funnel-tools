const { createApplicant } = require('./createApplicant')
const { approveApplicant } = require('./approveApplicant')
const { promptMenu } = require('./utils/menu')
const { Task } = require('./constants/Task')

async function main () {
  const { task, options } = await promptMenu()

  switch (task) {
    case Task.APPROVE_APPLICANT:
      // TODO: Google Authentication is in between here, so need to figure out how to handle that

      return approveApplicant({
        isHeadless: options.isHeadless,
        chuckUrl: options.chuckUrl,
        email: options.email
      })
    case Task.CREATE_APPLICANT:

      // TODO: integrate actual options selected
      return createApplicant({
        isHeadless: options.isHeadless,
        woodhouseUrl: options.woodhouseUrl,
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        unit: options.unit,
        terms: options.terms,
        phone: '5555555555',
        birthday: '01011990',
        password: 'home1234',
        acceptsTexts: true,
        address: '1234 Main St',
        floor: '1',
        city: 'Denver',
        state: 'CO',
        zip: '80202'
      })
  }
}

main()
