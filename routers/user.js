// var fs = require("fs");

// const routeHandler = (request, response) => {
//   if (request.url == "/") {
//     fs.readFile("index.html", (error, html) => {
//       response.writeHead(200, { "Content-Type": "text/html" });
//       response.write(html);
//       response.end();
//     });
//   } else if (request.url == "/blogs") {
//     fs.readFile("blogs.html", (error, html) => {
//       response.writeHead(200, { "Content-Type": "text/html" });
//       response.write(html);
//       response.end();
//     });
//   } else if (request.url == "/create" && request.method == "POST") {
//     const data = [];

//     request.on("data", (chunk) => {
//       data.push(chunk);
//     });

//     request.on("end", () => {
//       const result = Buffer.concat(data).toString();
//       const parsedData = result.split("=")[1];

//       fs.appendFile("blogs.txt", parsedData, (err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           response.statusCode = 302;
//           response.setHeader("Location", "/");
//           response.end();
//         }
//       });
//     });
//   } else if (request.url == "/create") {
//     fs.readFile("create.html", (error, html) => {
//       response.writeHead(200, { "Content-Type": "text/html" });
//       response.write(html);
//       response.end();
//     });
//   } else {
//     fs.readFile("404.html", (error, html) => {
//       response.writeHead(404, { "Content-Type": "text/html" });
//       response.write(html);
//       response.end();
//     });
//   }
// };

// module.exports = routeHandler;
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
        // res.render("dashboard", { username });
        // res.render(path.join("users/dashboard"), { currentPage: "/dashboard" });
        isLogin = true;
        res.redirect("/dashboard");
      } else {
        console.log("yanlış");
        console.log("results.length: " + results.length);
        console.log("username: " + username);
        console.log("pass: " + password);
        res.render("users/login", { error: "Invalid username or password" });
      }
    }
  });
});

router.use("/about", (req, res) => {
  res.render(path.join("users/about"), { currentPage: "/about" });
});
router.get("/dashboard", checkAuth, (req, res) => {
  res.render("users/dashboard", { currentPage: "/dashboard" });
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
