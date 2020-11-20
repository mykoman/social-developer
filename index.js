const express = require('express')
const app = express();
const dbConnection  = require('./config/db')

//connect to database
dbConnection()

app.get('/',(req, res)=> res.send("Homepage"))

app.listen(5000, ()=>console.log("server running") )