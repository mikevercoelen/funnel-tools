const { faker } = require('@faker-js/faker')

function createEmail (firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${faker.string.nanoid(3).toLowerCase()}@funnelleasing.com`
}

function getDateFormatted (date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear())
  return `${month}${day}${year}`
}

module.exports = {
  createEmail,
  getDateFormatted
}
