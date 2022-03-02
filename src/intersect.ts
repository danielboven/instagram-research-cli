import fs from 'fs-extra'
import _ from 'lodash'

export default async function (fileA, fileB) {
    const inputA = await fs.readJson(fileA)
    const inputB = await fs.readJson(fileB)

    const usernamesA = inputA.map(item => item['Username'])
    const usernamesB = inputB.map(item => item['Username'])

    const intersection = _.intersection(usernamesA, usernamesB)

    if (intersection.length === 0) {
        console.log('No double entries were found')
    } else {
        console.log('Double entries were found:\n')
        
        for (const userName of intersection) {
            console.log(userName)
        }
    }
}
