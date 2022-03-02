import { createReadStream, createWriteStream } from 'fs'
import path from 'path'
import { AsyncParser } from 'json2csv'
import schema from './schema'
import recentFile from './recentFile'

export default async function (inputPath) {
    const outputPath = path.join(__dirname, '..', '..', '/data/csv', `${path.basename(inputPath, '.json')}.csv`)
    const fields = ['Username', ...Object.keys(schema)]

    // Using the promise API just to know when the process finnish
    // but not actually load the CSV in memory
    const input = createReadStream(inputPath, { encoding: 'utf8' })
    const output = createWriteStream(outputPath, { encoding: 'utf8' })
    const asyncParser = new AsyncParser({ fields })
    const parsingProcessor = asyncParser.fromInput(input).toOutput(output)

    parsingProcessor.promise(false)
        .then(() => console.log('File successfully written'))
        .catch(err => console.error(err))
}
