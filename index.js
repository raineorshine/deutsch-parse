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
  return lower.startsWith('der') ? Gender.M :
    lower.startsWith('die') ? Gender.F :
    lower.startsWith('das') ? Gender.N :
    new Error('Could not detect gender: ' + nounWithArticle)
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

/** Parses a vocab list. */
function parse(input) {

  // temporarily replace commas inside terms with this special token to avoid splitting in the wrong place
  const COMMA_TOKEN = 'COMMA_TOKEN'

  const terms = input
    .trim()
    .split('\n')
    // replace term commas with special token
    .map(lodash.flow(
      line => line.replace(/"[^"]+"/g, match => match.replace(',', COMMA_TOKEN)),
      line => line.split(','),
      // put commas back
      termArray => termArray.map(term => term.replace(COMMA_TOKEN, ','))
    ))
    // do a bunch of concatMaps to effectively create a cross product of terms if there are multiple
    .map(termArray => splitTermAndRemoveQuotes(termArray[0])
      .map(en => splitTermAndRemoveQuotes(termArray[1] || '')
        .map(de => splitTermAndRemoveQuotes(termArray[2] || '')
          .map(deOther => ({ en, de, deOther }))
        ).reduce(concat)
      ).reduce(concat)
    ).reduce(concat)


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
function accusative(input, n = 5) {
  const nouns = parse(input)
  return mapRepeat(n, () => {

    // choose a random subject, verb, article, and object
    const subjectEn = lodash.sample(Object.keys(subjectsDeMap))
    const article = lodash.sample(Object.keys(articles))
    const object = lodash.sample(nouns)
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
function subordinate(input, n = 5) {
  const nouns = parse(input)
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
    const object = lodash.sample(nouns)
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
  accusative,
  subordinate
}
