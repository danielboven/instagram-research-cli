import * as yargs from 'yargs'
import get from './get'
import count from './count'
import convert from './convert'
import intersect from './intersect'
import csv from './csv'
import picture from './profilePicture'
import scoresheet from './scoresheet/index'

yargs.command({
    command: 'get',
    describe: 'Get Instagram questionnaire data',
    handler: () => {
        get()
    }
}).argv

yargs.command({
    command: 'count',
    describe: 'Count Instagram questionnaire data',
    builder: {
        file: {
            describe: 'Location of data file to count',
            type: 'string'
        }
    },
    handler: argv => {
        count(argv.file)
    }
}).argv

yargs.command({
    command: 'convert',
    describe: 'Convert Instagram questionnaire data to readable JSON file',
    builder: {
        file: {
            describe: 'Location of data file to convert',
            type: 'string'
        },
        imputation: {
            describe: 'Whether to apply two-way (mean) imputation',
            type: 'boolean'
        }
    },
    handler: argv => {
        convert(argv.file as string, argv.imputation as boolean)
    }
}).argv

yargs.command({
    command: 'intersect',
    describe: 'Intersect two files containing Instagram questionnaire data',
    builder: {
        fileA: {
            describe: 'Location of first file',
            type: 'string',
            demandOption: true
        },
        fileB: {
            describe: 'Location of second file',
            type: 'string',
            demandOption: true
        }
    },
    handler: argv => {
        intersect(argv.fileA, argv.fileB)
    }
}).argv

yargs.command({
    command: 'csv',
    describe: 'Convert a JSON file to CSV',
    builder: {
        file: {
            describe: 'Location of the JSON file',
            type: 'string',
            demandOption: true
        }
    },
    handler: argv => {
        csv(argv.file)
    }
}).argv

yargs.command({
    command: 'picture',
    describe: 'Retrieve Instagram profile pictures of respondents',
    builder: {
        file: {
            describe: 'Location of the JSON input file',
            type: 'string',
            demandOption: true
        }
    },
    handler: argv => {
        picture(argv.file)
    }
}).argv

yargs.command({
    command: 'scoresheet',
    describe: 'Save scoresheets of respondents',
    builder: {
        file: {
            describe: 'Location of the JSON input file',
            type: 'string',
            demandOption: true
        },
        list: {
            describe: 'Location of username TXT list',
            type: 'string',
            demandOption: false
        }
    },
    handler: argv => {
        scoresheet(argv.file, argv.list)
    }
}).argv
