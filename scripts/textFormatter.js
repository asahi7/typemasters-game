if (process.argv.length < 3) {
  console.error('Expected at least one argument, for text to be formatted')
  process.exit(1)
}

const cmd = require('commander')

cmd
  .option('-t, --text <text>', 'text to format')

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

console.log('\n\nPlease read and check the text one more time:\n\n')

console.log(text)

let timeToComplete = Math.round(text.length * 0.5)

console.log(`\n\nEstimated time to complete the text: ${timeToComplete} secs\n\n`)
