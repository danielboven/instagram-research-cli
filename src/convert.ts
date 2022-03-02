import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'
import { table } from 'table'
import chalk from 'chalk'
import recentFile from './recentFile'
import schema from './schema'
import mean from './mean'
import inquirer from 'inquirer'
import parseInt from 'parse-int'

const validateAnswer = async (surveyData, userName: string) => {
    let i = 0

    const { Keep, ...qa } = surveyData

    for await (const [question, answer] of Object.entries(qa)) {
        switch(schema[question].type) {
            case 'string':
                if (typeof answer === 'string') break
                
                await inquirer
                    .prompt([{
                        type: 'input',
                        name: i.toString(),
                        message: `${question}\nFollowing answer is not a string: ${answer}`
                    }])
                    .then(answers => {
                        if (answers[i.toString()] === 'n') {
                            delete surveyData[question]
                        } else if (typeof answers[i.toString()] === 'string') {
                            surveyData[question] = answers[i.toString()]
                        }
                    })
                
                break
            case 'float':
                if (typeof answer !== 'number') {
                    delete surveyData[question]
                }

                break
            case 'integer':
                let integer = parseInt(answer)

                if (integer % 1 === 0) {
                    surveyData[question] = integer
                } else {
                    await inquirer
                        .prompt([{
                            type: 'number',
                            name: i.toString(),
                            message: `${question}\nFollowing answer is not an integer: ${answer}`
                        }])
                        .then(answers => {
                            integer = answers[i.toString()]
                            
                            if (integer === 0) {
                                delete surveyData[question]
                            } else {
                                surveyData[question] = answers[i.toString()]
                            }
                        })
                }

                // If answer is greater than maximum allowed value
                if(integer > schema[question].maxValue) {
                    console.log(`${question} of following user is too high:\n${userName}\n`)
                    delete surveyData[question]
                    surveyData.old = true
                }
                
                break
        }

        // Apply English translation of option if this is available in schema
        const optionsSchema = _.get(schema, [question, 'options'], false)

        if (optionsSchema) {
            const answer = surveyData[question]
            surveyData[question] = optionsSchema[answer]
        }

        i++
    }

    return surveyData
}

const applyImputation = input => {
    const products = [
        "Offers high quality products and services",
        "Offers products and services that are a good value for the money",
        "Stands behind its products and services",
        "Meets customer needs"
    ]

    const citizenship = [
        "Acts responsibly to protect the environment",
        "Supports good causes",
        "Has a positive influence on society"
    ]

    const governance = [
        "Is open and transparent about the way the company operates",
        "Behaves ethically",
        "Is fair in the way it does business"
    ]

    let output = mean(input, products)
    output = mean(output, citizenship)
    output = mean(output, governance)

    return output
}

const displayRequiredQuestionsTable = inputData => {
    const headerQuestions = inputData.reduce(
        (questions, currentValue) => _.union(questions, currentValue.questions),
        []
    )

    const tableData = inputData.map(item => {
        return [
            item.username,
            ...headerQuestions.map(question => item.questions.includes(question) ? '×': '')
        ]
    })

    const config = {
        header: {
            content: chalk.red('UNANSWERED REQUIRED QUESTIONS'),
        }
    }

    console.log('\n')

    console.log(table([
        ['Username', ...headerQuestions].map(item => chalk.bold(item)),
        ...tableData
    ], config))
}

const displaySliderAnswersTable = inputData => {
    const header = [
        'Username',
        'Slider values'
    ]

    const config = {
        header: {
            content: chalk.red('TOO MANY OF THE SAME SLIDER ANSWERS'),
        },
        columnDefault: {
            width: 20
        }
    }

    console.log('\n')

    console.log(table([
        header.map(item => chalk.bold(item)),
        ...inputData
    ], config))
}

