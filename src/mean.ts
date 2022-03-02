import _ from 'lodash'

export default function (input, items) {
    const qaItems = input.map(qa => _.pickBy(qa, (answer, question) => items.includes(question)))
    const overallScores = _.flatten(input.map(qa => {
        // Only return all answers that have a reputation score answer (number between 0 and 1)
        return Object.values(qa).map(value => typeof value === 'number' && value >= 0 && value <= 1)
    }))
    const overallMean = _.mean(overallScores)

    for (const item of items) {
        let columnAnswers = input.map(qa => qa[item])
        const itemMean = _.mean(columnAnswers.filter(value => typeof value === 'number'))

        input = input.map((qa, index) => {
            // Participant mean
            const partMean = _.mean(Object.values(qaItems[index]))
            const twoWay = partMean + itemMean - overallMean
            
            qa[item] = typeof qa[item] === 'number' ?
                qa[item] :
                twoWay > 0 ? twoWay : 0

            return qa
        })
    }

    return input
}