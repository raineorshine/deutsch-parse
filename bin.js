#! /usr/bin/env node

const com = require('commander')
const stdin = require('get-stdin-promise')
const pkg = require('./package.json')
const lodash = require('lodash')
const satz = require('./')

const defaultNumber = 10

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

/** Returns a function that maps the results of the given function n times. */
function repeat(n, f) {
  return (...args) => Array(n).join(' ').split(' ').map(() => f(...args))
}

com
  .version(pkg.version)
  .usage(extendedHelp)

com
  .command('parse')
  .description('parse a vocabulary list in csv format')
  .action(() => {
    readVocab()
      .then(satz.parse)
      .then(console.log, console.error)
  })

com
  .command('int')
  .description('simple, intransitive verbs')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => {
    readVocab()
      .then(lodash.flow(repeat(com.number || defaultNumber, satz.intransitive), toCSV))
      .then(console.log, console.error)
  })

com
  .command('acc')
  .description('accusative')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => {
    readVocab()
      .then(lodash.flow(repeat(com.number || defaultNumber, satz.accusative), toCSV))
      .then(console.log, console.error)
  })

com
  .command('sub')
  .description('subordinate clauses')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => {
    readVocab()
      .then(lodash.flow(repeat(com.number || defaultNumber, satz.subordinate), toCSV))
      .then(console.log, console.error)
  })

com.parse(process.argv)

