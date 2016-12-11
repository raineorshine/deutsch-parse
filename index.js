const lodash = require('lodash')

/** Gender enum */
const Gender = {
  M: 0,
  F: 1,
  N: 2
}

const subjectsDeMap = {
  I: 'ich',
  you: 'du',
  'you (plural, informal)': 'ihr',
  he: 'er',
  she: 'sie',
  it: 'es',
  we: 'wir',
  they: 'sie'
}

const articles = {
  the: {
    nom: {
      [Gender.M]: 'der',
      [Gender.F]: 'die',
      [Gender.N]: 'das'
    },
    acc: {
      [Gender.M]: 'den',
      [Gender.F]: 'die',
      [Gender.N]: 'das'
    }
  },
  a: {
    nom: {
      [Gender.M]: 'ein',
      [Gender.F]: 'eine',
      [Gender.N]: 'ein'
    },
    acc: {
      [Gender.M]: 'einen',
      [Gender.F]: 'eine',
      [Gender.N]: 'ein'
    }
  },
  no: {
    nom: {
      [Gender.M]: 'kein',
      [Gender.F]: 'keine',
      [Gender.N]: 'kein'
    },
    acc: {
      [Gender.M]: 'keinen',
      [Gender.F]: 'keine',
      [Gender.N]: 'kein'
    }
  }
}

/** Verbs that can be used with the accusitive. */
const accVerbs = [
  {
    en: {
      I: 'see',
      you: 'see',
      'you (plural, informal)': 'see',
      he: 'sees',
      she: 'sees',
      it: 'sees',
      we: 'see',
      they: 'see'
    },
    de: {
      I: 'sehe',
      you: 'siehst',
      'you (plural, informal)': 'seht',
      he: 'sieht',
      she: 'sieht',
      it: 'sieht',
      we: 'sehen',
      they: 'sehen'
    }
  }
]

function toSentenceCase(str) {
  return str[0].toUpperCase() + str.slice(1)
}

/** Returns the Gender of the given noun with its definite article. */
function getGender(nounWithArticle) {
  const lower = nounWithArticle.toLowerCase()
  return lower.startsWith('der') ? Gender.M :
    lower.startsWith('die') ? Gender.F :
    lower.startsWith('das') ? Gender.N :
    new Error('Could not detect gender: ' + nounWithArticle)
}

/** Returns the noun without its article. */
function removeArticle(nounWithArticle) {
  return nounWithArticle.replace(/^(der|die|das)\s+/, '')
}

/** Parses a vocab list. */
function parse(input) {

  const terms = input
    .trim()
    .split('\n')
    .map(line => line.split(/\t|\s{2,}/))
    .map(termArray => ({
      en: termArray[0],
      de: termArray[1],
      deOther: termArray[2]
    }))

  const nouns = terms
    .filter(term => /^(der|die|das)\s+/.test(term.de))
    .map(noun => ({
      en: noun.en,
      de: removeArticle(noun.de),
      dePlural: noun.deOther ? removeArticle(noun.deOther) : null,
      gender: getGender(noun.de)
    }))

  return nouns
}

/** Generates accusitive sentences. */
function accusative(input, n) {
  n = n || 5
  const nouns = parse(input)
  return Array(n).join(' ').split(' ').map((_, i) => {

    // choose a random subject, article, and object
    const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
    const article = lodash.sample(Object.keys(articles))
    const object = lodash.sample(nouns)

    const articleEn = article === 'a' && /^[aeiou]/.test(object.en) ? 'an' : 'a'
    const subjectDe = subjectsDeMap[subjectEn]
    const verb = lodash.sample(accVerbs)
    const verbEn = verb.en[subjectEn]
    const verbDe = verb.de[subjectEn]
    const articleDe = articles[article].acc[object.gender]

    return {
      en: toSentenceCase(`${subjectEn} ${verbEn} ${articleEn} ${object.en}.`),
      de: toSentenceCase(`${subjectDe} ${verbDe} ${articleDe} ${object.de}.`)
    }
  })
}

module.exports = {
  Gender,
  parse,
  accusative
}
