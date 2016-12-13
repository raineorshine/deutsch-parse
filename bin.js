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

function escapeCSV(str) {
  return str.indexOf(',') !== -1 ? `"${str}"` : str
}

function toCSV(data) {
  return data
    .map(sentence => escapeCSV(sentence.en) + ',' + escapeCSV(sentence.de))
    .join('\n')
}

com
  .version(pkg.version)
  .usage(extendedHelp)

com
  .command('parse')
  .description('parse a vocabulary list in csv format')
  .action(() => {
    readVocab()
      .then(deutschParse.parse)
      .then(console.log, console.error)
  })

com
  .command('acc')
  .description('accusative')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => {
    readVocab()
      .then(lodash.flow(deutschParse.accusative, toCSV))
      .then(console.log, console.error)
  })

com
  .command('sub')
  .description('subordinate clauses')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => {
    readVocab()
      .then(lodash.flow(deutschParse.subordinate, toCSV))
      .then(console.log, console.error)
  })

com.parse(process.argv)