export default async function (filePath, imputation = false) {
    if (!filePath) {
        filePath = await recentFile()
    }

    const input = await fs.readJson(filePath)
    let output = {}

    // Quiz
    input.quiz.forEach(quiz => {
        quiz.answers.forEach(answer => {
            _.set(
                output,
                [answer.user.username, quiz.question],
                quiz.story.story_quizs[0].quiz_sticker.tallies[answer.answer].text
            )
        })
    })

    // Open question
    input.question.forEach(openQuestion => {
        openQuestion.answers.forEach(answer => {
            _.set(
                output,
                [answer.user.username, openQuestion.question],
                answer.response
            )
        })
    })

    // Slider
    input.slider.forEach(slider => {
        slider.answers.forEach(answer => {
            _.set(
                output,
                [answer.user.username, slider.question],
                answer.vote
            )
        })
    })

    try {
        const overwriteFileName = `overwrite-${path.basename(filePath)}`
        const overwriteInput = await fs.readJson(
            path.join(__dirname, '..', '..', '/data/convert/input', overwriteFileName),
        )
        output = _.merge(output, overwriteInput)

        console.log(`Overwrite document applied: ${overwriteFileName}\n`)
    } catch {
        console.log('No overwrite document found\n')
    }

    output = _.pickBy(output, qa => _.get(qa, 'Keep', true))

    for (const [index, surveyData] of Object.values(output).entries()) {
        output[Object.keys(output)[index]] = await validateAnswer(surveyData, Object.keys(output)[index])
    }

    const requiredQuestionsInput = []
    const sliderAnswersInput = []

    // Filter incomplete answers
    output = _.pickBy(output, (qa, key) => {
        if(_.get(qa, 'Keep', false)) {
            return true
        }

        const filterThreshold = 8

        const requiredQuestions = Object.keys(schema).filter((question: string) => schema[question].type !== 'float')
        const sliderQuestions = Object.keys(schema).filter((question: string) => schema[question].type === 'float')

        const sufficientSliderQuestions = _.intersection(sliderQuestions, Object.keys(qa)).length >= filterThreshold

        // Indication of which required questions are unanswered and by whom
        const unansweredQuestions = _.difference(Object.keys(schema), Object.keys(qa))
        const requiredUnansweredQuestions = _.difference(unansweredQuestions, sliderQuestions)

        if(requiredUnansweredQuestions.length > 0 && sufficientSliderQuestions && _.get(qa, 'old') !== true) {
            requiredQuestionsInput.push({
                username: key,
                questions: requiredUnansweredQuestions
            })
        }

        const sliderAnswersCounter = {}

        // Get sliderAnswers and populate sliderAnswersCounter
        const sliderAnswers = sliderQuestions.map(sliderQuestion => {
            const currentCount = _.get(sliderAnswersCounter, qa[sliderQuestion], 0)
            sliderAnswersCounter[qa[sliderQuestion]] = currentCount + 1

            return qa[sliderQuestion]
        })

        const tooManyRecurringSliderAnswers = _.max(Object.values(sliderAnswersCounter)) >= 6 ||
            Object.values(sliderAnswersCounter).length <= 3

        if (
            tooManyRecurringSliderAnswers &&
            sufficientSliderQuestions &&
            requiredUnansweredQuestions.length === 0
        ) {
            sliderAnswersInput.push([
                key,
                sliderAnswers.join('\n')
            ])
        }

        return _.intersection(requiredQuestions, Object.keys(qa)).length === requiredQuestions.length &&
            sufficientSliderQuestions &&
            ! tooManyRecurringSliderAnswers
    })

    if (requiredQuestionsInput.length !== 0) {
        displayRequiredQuestionsTable(requiredQuestionsInput)   
    }

    if (sliderAnswersInput.length !== 0) {
        displaySliderAnswersTable(sliderAnswersInput)
    }

    // Construct final array from output
    let outputArray = Object.keys(output).map(username => {
        return {
            Username: username,
            ...output[username]
        }
    })

    if (imputation) {
        outputArray = applyImputation(outputArray)
    }

    console.log(`Valid responds count:\n${outputArray.length}\n`)

    const fileName = imputation ? `imputation-${path.basename(filePath)}` : path.basename(filePath)

    fs.writeJson(
        path.join(__dirname, '..', '..', '/data/convert', fileName),
        outputArray,
        err => {
            if (err) return console.error(err)
            console.log('File successfully written')
        }        
    )
}
