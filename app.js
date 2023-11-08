const http = require("http");
const routes = require("./routes");
const path = require("path");
const express = require("express");
const app = express();

const fontAwesomePath = path.join(
  __dirname,
  "node_modules/@fortawesome/fontawesome-free"
);

// Font Awesome CSS dosyasını sunmak için middleware ekleyin
app.use("/fontawesome", express.static(path.join(fontAwesomePath, "css")));

app.set("view engine", "ejs");

// var server = http.createServer(routes);

const userRoutes = require("./routers/user");
const taskModule = require("./tasks/index");
const adminRoutes = require("./routers/admin");
app.use(express.static("node_modules"));
app.use(express.static("public"));

app.use(adminRoutes);
app.use(userRoutes);

app.listen(3000, function () {
  console.log("node.js server at port 3000");
});
