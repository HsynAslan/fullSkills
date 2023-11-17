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
const path = require("path");

const router = express.Router();
router.use("/blogs/:blogid/users/:username", function (req, res) {
  console.log(
    "blogid: " + req.params.blogid,
    "username: " + req.params.username
  );
  res.send("blog detay listesi");
});

router.use("/login", (req, res) => {
  res.render(path.join("users/login"), { currentPage: "/login" });
});
router.use("/about", (req, res) => {
  res.render(path.join("users/about"), { currentPage: "/about" });
});
router.use("/signIn", (req, res) => {
  res.render(path.join("users/signIn"), { currentPage: "/signIn" });
});

router.use("/blogs", function (req, res) {
  res.send("blog listesi");
});

router.use("/", (req, res) => {
  res.render(path.join("users/index"), { currentPage: res.locals.currentPage });
});

module.exports = router;
