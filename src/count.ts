import fs from 'fs-extra'
import { table } from 'table'
import recentFile from './recentFile'

const displaySingleTable = (stickers, header) => {
    const data = stickers.map(sticker => [sticker.question, sticker.answers.length])

    const config = {
        columns: {
            0: { width: 80 }
        },
        header: {
            content: header,
        },
    }

    console.log(table(data, config))
}

export default async function (filePath) {
    if (!filePath) {
        filePath = await recentFile()
    }

    const input = await fs.readJson(filePath)

    displaySingleTable(input.quiz, 'QUIZZES')
    displaySingleTable(input.question, 'OPEN QUESTIONS')
    displaySingleTable(input.slider, 'SLIDERS')
}
