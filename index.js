const express = require('express')
const app = express();

app.get('/',(req, res)=> res.send("Homepage"))

app.listen(5000, ()=>console.log("server running") )