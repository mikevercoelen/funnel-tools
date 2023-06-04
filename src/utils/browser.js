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

async function pollUntilTrue (fn, interval = 100, maxAttempts = 10) {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const checkFn = () => {
      attempts++

      if (fn()) {
        resolve()
      } else if (attempts < maxAttempts) {
        setTimeout(checkFn, interval)
      } else {
        reject(new Error(`Failed to resolve function: ${fn}`))
      }
    }

    checkFn()
  })
}

module.exports = {
  waitForSelector,
  pollUntilTrue
}
