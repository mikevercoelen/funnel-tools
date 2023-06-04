async function waitForSelector (selector, interval = 100, maxAttempts = 10) {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const checkSelector = () => {
      const element = document.querySelector(selector)
      attempts++

      if (element) {
        resolve(element)
      } else if (attempts < maxAttempts) {
        setTimeout(checkSelector, interval)
      } else {
        reject(new Error(`Failed to find selector: ${selector}`))
      }
    }

    checkSelector()
  })
}

module.exports = {
  waitForSelector
}
