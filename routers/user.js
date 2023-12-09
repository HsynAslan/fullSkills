const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const dbConnection = require("../db");

const router = express.Router();
var isLogin = false;
const checkAuth = (req, res, next) => {
  if (req.session.userInfo) {
    // Oturumda kullanıcı bilgileri varsa devam et
    res.locals.userInfo = req.session.userInfo;
    return next();
  } else {
    res.redirect("/login");
  }
};
router.post("/saveSkill", (req, res) => {
  console.log("ad: " + req.session.userInfo);
  console.log(req.session.userInfo.name);

  console.log("yazma yerine girdi");
  const { skill, startDate, endDate, description, withWhom, rating } = req.body;
  const username = req.session.userInfo.name;

  // Veritabanına ekleme işlemi
  const query =
    "INSERT INTO user_skills (username, skill, start_date, end_date, description, with_whom, rating) VALUES (?, ?, ?, ?, ?, ?, ?)";

  dbConnection.query(
    query,
    [username, skill, startDate, endDate, description, withWhom, rating],
    (err, result) => {
      if (err) {
        console.error("MySQL Query Error: ", err);
        res.status(500).json({ success: false });
      } else {
        // res.json({ success: true, message: "User registered successfully" });
        res.send("<script>window.location.href = document.referrer;</script>");
      }
    }
  );
  console.log("yazma yerinden çıktı");
});
router.get("/login", (req, res) => {
  res.render("users/login", { currentPage: "/login" });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  dbConnection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("MySQL Query Error: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.length > 0) {
        req.session.userInfo = {
          name: username,
        };
        res.redirect("/dashboard/user/" + username);
      } else {
        res.render("users/login", { error: "Invalid username or password" });
      }
    }
  });
});

router.use("/about", (req, res) => {
  res.render(path.join("users/about"), { currentPage: "/about" });
});
router.use("/profile/user/:username", checkAuth, (req, res) => {
  Loading.dots();
  const requestedUsername = req.params.username;

  // Şimdi requestedUsername ile veritabanından ilgili kullanıcıyı sorgulayabilirsiniz.
  const query = "SELECT * FROM users WHERE username = ?";

  dbConnection.query(query, [requestedUsername], (err, results) => {
    if (err) {
      console.error("MySQL Query Error: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.length > 0) {
        // Kullanıcı bulundu, bilgileri userInfo'ye ekle
        const userInfo = {
          id: results[0].id,
          username: results[0].username,
          password: results[0].password,
          name: results[0].name,
          surname: results[0].surname,
        };

        res.render("users/profile", { currentPage: "/profile", userInfo });
      } else {
        // Kullanıcı bulunamadı
        res.render("users/profile", {
          currentPage: "/profile",
          userInfo: null,
        });
      }
    }
  });
  Loading.remove();
});

router.get("/dashboard/user/:username", checkAuth, (req, res) => {
  const requestedUsername = req.params.username;

  // Şimdi requestedUsername ile veritabanından ilgili kullanıcıyı sorgulayabilirsiniz.
  const query = "SELECT * FROM users WHERE username = ?";

  dbConnection.query(query, [requestedUsername], (err, results) => {
    if (err) {
      console.error("MySQL Query Error: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.length > 0) {
        // Kullanıcı bulundu, bilgileri userInfo'ye ekle
        const userInfo = {
          id: results[0].id,
          username: results[0].username,
          password: results[0].password,
          name: results[0].name,
          surname: results[0].surname,
        };

        res.render("users/dashboard", { currentPage: "/dashboard", userInfo });
      } else {
        // Kullanıcı bulunamadı
        res.render("users/dashboard", {
          currentPage: "/dashboard",
          userInfo: null,
        });
      }
    }
  });
});

router.use("/signIn", (req, res) => {
  res.render(path.join("users/signIn"), { currentPage: "/signIn" });
});

router.use("/blogs", (req, res) => {
  res.send("blog listesi");
});

router.use("/blogs/:blogid/users/:username", (req, res) => {
  console.log(
    "blogid: " + req.params.blogid,
    "username: " + req.params.username
  );
  res.send("blog detay listesi");
});
router.use("/", (req, res) => {
  res.render(path.join("users/index"), { currentPage: res.locals.currentPage });
});

module.exports = router;
