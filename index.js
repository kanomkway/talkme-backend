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
  connectTimeout: 30000, // ตั้งค่า timeout เป็น 30 วินาที
  acquireTimeout: 30000,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.send("Welcome to API");
});

app.get("/api/user", (req, res) => {
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw res.status(400).send("No user found");
    console.log(result);
    res.send(result);
  });
});

app.post("/api/adduser", (req, res) => {
  const { username, password } = req.body;
  console.log("Received:", { username, password });

  const checkUserQuery = "SELECT * FROM talkme.user WHERE username = ?";
  con.query(checkUserQuery, [username], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" });
    }

    // ถ้า username มีอยู่แล้ว
    if (results.length > 0) {
      return res.status(400).json({
        message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น",
      });
    }

    // ถ้า username ยังไม่มีอยู่ในฐานข้อมูล
    const insertUserQuery =
      "INSERT INTO talkme.user (username, password) VALUES (?, ?)";
    con.query(insertUserQuery, [username, password], (err, results) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ message: "ไม่สามารถเพิ่มข้อมูลได้" });
      }

      return res.status(200).json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    });
  });
});

// con.query(
//   `INSERT INTO user (username, password) VALUES ('${username}', '${password}')`,
//   function (err, result, fields) {
//     if (err) {
//       // throw res.status(400).send(`Error. Cannot add user.`);
//       return res.status(500).json({ message: "Error. Cannot add user." });
//     } else {
//       console.log(result);
//       res.send(result);
//       res.status(200).json({ message: "เพิ่มข้อมูลสำเร็จ!" });
//     }
//   }
// );

app.post("/api/addto/:category", (req, res) => {
  const { title, content } = req.body;
  const category = req.params.category;
  console.log("Received:", { title, category, content });

  const query = `INSERT INTO ?? (title, content) VALUES (?, ?)`;
  con.query(query, [category, title, content], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "ไม่สามารถเพิ่มข้อมูลได้" });
    }
    return res.status(200).json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  });
});

app.delete("/api/delete/:category/:id", (req, res) => {
  const { category, id } = req.params;
  try {
    const query = `DELETE FROM ?? WHERE id = ?`;
    con.query(query, [category, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "ไม่สามารถลบโพสต์ได้" });
      }
      res.status(200).json({ message: "ลบโพสต์สำเร็จ!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
  }
});

app.get("/api/general", (req, res) => {
  con.query("SELECT * FROM general", function (err, result, fields) {
    if (err) throw res.status(400).send("No content found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/general/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM general where id=${id}`,
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
  con.query("SELECT * FROM food", function (err, result, fields) {
    if (err) throw res.status(400).send("No content found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/food/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM food where id=${id}`,
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
  con.query("SELECT * FROM music", function (err, result, fields) {
    if (err) throw res.status(400).send("No content found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/music/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM music where id=${id}`,
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
      if (err) throw res.status(400).send(`Error. Cannot add comment.`);
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
