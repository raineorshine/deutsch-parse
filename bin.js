#! /usr/bin/env node

const com = require('commander')
const stdin = require('get-stdin-promise')
const pkg = require('./package.json')
const lodash = require('lodash')
const satz = require('./')
const Table = require('cli-table')

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

function toTable(data) {
  const table = new Table({ chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''} })
  table.push.apply(table, data.map(sentence => [sentence.en, sentence.de]))

  return table.toString()
}

/** Returns a function that maps the results of the given function n times. */
function repeat(n, f) {
  return (...args) => Array(n).join(' ').split(' ').map(() => f(...args))
}

/** Reads input from stdin, executes the given function on the input, and converts it to CSV. */
function readAndExecute(f) {
  return readVocab()
    .then(lodash.flow(f, com.pretty ? toTable : toCSV))
    .then(console.log, console.error)
}

/** Reads input from stdin, executes the given function on the input n times, and converts it to CSV. */
function readAndExecuteMany(f) {
  return readAndExecute(repeat(com.number || defaultNumber, f))
}

com
  .version(pkg.version)
  .usage(extendedHelp)
  .option('-p, --pretty', 'pretty print')

com
  .command('parse')
  .description('parse a vocabulary list in csv format')
  .action(() => readAndExecute(satz.parse))

com
  .command('int')
  .description('simple, intransitive verbs')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => readAndExecuteMany(satz.intransitive))

com
  .command('acc')
  .description('accusative')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => readAndExecuteMany(satz.accusative))

com
  .command('sub')
  .description('subordinate clauses')
  .option('-n, --number <n>', 'Number of exercises to generate.')
  .action(() => readAndExecuteMany(satz.subordinate))

com.parse(process.argv)

