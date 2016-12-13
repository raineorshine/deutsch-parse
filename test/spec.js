const chai = require('chai')
const deutschParse = require('../index.js')
const should = chai.should()

const sample = `
attack,der Angriff
capability,die Fähigkeit,die Fähigkeiten
impressive,eindrucksvoll
topic,das Thema
indoors,drinnen
"good, well",gut
`

describe('deutsch-parse', () => {

  it('should parse a vocab list', () => {
    deutschParse.parse(sample).should.deep.equal([
      { en: 'attack', de: 'Angriff', dePlural: null, gender: deutschParse.Gender.M },
      { en: 'capability', de: 'Fähigkeit', dePlural: 'Fähigkeiten', gender: deutschParse.Gender.F },
      { en: 'topic', de: 'Thema', dePlural: null, gender: deutschParse.Gender.N }
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
