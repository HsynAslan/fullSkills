// const http = require("http");
// const routes = require("./routes");
// const path = require("path");
// const express = require("express");
// const app = express();
// const dbConnection = require("./db"); // db.js'yi dahil et

// const fontAwesomePath = path.join(
//   __dirname,
//   "node_modules/@fortawesome/fontawesome-free"
// );

// // Font Awesome CSS dosyasını sunmak için middleware ekleyin
// app.use("/fontawesome", express.static(path.join(fontAwesomePath, "css")));

// app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // var server = http.createServer(routes);

// const userRoutes = require("./routers/user");
// const taskModule = require("./tasks/index");
// const adminRoutes = require("./routers/admin");
// app.use(express.static("node_modules"));
// app.use(express.static("public"));

// app.use(adminRoutes);
// app.use(userRoutes);

// app.listen(3000, function () {
//   console.log("node.js server at port 3000");
// });
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dbConnection = require("./db");

const app = express();
const port = 3000;

app.use(
  "/fontawesome",
  express.static(
    path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/css")
  )
);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("node_modules"));
app.use(express.static("public"));

app.use("/", (req, res, next) => {
  res.locals.currentPage = "/";
  next();
});

const userRoutes = require("./routers/user");
const adminRoutes = require("./routers/admin");
app.use(userRoutes);
app.use(adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
