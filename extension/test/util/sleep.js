module.exports.sleep = async function (seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, seconds * 1000)
  })
}
