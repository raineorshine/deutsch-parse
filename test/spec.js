const chai = require('chai')
const satz = require('../index.js')
const should = chai.should()

const sample = `
Text 1,Text 2,Text 3,Category 1,Category 2,Abstract,Concrete,?,Nonhuman,Animal subject,Human subject,Modal,Intran,Acc (Abstract),Acc (Concrete),Dat,Dat + Acc (Concrete),Dat + Acc (Abstract),Acc + Vo,dass
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

  it('should generate an intransitive verb sentence', () => {
    const exercise = satz.intransitive(sample)
    exercise.should.have.property('en')
    exercise.should.have.property('de')
  })

  it('should generate an accusative article sentence', () => {
    const exercise = satz.accusative(sample)
    exercise.should.have.property('en')
    exercise.should.have.property('de')
  })

  it('should generate a subordinate clause exercises', () => {
    const exercise = satz.subordinate(sample)
    exercise.should.have.property('en')
    exercise.should.have.property('de')
  })

})
