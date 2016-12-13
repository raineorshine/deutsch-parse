const chai = require('chai')
const deutschParse = require('../index.js')
const should = chai.should()

const sample = `
attack,der Angriff
capability,die Fähigkeit,die Fähigkeiten
impressive,eindrucksvoll
topic,das Thema
indoors,drinnen,,,,,,,,,,,,,,,
"good, well",gut
"stratum, shift",die Schicht,die Schichten
"oneEn, twoEn","die oneDe, die twoDe"
`

describe('deutsch-parse', () => {

  it('should parse a vocab list', () => {
    deutschParse.parse(sample).should.deep.equal([
      { en: 'attack', de: 'Angriff', dePlural: null, gender: deutschParse.Gender.M },
      { en: 'capability', de: 'Fähigkeit', dePlural: 'Fähigkeiten', gender: deutschParse.Gender.F },
      { en: 'topic', de: 'Thema', dePlural: null, gender: deutschParse.Gender.N },
      { en: 'stratum', de: 'Schicht', dePlural: 'Schichten', gender: deutschParse.Gender.F },
      { en: 'shift', de: 'Schicht', dePlural: 'Schichten', gender: deutschParse.Gender.F },
      // i.e. cross product
      { en: 'oneEn', de: 'oneDe', dePlural: null, gender: deutschParse.Gender.F },
      { en: 'oneEn', de: 'twoDe', dePlural: null, gender: deutschParse.Gender.F },
      { en: 'twoEn', de: 'oneDe', dePlural: null, gender: deutschParse.Gender.F },
      { en: 'twoEn', de: 'twoDe', dePlural: null, gender: deutschParse.Gender.F }
    ])
  })

  it('should generate accusative exercises', () => {
    const exercise = deutschParse.accusative(sample, 1)
    exercise.should.have.length(1)
    exercise[0].should.have.property('en')
    exercise[0].should.have.property('de')
  })

  it('should generate a subordinate clause exercises', () => {
    const exercise = deutschParse.subordinate(sample, 1)
    exercise.should.have.length(1)
    exercise[0].should.have.property('en')
    exercise[0].should.have.property('de')
  })

})
