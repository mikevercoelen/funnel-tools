const { createApplicant } = require('./createApplicant')
const { approveApplicant } = require('./approveApplicant')
const { createEmail } = require('./utils/generator')
const { promptMenu } = require('./utils/menu')
const { Task } = require('./constants/Task')

async function main () {
  const { task, options } = await promptMenu()

  switch (task) {
    case Task.APPROVE_APPLICANT:
      return approveApplicant({
        isHeadless: options.isHeadless,
        chuckUrl: options.chuckUrl,
        email: options.email
      })
    case Task.CREATE_APPLICANT:

      // TODO: integrate actual options selected
      return createApplicant({
        isHeadless: true,
        woodhouseUrl: 'http://woodhouse-pr1691.nestiostaging.com/6/welcome',
        firstName: 'John',
        lastName: 'Doe',
        email: createEmail('John', 'Doe'),
        phone: '5555555555',
        birthday: '01011990',
        password: 'home1234',
        acceptsTexts: true,
        address: '1234 Main St',
        floor: '1',
        city: 'Denver',
        state: 'CO',
        zip: '80202',
        unit: '',
        terms: '12'
      })
  }
}

main()
