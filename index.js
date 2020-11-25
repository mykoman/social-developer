const express = require('express')
const app = express();
const dbConnection  = require('./config/db')

//connect to database
dbConnection()


//initialize middleware so as to have access to request body
app.use(express.json({extended : false}))
app.get('/',(req, res)=> res.send("Homepage"))


app.use('/api/user', require('./routes/api/user'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))


app.listen(5000, ()=>console.log("server running") )