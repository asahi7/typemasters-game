String.prototype.replaceAll = function (a, b) { return this.split(a).join(b) }

var translite_lat = {
  А: 'A',
  а: 'a',
  Ә: 'Á',
  ә: 'á',
  Б: 'B',
  б: 'b',
  Д: 'D',
  д: 'd',
  Е: 'E',
  е: 'e',
  Ф: 'F',
  ф: 'f',
  'Ғ': 'Ǵ',
  'ғ': 'ǵ',
  Г: 'G',
  г: 'g',
  Х: 'H',
  х: 'h',
  І: 'I',
  i: 'i',
  І: 'I',
  i: 'i',
  И: 'I',
  и: 'ı',
  Й: 'I',
  й: 'ı',
  H: 'H',
  h: 'h',
  Ж: 'J',
  ж: 'j',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  Ң: 'Ń',
  ң: 'ń',
  О: 'O',
  о: 'o',
  Ө: 'Ó',
  ө: 'ó',
  П: 'P',
  п: 'p',
  Қ: 'Q',
  қ: 'q',
  Р: 'R',
  р: 'r',
  Ш: 'Sh',
  ш: 'sh',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  Ұ: 'U',
  ұ: 'u',
  Ү: 'Ú',
  ү: 'ú',
  В: 'V',
  в: 'v',
  Ы: 'Y',
  ы: 'y',
  У: 'Ý',
  у: 'ý',
  З: 'Z',
  з: 'z',
  Ч: 'Ch',
  ч: 'ch',
  Э: 'E',
  э: 'e',
  Щ: '',
  щ: '',
  ь: '',
  ъ: ''

}

var _translate_lat = {
  Я: 'Ia',
  я: 'ıa',
  Ю: 'Iý',
  ю: 'ıý',
  Ц: 'Ts',
  ц: 'ts'

}

const convert_to_lat = function (text) {
  for (var key in _translate_lat) {
    text = text.replaceAll(key.toString(), _translate_lat[key])
  }

  for (key in translite_lat) {
    text = text.replaceAll(key.toString(), translite_lat[key])
  }

  return text
}

module.exports = convert_to_lat
