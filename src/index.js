const { createApplicant } = require('./createApplicant')
const { createEmail } = require('./utils/generator')

async function main () {
  await createApplicant({
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

main()
