const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
var mysql = require('mysql');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization"
  )
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET-POST-PUT-DELETE"
  );
  next();
})
app.use(express.json())

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  port: "33066",
  database: "talkme",
});

con.connect(function(err){
  if(err) throw err;
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/general',(req,res)=>{
  con.query("SELECT * FROM tag_general",function(err,result,fields){
    if(err) throw res.status(400).send("No products found");
    console.log(result);
    res.send(result);
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
