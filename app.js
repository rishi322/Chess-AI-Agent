const express = require('express')
const app = express();
const cors = require('cors')
const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/chess-db").then(console.log('connected'))
app.use(express.urlencoded({extended:false}))
app.use(express.json());

app.use(cors())
app.use('/games',require('./Routes/games'))


app.use('/User',require('./Routes/user'));

app.get('/',(req,res)=>{

  console.log('this is home')
})

app.listen(3000,()=>{
  console.log('server is listening on port 3000')
})