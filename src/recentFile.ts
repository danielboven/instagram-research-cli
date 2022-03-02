import fs from 'fs'
import path from 'path'

const getUnix = fileName => {
    if(!fileName.startsWith(process.env.IG_USERNAME)) return 0
    
    return parseInt(fileName.replace(`${process.env.IG_USERNAME}-`, ''))
}

export default function () {
    return new Promise(function (resolve, reject) {
        const directoryPath = path.join(__dirname, '..', '..', '/data/get')
        
        // Passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                reject(err)
            } 

            const recentFileName = files.reduce((lastFileName, currentFileName) => {
                if(getUnix(currentFileName) > getUnix(lastFileName)) return currentFileName
                return lastFileName
            })

            resolve(path.join(directoryPath, recentFileName))
        })
    })
}
