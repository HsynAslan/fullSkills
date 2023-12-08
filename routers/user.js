const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const dbConnection = require("../db");

const router = express.Router();
var isLogin = false;
const checkAuth = (req, res, next) => {
  if (isLogin == true) {
    console.log("içinde");
    // userInfo'yi res.locals üzerinde tanımla
    const username = req.body.username; // Kullanıcının adını doğru şekilde almak için

    res.locals.userInfo = {
      name: username, // Gerçek kullanıcı adını buraya eklemelisin
    };
    return next();
  } else {
    console.log("içinde değil");
    res.redirect("/login");
  }
};

router.use("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  dbConnection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("MySQL Query Error: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.length > 0) {
        console.log("doğru");
        isLogin = true;
        // userInfo'yi res.locals üzerinde tanımla
        res.locals.userInfo = {
          name: username,
        };
        res.redirect("/dashboard/user/" + username);
      } else {
        console.log("yanlış");
        res.render("users/login", { error: "Invalid username or password" });
      }
    }
  });
});

router.use("/about", (req, res) => {
  res.render(path.join("users/about"), { currentPage: "/about" });
});
router.use("/profile/user/:username", checkAuth, (req, res) => {
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
