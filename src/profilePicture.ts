/* tslint:disable:no-console */
import { IgApiClient } from 'instagram-private-api'
import https from 'https'
import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'

/**
 * Instagram API interaction
 */

export default async function (filePath) {
    const input = await fs.readJson(filePath)
    let userIds = []
    
    const ig = new IgApiClient()
    ig.state.generateDevice(process.env.IG_USERNAME)
    const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD)

    if(auth.username === process.env.IG_USERNAME) {
        console.log("Authentication success")
    }

    for (const item of input.quiz) {
        userIds = [
            ...userIds,
            ...item.answers.map(answer => answer.user.pk)
        ]
    }

    const profilePictures = await _.uniq(userIds).map(async id => {        
        return {
            pk: id,
            url: ( await ig.user.info(id) ).hd_profile_pic_url_info.url
        }
    })

    for (const profilePicture of profilePictures) {
        const resolved = await profilePicture
        
        https.get(resolved.url, res => {
            res.pipe(fs.createWriteStream(
                path.join(__dirname, '..', '..', '/data/profilePictures', `${resolved.pk}.jpg`)
            ))

            console.log(resolved.pk)
        })
    }
}
