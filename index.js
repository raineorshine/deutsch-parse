const lodash = require('lodash')

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
  do: {
    en: {
      I: 'do',
      you: 'do',
      he: 'does',
      she: 'does',
      it: 'does',
      they: 'do',
      we: 'do'
    }
  },
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
function removeFirstWord(word) {
  return word.replace(/^\S*\s+/, '')
}

function splitTermAndRemoveQuotes(term) {
  return term ? term.replace(/"/g, '').split(/\s*,\s*/) : []
}

function trimAndRemoveParens(str) {
  return str.trim().replace(/\s*\([^)]*\)/g, '')
}

function concat(a, b) {
  return a.concat(b)
}

function isVerb(word) {
  return word.en.startsWith('to ')
}

function conjugateEn(subject, infinitive) {

  if(irregulars[infinitive] && irregulars[infinitive].en && irregulars[infinitive].en[subject]) {
    return irregulars[infinitive].en[subject]
  }

  const firstPerson = subject === 'I'
  const thirdPersonSingular = subject === 'he' || subject === 'she' || subject === 'it'
  const be = infinitive.startsWith('to be ')
  const words = infinitive
    .replace('to ', '')
    .replace('be ', firstPerson ? 'am' : thirdPersonSingular ? 'is ' : 'are ')
    .split(' ')
  const conjugatedVerb = thirdPersonSingular && !be ? (
      words[0].endsWith('y') && !words[0].endsWith('uy') ? words[0].slice(0, words[0].length-1) + 'ies' :
      words[0].endsWith('h') || words[0].endsWith('ss') ? words[0] + 'es' :
      words[0] + 's'
    ) : words[0]
  return [].concat(conjugatedVerb, words.slice(1)).join(' ')
}

function conjugateDe(subjectEn, infinitive) {

  if(irregulars[infinitive] && irregulars[infinitive].de && irregulars[infinitive].de[subject]) {
    return irregulars[infinitive].de[subject]
  }

  const en = infinitive.slice(infinitive.length - 2) === 'en'
  const base = infinitive.slice(0, infinitive.length - (en ? 2 : 1))
  const thirdPersonSingular = subjectEn === 'he' || subjectEn === 'she' || subjectEn === 'it'
  return subjectEn === 'I' ? base + 'e' :
    subjectEn === 'you' ? base + 'st' :
    thirdPersonSingular ? base + 't' :
    infinitive
}

/** Splits a CSV line that may have quoted commas. */
function splitLine(line) {
  const COMMA_TOKEN = 'COMMA_TOKEN'
  return lodash.flow(
    // replace term commas with special token
    line => line.trim().replace(/"[^"]+"/g, match => match.replace(',', COMMA_TOKEN)),
    // split the line
    line => line.split(','),
    // put commas back and remove quotes
    termArray => termArray.map(term => term.replace(COMMA_TOKEN, ',').replace(/"/g, ''))
  )(line)
}

/** Parses a vocab list. */
function parse(input) {

  const lines = input
    .trim()
    .split('\n')
    .filter(lodash.identity)
    .map(splitLine)

  // get headers
  const headers = lines[0]

  // ignore headers
  return lines.slice(1)
    // do a bunch of concatMaps to effectively create a cross product of terms if there are multiple
    .map(termArray => splitTermAndRemoveQuotes(termArray[headers.indexOf('Text 1')])
      .map(en => splitTermAndRemoveQuotes(termArray[headers.indexOf('Text 2')] || '')
        .map(de => splitTermAndRemoveQuotes(termArray[headers.indexOf('Text 3')] || '')
          .map(deOther => ({
            en: trimAndRemoveParens(en),
            de: removeFirstWord(trimAndRemoveParens(de)),
            dePlural: removeFirstWord(trimAndRemoveParens(deOther || '')),
            gender: getGender(de),
            nounQualities: splitTermAndRemoveQuotes(termArray[headers.indexOf('N - Qualities')]),
            nounAbstract: !!parseInt(termArray[headers.indexOf('N - Abstract')]),
            nounConcrete: !!parseInt(termArray[headers.indexOf('N - Concrete')]),
            nounPlace: !!parseInt(termArray[headers.indexOf('N - Place')]),
            nounNoArticle: !!parseInt(termArray[headers.indexOf('N - No Article')]),
            verbSpecificSubject: termArray[headers.indexOf('V - Specific Subject')],
            verbSpecificObject: termArray[headers.indexOf('V - Specific Object')],
            verbIntran: !!parseInt(termArray[headers.indexOf('V - Intran')]),
            verbReflexive: !!parseInt(termArray[headers.indexOf('V - Reflexive')]),
            verbDat: !!parseInt(termArray[headers.indexOf('V - Dat')]),
            verbDatAccConcrete: !!parseInt(termArray[headers.indexOf('V - Dat + Acc (Concrete)')]),
            verbDatAccAbstract: !!parseInt(termArray[headers.indexOf('V - Dat + Acc (Abstract)')]),
            verbAccVo: !!parseInt(termArray[headers.indexOf('V - Acc + Vo')]),
            verbModal: !!parseInt(termArray[headers.indexOf('V - Modal')]),
            verbDass: !!parseInt(termArray[headers.indexOf('V - dass')]),
            uncommon: !!parseInt(termArray[headers.indexOf('uncommon')]),
            verbUnknown: !!parseInt(termArray[headers.indexOf('?')])
           }))
        ).reduce(concat)
      ).reduce(concat)
    ).reduce(concat)
    .map(obj => lodash.pickBy(obj, prop => lodash.isArray(prop) ? prop.length : prop))
    .filter(word => !word.uncommon)
}

/** Generates a random simple intransitive verb sentence. */
function intransitive(wordlist) {
  const words = parse(wordlist)

  // choose a random subject and intransitive verb
  const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
  const article = lodash.sample(Object.keys(articles))
  const verb = lodash.sample(words.filter(word => word.verbSpecificSubject === 'humanoid' && word.verbIntran)) || defaultIntransitive

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
  const verb = lodash.sample(words.filter(word => word.verbSpecificSubject === 'humanoid' && !word.verbIntran)) || defaultAccusative
  const article = lodash.sample(Object.keys(articles))

  // choose an abstract or concrete object based on the verb
  const object = lodash.sample(words.filter(word => word.verbSpecificObject
    ? word.nounQualities && word.nounQualities.includes(verb.verbSpecificObject)
    : (word.nounAbstract || word.nounConcrete))) || defaultObj

  const subjectDe = subjectsDeMap[subjectEn]
  // do not conjugate the verb if this is a "no" sentence, just remove "to "
  const verbEn = article === 'no' ? removeFirstWord(verb.en) : conjugateEn(subjectEn, verb.en)
  const verbDe = conjugateDe(subjectEn, verb.de)
  const articleEn = object.nounNoArticle ? '' :
    article === 'a' && /^[aeiou]/.test(object.en) ? 'an' :
    article
  const articleDe = object.nounNoArticle ? '' : articles[article].acc[object.gender]

  return {
    // re-arrange "no obj" sentences to "does not...obj""
    en: constructSentence(article === 'no'
      ? [subjectEn, conjugateEn(subjectEn, 'do'), 'not', verbEn, object.nounNoArticle ? '' : /^[aeiou]/.test(object.en) ? 'an' : 'a', object.en]
      : [subjectEn, verbEn, articleEn, object.en]
    ),
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
