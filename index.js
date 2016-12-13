const lodash = require('lodash')

const csvColumns = [
  'Text 1',
  'Text 2',
  'Text 3',
  'Category 1',
  'Category 2',
  'Abstract',
  'Concrete',
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

/** Verbs that can be used to trigger a subordinate clause. */
const subordinateVerbs = [
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
  },
  {
    en: {
      I: 'think',
      you: 'think',
      'you (plural, informal)': 'think',
      he: 'thinks',
      she: 'thinks',
      it: 'thinks',
      we: 'think',
      they: 'think'
    },
    de: {
      I: 'denk',
      you: 'denkst',
      'you (plural, informal)': 'denkt',
      he: 'denkt',
      she: 'denkt',
      it: 'denkt',
      we: 'denken',
      they: 'denken'
    }
  },
  {
    en: {
      I: 'hope',
      you: 'hope',
      'you (plural, informal)': 'hope',
      he: 'hopes',
      she: 'hopes',
      it: 'hopes',
      we: 'hope',
      they: 'hope'
    },
    de: {
      I: 'hoffe',
      you: 'hoffst',
      'you (plural, informal)': 'hofft',
      he: 'hofft',
      she: 'hofft',
      it: 'hofft',
      we: 'hoffen',
      they: 'hoffen'
    }
  },
  {
    en: {
      I: 'believe',
      you: 'believe',
      'you (plural, informal)': 'believe',
      he: 'believes',
      she: 'believes',
      it: 'believes',
      we: 'believe',
      they: 'believe'
    },
    de: {
      I: 'glaub',
      you: 'glaubst',
      'you (plural, informal)': 'glaubt',
      he: 'glaubt',
      she: 'glaubt',
      it: 'glaubt',
      we: 'glauben',
      they: 'glauben'
    }
  }
]

function toSentenceCase(str) {
  return str[0].toUpperCase() + str.slice(1)
}

function mapRepeat(n, f) {
  return Array(n).join(' ').split(' ').map(f)
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

function conjugateEn(subject, infinitive) {
  const firstPerson = subject === 'I'
  const thirdPersonSingular = subject === 'he' || subject === 'she' || subject === 'it'
  const be = infinitive.startsWith('to be ')
  const words = infinitive
    .replace('to ', '')
    .replace('be ', firstPerson ? 'am' : thirdPersonSingular ? 'is ' : 'are ')
    .split(' ')
  const s = words[0].endsWith('h') ? 'es' : 's'
  const conjugatedVerb = thirdPersonSingular && !be ? (
      words[0].endsWith('y') ? words[0].slice(0, words[0].length-1) + 'ies' :
      words[0].endsWith('h') ? words[0].slice(0, words[0].length-1) + 'es' :
      words[0] + 's'
    ) : words[0]
  return [].concat(conjugatedVerb, words.slice(1)).join(' ')
}

function conjugateDe(subject, infinitive) {
  const base = infinitive.slice(0, infinitive.length - 2)
  const thirdPersonSingular = subject === 'he' || subject === 'she' || subject === 'it'
  return subject === 'I' ? base + 'e' :
    subject === 'you' ? base + 'st' :
    thirdPersonSingular ? base + 't' :
    infinitive
}

/** Parses a vocab list. */
function parse(input) {

  // temporarily replace commas inside terms with this special token to avoid splitting in the wrong place
  const COMMA_TOKEN = 'COMMA_TOKEN'

  const terms = input
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
            accVo: termArray[csvColumns.indexOf('Acc + Vo')]
           }))
        ).reduce(concat)
      ).reduce(concat)
    ).reduce(concat)
    .map(obj => lodash.pickBy(obj, lodash.identity))

  return terms
}

/** Generates accusitive sentences. */
function intransitive(input, n = 10) {
  const words = parse(input)
  return mapRepeat(n, () => {

    // choose a random subject and intransitive verb
    const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
    const article = lodash.sample(Object.keys(articles))
    const verb = lodash.sample(words.filter(word => word.intransitive))

    const subjectDe = subjectsDeMap[subjectEn]
    const verbEn = conjugateEn(subjectEn, verb.en)
    const verbDe = conjugateDe(subjectEn, verb.de)

    return {
      en: toSentenceCase(`${subjectEn} ${verbEn}.`),
      de: toSentenceCase(`${subjectDe} ${verbDe}.`)
    }
  })
}

/** Generates accusitive sentences. */
function accusative(input, n = 10) {
  const words = parse(input)
  return mapRepeat(n, () => {

    // choose a random subject, verb, article, and object
    const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
    const article = lodash.sample(Object.keys(articles))
    const object = lodash.sample(words.filter(word => word.concrete)) || defaultObj
    const verb = lodash.sample(accVerbs)

    const articleEn = article === 'a' && /^[aeiou]/.test(object.en) ? 'an' : article
    const subjectDe = subjectsDeMap[subjectEn]
    const verbEn = verb.en[subjectEn]
    const verbDe = verb.de[subjectEn]
    const articleDe = articles[article].acc[object.gender]

    return {
      en: toSentenceCase(`${subjectEn} ${verbEn} ${articleEn} ${object.en}.`),
      de: toSentenceCase(`${subjectDe} ${verbDe} ${articleDe} ${object.de}.`)
    }
  })
}

/** Generates subordinate sentences. */
function subordinate(input, n = 10) {
  const words = parse(input)
  return mapRepeat(n, () => {

    // choose a random subject and verb for the independent clause
    const indSubjectEn = lodash.sample(Object.keys(subjectsDeMap).filter(subject => subject != 'it'))
    const indVerb = lodash.sample(subordinateVerbs)
    const indVerbEn = indVerb.en[indSubjectEn]

    const indSubjectDe = subjectsDeMap[indSubjectEn]
    const indVerbDe = indVerb.de[indSubjectEn]

    // choose a random subject, verb, article, and object for the subordinate clause
    const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
    const article = lodash.sample(Object.keys(articles))
    const object = lodash.sample(words.filter(word => word.concrete)) || defaultObj
    const verb = lodash.sample(accVerbs)

    const articleEn = article === 'a' && /^[aeiou]/.test(object.en) ? 'an' : article
    const subjectDe = subjectsDeMap[subjectEn]
    const verbEn = verb.en[subjectEn]
    const verbDe = verb.de[subjectEn]
    const articleDe = articles[article].acc[object.gender]

    return {
      en: toSentenceCase(`${indSubjectEn} ${indVerbEn} that ${subjectEn} ${verbEn} ${articleEn} ${object.en}.`),
      de: toSentenceCase(`${indSubjectDe} ${indVerbDe}, dass ${subjectDe} ${articleDe} ${object.de} ${verbDe}.`)
    }
  })
}

module.exports = {
  Gender,
  parse,
  intransitive,
  accusative,
  subordinate
}
