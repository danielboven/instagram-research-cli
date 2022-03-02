import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'
import puppeteer from 'puppeteer'
import queryString from 'query-string'
import filenamify from 'filenamify'
import translations from './translations'

export default async function (filePath, listPath) {
    const input = await fs.readJson(filePath)
    const list = fs.readFileSync(listPath).toString().split("\n")

    const filtered = input.filter(item => list.includes( item['Username'] ))

    for (const respondent of filtered) {
        const urlParameters = {
            username: respondent['Username'],
            scores: _.flatten(
                Object.keys(translations)
                    .filter(item => respondent.hasOwnProperty(item))
                    .map(item => [translations[item], Math.round(respondent[item] * 100)])
            )
        }
    
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 375,
                height: 667,
                deviceScaleFactor: 2
            }
        })
        const page = await browser.newPage()
        await page.goto(`file:${path.join( __dirname, '/template/index.html')}?${queryString.stringify(urlParameters)}` )

        const parents = await page.$$('.parent')

        for (let i = 1; i <= parents.length; i++) {
            const element = await page.$(`#parent-${i}`)    
            await element.screenshot({
                path: path.join( __dirname, 'output', `${filenamify( respondent['Username'] )}_IMG_${i}.png` )
            })
        }

        await browser.close()
    }

    console.log('Finished saving scoresheets')
}
