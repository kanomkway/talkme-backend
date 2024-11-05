const express = require("express");
const router = express.Router();
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
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
app.use(cors());
app.use(express.json());

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  port: "3306",
  database: "talkme",
  connectTimeout: 30000, // ตั้งค่า timeout เป็น 30 วินาที
});

con.connect(function (err) {
  if (err) return err;
  console.log("Connected to database");
});

app.get("/", (req, res) => {
  const query = `
    SELECT * FROM (
      SELECT * FROM general
      UNION ALL
      SELECT * FROM food
      UNION ALL
      SELECT * FROM music
    ) AS combined_table
    ORDER BY id DESC
  `;
  con.query(query, function (err, result, fields) {
    if (err) return res.status(400).send("No products found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api", (req, res) => {
  res.send("Welcome to API");
});

app.get("/api/search", (req, res) => {
  const query = req.query.query; // รับพารามิเตอร์ 'query' จาก URL
  if (!query) {
    return res.status(400).send("Query parameter is missing");
  }

  // Query สำหรับการค้นหาในตาราง tag_general, tag_food และ tag_music
  const searchQuery = `
    SELECT * FROM (
      SELECT * FROM general WHERE title LIKE ? OR content LIKE ?
      UNION ALL
      SELECT * FROM food WHERE title LIKE ? OR content LIKE ?
      UNION ALL
      SELECT * FROM music WHERE title LIKE ? OR content LIKE ?
    ) AS combined_table
    ORDER BY id DESC
  `;

  const searchParam = `%${query}%`;

  con.query(
    searchQuery,
    [
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "ไม่สามารถทำการค้นหาได้" });
      }
      res.json(results || []);
    }
  );
});

app.get("/api/user", (req, res) => {
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) {
      return res.status(400).send("No user found");
    }
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

app.put("/api/updateuser/:username", (req, res) => {
  const oldUsername = req.body.oldUsername;
  const newUsername = req.body.newUsername;
  const password = req.body.password;
  console.log(
    "Updating from ",
    oldUsername,
    " to ",
    newUsername,
    " with password: ",
    password
  );
  if (oldUsername === newUsername) {
    con.query(
      `UPDATE user SET password = ? WHERE username = ?`,
      [password, oldUsername],
      (err, result) => {
        if (err) {
          console.error("Error updating user:", err);
          return res.status(400).send("Error, cannot update user");
        }

        // ตรวจสอบว่าการอัปเดตสำเร็จหรือไม่
        if (result.affectedRows > 0) {
          res.send({ message: "Updated successfully", status: "ok" });
        } else {
          res.status(404).send("User not found for update");
        }
      }
    );
  } else {
    // ถ้า newUsername ไม่เหมือนกับ oldUsername, ตรวจสอบว่า newUsername มีในระบบแล้วหรือไม่
    con.query(
      "SELECT * FROM user WHERE username = ?",
      [newUsername],
      (err, results) => {
        if (err) {
          console.error("Error checking username:", err);
          return res.status(500).send("Server error");
        }

        // ถ้า username ใหม่มีอยู่ในฐานข้อมูล
        if (results.length > 0) {
          return res.status(400).send("Username already exists");
        }

        // ถ้า username ใหม่ไม่ซ้ำกัน, อัปเดต username และ password
        con.query(
          `UPDATE user SET username = ?, password = ? WHERE username = ?`,
          [newUsername, password, oldUsername],
          (err, result) => {
            if (err) {
              console.error("Error updating user:", err);
              return res.status(400).send("Error, cannot update user");
            }

            // ตรวจสอบว่าการอัปเดตสำเร็จหรือไม่
            if (result.affectedRows > 0) {
              res.send({ message: "User updated successfully", status: "ok" });
            } else {
              res.status(404).send("User not found for update");
            }
          }
        );
      }
    );
  }
});

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
  console.log(category, id);
  try {
    const query = `DELETE FROM ?? WHERE id = ?`;
    con.query(query, [category, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Cannot delete post." });
      }
      res.status(200).json({ message: "Deleted post successfully!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "connection error" });
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
      if (err) return err;
      if (result.length == 0)
        return res.status(400).send(`No content id: ${id} found`);
      else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/api/food", (req, res) => {
  con.query("SELECT * FROM food", function (err, result, fields) {
    if (err) return res.status(400).send("No content found");
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
    if (err) return res.status(400).send("No content found");
    console.log(result);
    res.send(result);
  });
});

app.get("/api/music/:id", (req, res) => {
  const id = req.params.id;
  con.query(
    `SELECT * FROM music where id=${id}`,
    function (err, result, fields) {
      if (err) return err;
      if (result.length == 0)
        res.status(400).send(`No content id: ${id} found`);
      else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/content", (req, res) => {
  const tag = req.query.tag;
  const id = req.query.id;

  console.log("Received:", { id, tag });
  con.query(
    "SELECT * FROM comment where tag =? AND idp =?",
    [tag, id],
    function (err, result, fields) {
      if (err) {
        return res.status(400).send("No user found");
      }
      console.log(result);
      res.send(result);
    }
  );
});

app.post("/api/addcomment", (req, res) => {
  const { id, tag, info } = req.body;
  console.log("Received:", { id, tag, info });

  const query = `INSERT INTO comment (idp, tag,info) VALUES (?,?,?)`;
  con.query(query, [id, tag, info], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "ไม่สามารถเพิ่มข้อมูลได้" });
    }
    return res.status(200).json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
