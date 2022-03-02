require('@babel/register')({
    extensions: ['.js', '.ts']
})

require('dotenv').config()
require ('./src/index')