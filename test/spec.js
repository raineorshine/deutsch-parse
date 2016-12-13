const chai = require('chai')
const satz = require('../index.js')
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

describe('satz', () => {

  it('should parse a vocab list', () => {
    satz.parse(sample).should.deep.equal([
      { en: 'attack', de: 'Angriff', gender: satz.Gender.M },
      { en: 'capability', de: 'Fähigkeit', dePlural: 'Fähigkeiten', gender: satz.Gender.F },
      { en: 'impressive', de: 'eindrucksvoll' },
      { en: 'topic', de: 'Thema', gender: satz.Gender.N },
      { en: 'indoors', de: 'drinnen' },
      { en: 'good', de: 'gut' },
      { en: 'well', de: 'gut' },
      { en: 'stratum', de: 'Schicht', dePlural: 'Schichten', gender: satz.Gender.F },
      { en: 'shift', de: 'Schicht', dePlural: 'Schichten', gender: satz.Gender.F },
      // i.e. cross product
      { en: 'oneEn', de: 'oneDe', gender: satz.Gender.F },
      { en: 'oneEn', de: 'twoDe', gender: satz.Gender.F },
      { en: 'twoEn', de: 'oneDe', gender: satz.Gender.F },
      { en: 'twoEn', de: 'twoDe', gender: satz.Gender.F }
    ])
  })

  it('should generate accusative exercises', () => {
    const exercise = satz.accusative(sample, 1)
    exercise.should.have.length(1)
    exercise[0].should.have.property('en')
    exercise[0].should.have.property('de')
  })

  it('should generate a subordinate clause exercises', () => {
    const exercise = satz.subordinate(sample, 1)
    exercise.should.have.length(1)
    exercise[0].should.have.property('en')
    exercise[0].should.have.property('de')
  })

})
