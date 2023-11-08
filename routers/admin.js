const express = require("express");
const path = require("path");
const router = express.Router();

router.use("/admin/mainPage", function (req, res) {
  //   res.sendFile(path.join(__dirname, "../views/admin", "admin.ejs"));
  res.render(path.join("admin/admin"));
});

module.exports = router;
