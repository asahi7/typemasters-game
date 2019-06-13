if (process.argv.length < 3) {
  console.error('Expected at least one argument, for text to be formatted')
  process.exit(1)
}

const cmd = require('commander')
const _ = require('lodash')
const convertKazToLat = require('./kazCyrToLat')

cmd
  .option('-t, --text <text>', 'text to format')
  .option('--sql', 'print SQL query')
  .option('-l, --lang <language>', 'language of the text')
  .option('--fromkazcyr', 'will convert cyrillic kazakh to latin')

cmd.parse(process.argv)

console.log(cmd.text)

// removing whitespace in the front, and in the end
let text = cmd.text.trim()

if (!text || text.length === 0) {
  console.error('Pass a valid text argument')
  process.exit(1)
}

// replacing double whitespaces with single space character
text = text.replace(/(\r\n|\n|\r)/gm, ' ')
text = text.replace(/\s\s+/g, ' ')
text = text.replace(/’/gm, "'")

// TODO(aibek): delete or replace non-ascii symbols
text = text.replace(/(—)/g, '-')

if (cmd.fromkazcyr) {
  text = convertKazToLat(text)
}

console.log('\n\nPlease read and check the text one more time:\n\n')

console.log(text)

let timeToComplete = Math.round(text.length * 0.5)

console.log(`\n\nEstimated time to complete the text: ${timeToComplete} secs\n\n`)

const supportedLangs = ['ar', 'de', 'en', 'es', 'fr', 'ko', 'kzLat', 'kzCyr', 'pt', 'ru', 'tr']

if (cmd.sql) {
  if (!cmd.lang) {
    console.error('To print SQL query, please specify the language of the text')
    process.exit(1)
  }
  if (!_.includes(supportedLangs, cmd.lang)) {
    console.error('To print SQL query, please specify the supported language')
    process.exit(1)
  }
  console.log(`\n\nINSERT INTO texts (text, language, duration) VALUES ("${text}", '${cmd.lang}', ${timeToComplete});`)
}
