/* tslint:disable:no-console */
import { IgApiClient } from 'instagram-private-api'
import path from 'path'
import fs from 'fs-extra'

/**
 * Basic functions
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))    

const getFeedItems = async feed => {
    await delay(20 * 1000)  // delay 20 sec anti ban mode
        
    return await feed.items()
}

/**
 * Instagram API interaction
 */

export default async function () {
    const ig = new IgApiClient()
    ig.state.generateDevice(process.env.IG_USERNAME)
    const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)

    if(auth.username === process.env.IG_USERNAME) {
        console.log("Authentication success")
    }

    const timestamp = Math.floor(new Date().getTime() / 1000)

    const input = await fs.readJson('./input.json')

    // Get standard story data
    const reelsFeed = ig.feed.reelsMedia({ // working with reels media feed (stories feed)
        userIds: [auth.pk], // you can specify multiple user id's, "pk" param is user id
    })
    const storyItems = await reelsFeed.items() // getting reels, see "account-followers.feed.example.ts" if you want to know how to work with feeds

    // Quiz
    const quizzes = await input[auth.username].quiz.map(async quiz => {
        const quizFeed = ig.feed.storyQuizParticipants(quiz.mediaId, quiz.stickerId)
        let finished = false
        let answers = []

        while (!finished) {
            answers = [...answers, ... await getFeedItems(quizFeed)]
            finished = await ! quizFeed.isMoreAvailable()
        }

        console.log(`Quiz: ${quiz.question}`)

        return {
            question: quiz.question,
            answers,
            story: storyItems.find(story => story.id === quiz.mediaId)
        }
    })

    // Open question
    const openQuestions = await input[auth.username].question.map(async openQuestion => {
        const questionFeed = ig.feed.storyQuestionResponses(openQuestion.mediaId, openQuestion.stickerId)
        let finished = false
        let answers = []

        while (!finished) {
            answers = [...answers, ... await getFeedItems(questionFeed)]
            finished = await ! questionFeed.isMoreAvailable()
        }

        console.log(`Open question: ${openQuestion.question}`)

        return {
            question: openQuestion.question,
            answers,
            story: storyItems.find(story => story.id === openQuestion.mediaId)
        }
    })

    // Slider
    const sliders = await input[auth.username].slider.map(async slider => {        
        const sliderFeed = ig.feed.storySliderVoters(slider.mediaId, slider.stickerId)
        let finished = false
        let answers = []

        while (!finished) {
            answers = [...answers, ... await getFeedItems(sliderFeed)]
            finished = await ! sliderFeed.isMoreAvailable()
        }

        console.log(`Slider: ${slider.question}`)

        return {
            question: slider.question,
            answers,
            story: storyItems.find(story => story.id === slider.mediaId)
        }
    })

    // Gather output by waiting until all promises are finished
    const output = {
        quiz: await Promise.all(quizzes),
        question: await Promise.all(openQuestions),
        slider: await Promise.all(sliders)
    }

    fs.writeJson(
        path.join(__dirname, '..', '..', `/data/get/${auth.username}-${timestamp}.json`),
        output,
        err => {
            if (err) return console.error(err)
            console.log('File successfully written')
        }        
    )
}