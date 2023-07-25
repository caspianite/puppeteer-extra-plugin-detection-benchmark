const targets = require('./targets.json')

for (entry of targets) {
  result = {
    title: entry.title,
    link: entry.link,
    result: undefined
  }
  console.log(result)
}
