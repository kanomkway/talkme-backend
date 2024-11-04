const express = require("express");
const router = express.Router();
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const mysql = require("mysql2");
// const mysql = require("mysql");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET-POST-PUT-DELETE");
  next();
});
app.use(express.json());

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  port: "3306",
  database: "talkme",
});

con.connect(function (err) {
  if (err) throw err;
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.send("Welcome to API");
});

app.get("/api/general", (req, res) => {
  con.query("SELECT * FROM tag_general", function (err, result, fields) {
    if (err) throw res.status(400).send("No products found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/general/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM tag_general where id=${id}`,
    function (err, result, fields) {
      if (err) throw err;
      if (result.length == 0)
        res.status(400).send(`No content id: ${id} found`);
      else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/api/food", (req, res) => {
  con.query("SELECT * FROM tag_food", function (err, result, fields) {
    if (err) throw res.status(400).send("No products found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/food/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM tag_food where id=${id}`,
    function (err, result, fields) {
      if (err) throw err;
      if (result.length == 0)
        res.status(400).send(`No content id: ${id} found`);
      else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/api/music", (req, res) => {
  con.query("SELECT * FROM tag_music", function (err, result, fields) {
    if (err) throw res.status(400).send("No products found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/music/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM tag_music where id=${id}`,
    function (err, result, fields) {
      if (err) throw err;
      if (result.length == 0)
        res.status(400).send(`No content id: ${id} found`);
      else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.post("/api/addcomment", (req, res) => {
  const uid = req.body.uid;
  const tag = req.body.tag;
  const content = req.body.content;
  console.log(uid, tag, content);
  con.query(
    `INSERT INTO comment (uid, tag, content) VALUES ('${uid}', '${tag}', '${content}')`,
    function (err, result, fields) {
      if (err) throw res.status(400).send(`Error. Cannot add product.`);
      else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
