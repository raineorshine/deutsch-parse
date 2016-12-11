#! /usr/bin/env node

const com = require('commander')
const stdin = require('get-stdin-promise')
const pkg = require('./package.json')
const lodash = require('lodash')
const deutschParse = require('./')

const extendedHelp = `

    ${pkg.description}`

function readVocab() {
  return stdin
    .then(input => {
      if(!input) {
        console.error('Must provide vocabulary in csv format via stdin.')
        process.exit(1)
      }
      return input
    })
}

function toCSV(data) {
  return data
    .map(sentence => sentence.en + '\t' + sentence.de)
    .join('\n')
}

com
  .version(pkg.version)
  .usage(extendedHelp)

com
  .command('parse')
  .description('Parse a vocabulary list.')
  .action(() => {
    readVocab()
      .then(deutschParse.parse)
      .then(console.log, console.error)
  })

com
  .command('acc')
  .description('Generate exercises to practice accusative articles.')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => {
    readVocab()
      .then(lodash.flow(deutschParse.accusative, toCSV))
      .then(console.log, console.error)
  })

com.parse(process.argv)

