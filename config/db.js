const mongoose = require('mongoose')
const config = require('config');
const db = config.get('mongoURI')
const dbConnect = ()=>{
    mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (error) =>{
    if(error) throw error
    console.log('database connected')
})
}

module.exports = dbConnect;



