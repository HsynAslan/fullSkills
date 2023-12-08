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

// Logout endpoint'i
app.post("/logout", (req, res) => {
  // Gönderilen JSON verisinden isLogin değerini al
  const { isLogin: logoutStatus } = req.body;

  // isLogin değerini güncelle (Bu kısmı uygulamana uygun şekilde ayarla)
  const username = req.session.userInfo.username; // Kullanıcının adını aldık, bu kısmı uygulamanıza uygun şekilde değiştirmelisiniz

  const query = "UPDATE users SET isLogin = ? WHERE username = ?";
  dbConnection.query(query, [logoutStatus, username], (err, result) => {
    if (err) {
      console.error("MySQL Query Error: ", err);
      res.status(500).json({ success: false });
    } else {
      // Kullanıcının oturumu başarıyla sonlandırıldı
      res.json({ success: true });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
