const lodash = require('lodash')

const csvColumns = [
  'Text 1',
  'Text 2',
  'Text 3',
  'Category 1',
  'Category 2',
  'Abstract',
  'Concrete',
  //'Place',
  //'No Article',
  '?',
  'Nonhuman',
  'Animal subject',
  'Human subject',
  'Modal',
  'Intran',
  'Acc (Abstract)',
  'Acc (Concrete)',
  'Dat',
  'Dat + Acc (Concrete)',
  'Dat + Acc (Abstract)',
  'Acc + Vo',
  'dass'
]

const defaultObj = { en: 'apple', de: 'Apfel', gender: 1 }
const defaultIntransitive = { en: 'see', de: 'sehen' }
const defaultAccusative = { en: 'see', de: 'sehen' }
const defaultSubordinateVerb = { en: 'think', de: 'denken' }
const defaultVerb = { en: 'think', de: 'denken' }

/** Gender enum */
// start at 1 so all values are truthy
const Gender = {
  M: 1,
  F: 2,
  N: 3
}

const subjectsDeMap = {
  I: 'ich',
  you: 'du',
  // 'you (plural, informal)': 'ihr',
  he: 'er',
  she: 'sie',
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

const irregulars = {
  see: {
    de: {
      you: 'siehst',
      he: 'sieht',
      she: 'sieht',
      it: 'sieht'
    }
  }
}

/** Uppercases the first letter of a sentence. */
function toSentenceCase(str) {
  return str[0].toUpperCase() + str.slice(1)
}

/** Construct a sentence out of the given words by joining the non-empty words with spaces, capitalizing the first letter of the sentence, and adding a period at the end */
function constructSentence(words) {
  return toSentenceCase(lodash.compact(words).join(' ')).replace(/ , /g, ', ') + '.'
}

/** Returns the Gender of the given noun with its definite article. */
function getGender(nounWithArticle) {
  const lower = nounWithArticle.toLowerCase()
  return lower.startsWith('der ') ? Gender.M :
    lower.startsWith('die ') ? Gender.F :
    lower.startsWith('das ') ? Gender.N :
    null
}

/** Returns the noun without its article. */
function removeArticle(nounWithArticle) {
  return nounWithArticle.replace(/^(der|die|das)\s+/, '')
}

function splitTermAndRemoveQuotes(term) {
  return term.replace(/"/g, '').split(/\s*,\s*/)
}

function concat(a, b) {
  return a.concat(b)
}

function isVerb(word) {
  return word.en.startsWith('to ')
}

function conjugateEn(subject, infinitive) {
  const firstPerson = subject === 'I'
  const thirdPersonSingular = subject === 'he' || subject === 'she' || subject === 'it'
  const be = infinitive.startsWith('to be ')
  const words = infinitive
    .replace('to ', '')
    .replace('be ', firstPerson ? 'am' : thirdPersonSingular ? 'is ' : 'are ')
    .split(' ')
  const conjugatedVerb = thirdPersonSingular && !be ? (
      words[0].endsWith('y') ? words[0].slice(0, words[0].length-1) + 'ies' :
      words[0].endsWith('h') ? words[0] + 'es' :
      words[0] + 's'
    ) : words[0]
  return [].concat(conjugatedVerb, words.slice(1)).join(' ')
}

function conjugateDe(subjectEn, infinitive) {
  const en = infinitive.slice(infinitive.length - 2) === 'en'
  const base = infinitive.slice(0, infinitive.length - (en ? 2 : 1))
  const thirdPersonSingular = subjectEn === 'he' || subjectEn === 'she' || subjectEn === 'it'
  return subjectEn === 'I' ? base + 'e' :
    subjectEn === 'you' ? base + 'st' :
    thirdPersonSingular ? base + 't' :
    infinitive
}

/** Parses a vocab list. */
function parse(input) {

  // temporarily replace commas inside terms with this special token to avoid splitting in the wrong place
  const COMMA_TOKEN = 'COMMA_TOKEN'

  return input
    .trim()
    .split('\n')
    // ignore headers
    .slice(1)
    .filter(lodash.identity)
    // replace term commas with special token
    .map(lodash.flow(
      line => line.replace(/"[^"]+"/g, match => match.replace(',', COMMA_TOKEN)),
      line => line.split(','),
      // put commas back
      termArray => termArray.map(term => term.replace(COMMA_TOKEN, ','))
    ))
    // do a bunch of concatMaps to effectively create a cross product of terms if there are multiple
    .map(termArray => splitTermAndRemoveQuotes(termArray[csvColumns.indexOf('Text 1')])
      .map(en => splitTermAndRemoveQuotes(termArray[csvColumns.indexOf('Text 2')] || '')
        .map(de => splitTermAndRemoveQuotes(termArray[csvColumns.indexOf('Text 3')] || '')
          .map(deOther => ({
            en: en.trim(),
            de: removeArticle(de).trim(),
            dePlural: removeArticle(deOther || '').trim(),
            gender: getGender(de),
            abstract: termArray[csvColumns.indexOf('Abstract')],
            concrete: termArray[csvColumns.indexOf('Concrete')],
            nonhuman: termArray[csvColumns.indexOf('Nonhuman')],
            animalSubject: termArray[csvColumns.indexOf('Animal subject')],
            humanSubject: termArray[csvColumns.indexOf('Human subject')],
            modal: termArray[csvColumns.indexOf('Modal')],
            intransitive: termArray[csvColumns.indexOf('Intran')],
            accAbstract: termArray[csvColumns.indexOf('Acc (Abstract)')],
            accConcrete: termArray[csvColumns.indexOf('Acc (Concrete)')],
            dat: termArray[csvColumns.indexOf('Dat')],
            datAccConcrete: termArray[csvColumns.indexOf('Dat + Acc (Concrete)')],
            datAccAbstract: termArray[csvColumns.indexOf('Dat + Acc (Abstract)')],
            accVo: termArray[csvColumns.indexOf('Acc + Vo')],
            dass: termArray[csvColumns.indexOf('dass')]
           }))
        ).reduce(concat)
      ).reduce(concat)
    ).reduce(concat)
    .map(obj => lodash.pickBy(obj, lodash.identity))
}

/** Generates a random simple intransitive verb sentence. */
function intransitive(wordlist) {
  const words = parse(wordlist)

  // choose a random subject and intransitive verb
  const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
  const article = lodash.sample(Object.keys(articles))
  const verb = lodash.sample(words.filter(word => word.intransitive)) || defaultIntransitive

  const subjectDe = subjectsDeMap[subjectEn]
  const verbEn = conjugateEn(subjectEn, verb.en)
  const verbDe = conjugateDe(subjectEn, verb.de)

  return {
    en: constructSentence([subjectEn, verbEn]),
    de: constructSentence([subjectDe, verbDe])
  }
}

/** Generates a random accusative sentence. */
function accusative(wordlist) {
  const words = parse(wordlist)

  // choose a random subject, verb, article, and object
  const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
  const verb = lodash.sample(words.filter(word => word.accAbstract || word.accConcrete)) || defaultAccusative
  const article = lodash.sample(Object.keys(articles))

  // choose an abstract or concrete object based on the verb
  const object = lodash.sample(words.filter(word => word[verb.accAbstract ? 'abstract' : 'concrete'])) || defaultObj

  const subjectDe = subjectsDeMap[subjectEn]
  const verbEn = conjugateEn(subjectEn, verb.en)
  const verbDe = conjugateDe(subjectEn, verb.de)
  const articleEn = article === 'a' && /^[aeiou]/.test(object.en) ? 'an' : article
  const articleDe = articles[article].acc[object.gender]

  return {
    en: constructSentence([subjectEn, verbEn, articleEn, object.en]),
    de: constructSentence([subjectDe, verbDe, articleDe, object.de])
  }
}

/** Generates a random subordinate sentence. */
function subordinate(wordlist) {
  const words = parse(wordlist)

  // choose a random subject and verb for the independent clause
  const indSubjectEn = lodash.sample(Object.keys(subjectsDeMap))
  const indVerb = lodash.sample(words.filter(word => word.dass)) || defaultSubordinateVerb
  const indVerbEn = conjugateEn(indSubjectEn, indVerb.en)

  const indSubjectDe = subjectsDeMap[indSubjectEn]
  const indVerbDe = conjugateDe(indSubjectEn, indVerb.de)

  // choose a random subject, verb, article, and object for the subordinate clause
  const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
  const verb = lodash.sample(words.filter(word => word.accAbstract || word.accConcrete)) || defaultAccusitive
  const article = lodash.sample(Object.keys(articles))

  // choose an abstract or concrete object based on the verb
  const object = lodash.sample(words.filter(word => word[verb.accAbstract ? 'abstract' : 'concrete'])) || defaultObj

  const subjectDe = subjectsDeMap[subjectEn]
  const verbEn = conjugateEn(subjectEn, verb.en)
  const verbDe = conjugateDe(subjectEn, verb.de)
  const articleEn = article === 'a' && /^[aeiou]/.test(object.en) ? 'an' : article
  const articleDe = articles[article].acc[object.gender]

  return {
    en: constructSentence([indSubjectEn, indVerbEn, 'that', subjectEn, verbEn, articleEn, object.en]),
    de: constructSentence([indSubjectDe, indVerbDe, ', dass', subjectDe, articleDe, object.de, verbDe])
  }
}

module.exports = {
  Gender,
  parse,
  intransitive,
  accusative,
  subordinate
}
