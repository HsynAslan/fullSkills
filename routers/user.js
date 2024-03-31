const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const notiflix = require("notiflix"); // Notiflix modülünü ekledik
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

// Arkadaşlık isteği gönderildikten sonra Notiflix kullanımı
router.get("/sendFriendRequest/:name/:username", (req, res) => {
  const { name, username } = req.params;
  const senderUsername = name;
  const receiverUsername = username;

  // Kontrol 1: Aynı kullanıcıya daha önce arkadaşlık isteği gönderilmiş mi?
  const checkPreviousRequestQuery =
    "SELECT * FROM dbname.friendreq WHERE senderUsername = ? AND receiverUsername = ?";
  dbConnection.query(
    checkPreviousRequestQuery,
    [senderUsername, receiverUsername],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error("MySQL Query Error: ", checkErr);
        res.status(500).send("Internal Server Error");
      } else {
        if (checkResults.length > 0) {
          // Kullanıcıya daha önce arkadaşlık isteği gönderilmişse, işlemi gerçekleştirme
          console.log("Bu kullanıcıya daha önce istek gönderilmiş.");
          res.redirect(`/users/network/${name}`);
        } else {
          // Kontrol 2: Kendine arkadaşlık isteği göndermeye çalışıyor mu?
          if (senderUsername === receiverUsername) {
            // Kendine arkadaşlık isteği gönderiyorsa, işlemi gerçekleştirme
            console.log("Kendine arkadaşlık isteği gönderilemez.");
            res.redirect(`/users/network/${name}`);
          } else {
            // Yeni arkadaşlık isteği eklemek için veritabanına ekleme işlemi yap
            const addFriendRequestQuery =
              "INSERT INTO dbname.friendreq (senderUsername, receiverUsername) VALUES (?, ?)";
            dbConnection.query(
              addFriendRequestQuery,
              [senderUsername, receiverUsername],
              (err, results) => {
                if (err) {
                  console.error("MySQL Query Error: ", err);
                  res.status(500).send("Internal Server Error");
                } else {
                  // Notiflix ile bildirim göster
                  res.locals.successMessage =
                    "Arkadaşlık isteği başarıyla gönderildi.";
                  res.redirect(`/users/network/${name}`);
                }
              }
            );
          }
        }
      }
    }
  );
});

router.get("/users/search", (req, res) => {
  console.log("search'a girdi");
  const searchTerm = req.query.term;

  // Veritabanında arama işlemi
  if (searchTerm) {
    const query =
      "SELECT name, surname, username FROM users WHERE name LIKE ? OR surname LIKE ? OR username LIKE ?";

    const searchValue = `%${searchTerm}%`;

    dbConnection.query(
      query,
      [searchValue, searchValue, searchValue],
      (err, results) => {
        if (err) {
          console.error("MySQL Query Error: ", err);
          res.status(500).json({ success: false });
        } else {
          res.render("users/searchResults", {
            results,
            userInfo: req.session.userInfo,
          });
        }
      }
    );
  }
});

router.post("/saveUser", (req, res) => {
  // req.body objesinden gerekli bilgileri al
  const {
    signInName,
    signInSurName,
    signInUsername,
    signInPassword,
    signInPasswordA,
    teacher,
  } = req.body;

  // Diğer kontrolleri ve işlemleri gerçekleştir
  console.log("----------------------");
  console.log("öğretmen misin: " + teacher);

  // Örneğin, parolaların eşleşip eşleşmediğini kontrol et
  if (signInPassword !== signInPasswordA) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  // Veritabanına ekleme işlemi
  const query =
    "INSERT INTO users (username, password, name, surname, isteacher) VALUES (?, ?, ?, ?, ?)";

  dbConnection.query(
    query,
    [signInUsername, signInPassword, signInName, signInSurName, teacher],
    (err, result) => {
      if (err) {
        console.error("MySQL Query Error: ", err);
        res.status(500).json({ success: false });
      } else {
        res.redirect("/login");
      }
    }
  );
});

router.post("/saveSkill", (req, res) => {
  // req.body objesinden gerekli bilgileri al
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
        res.redirect("/dashboard/user/" + username);
      }
    }
  );
});

router.get("/users/network/:username", checkAuth, (req, res) => {
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

        res.render("users/network", { currentPage: "/network", userInfo });
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
router.get(
  "/acceptFriendRequest/:username/:senderUsername/:requestID",
  (req, res) => {
    const requestID = req.params.requestID;
    const { username, senderUsername } = req.params;
    console.log("isteği kabul eden: " + username);
    console.log("isteği başta atan : " + senderUsername);
    const acceptUserName = username;
    // Arkadaşlık isteğini kabul etme işlemini gerçekleştir
    const acceptFriendRequestQuery =
      "UPDATE friendreq SET status = 'accepted' WHERE requestID = ?";

    dbConnection.query(
      acceptFriendRequestQuery,
      [requestID],
      (err, results) => {
        if (err) {
          console.error("Accept Friend Request Query Error: ", err);
          res.status(500).send("Internal Server Error");
        } else {
          // Arkadaşlık isteği kabul edildi, şimdi friendships tablosuna ekle
          const addFriendshipQuery =
            "INSERT INTO dbname.friendships (user1Username, user2Username) VALUES (?, ?)";
          dbConnection.query(
            addFriendshipQuery,
            [username, senderUsername],
            (friendshipErr, friendshipResults) => {
              if (friendshipErr) {
                console.error("Add Friendship Query Error: ", friendshipErr);
                res.status(500).send("Internal Server Error");
              } else {
                console.log("arkadaş eklendi");
                // Arkadaşlık başarıyla eklendi.
                // İstersen burada başka işlemler de yapabilirsin.
                res.redirect(`/users/notification/${acceptUserName}`);
              }
            }
          );
        }
      }
    );
  }
);

router.get(
  "/rejectFriendRequest/:username/:senderUsername/:requestID",
  (req, res) => {
    const requestID = req.params.requestID;
    const username = req.params.username;
    const senderUsername = req.params.senderUsername; // Bu satırı ekledik
    console.log("Reddet'e girdi");

    // Arkadaşlık isteğini reddetme işlemini gerçekleştir
    const rejectFriendRequestQuery =
      "UPDATE friendreq SET status = 'rejected' WHERE senderUsername = ? AND receiverUsername = ?";

    dbConnection.query(
      rejectFriendRequestQuery,
      [senderUsername, username],
      (err, results) => {
        if (err) {
          console.error("Arkadaşlık İsteği Reddetme Sorgu Hatası: ", err);
          res.status(500).send("İç Sunucu Hatası");
        } else {
          // Kullanıcıyı bilgilendir
          res.locals.successMessage = "Arkadaşlık isteği başarıyla reddedildi.";
          res.redirect(`/users/notification/${username}`);
        }
      }
    );
  }
);

router.get(
  "/cancelFriendRequest/:username/:senderUsername/:requestID",
  (req, res) => {
    const requestID = req.params.requestID;
    const username = req.params.username;
    const senderUsername = req.params.senderUsername; // Bu satırı ekledik
    console.log("cancel'e girdi");
    // Gönderilen arkadaşlık isteğini iptal etme işlemini gerçekleştir
    const cancelFriendRequestQuery =
      "DELETE FROM friendreq WHERE senderUsername = username AND receiverUsername = senderUsername AND status = 'pending'";

    dbConnection.query(
      cancelFriendRequestQuery,
      [requestID],
      (err, results) => {
        if (err) {
          console.error("Cancel Friend Request Query Error: ", err);
          res.status(500).send("Internal Server Error");
        } else {
          // Bildirim ile kullanıcıyı bilgilendir
          res.locals.successMessage =
            "Gönderilen arkadaşlık isteği başarıyla iptal edildi.";
          res.redirect(`/users/notification/${username}`);
        }
      }
    );
  }
);

router.get("/users/notification/:username", checkAuth, (req, res) => {
  const requestedUsername = req.params.username;

  // Arkadaşlık isteklerini sorgula
  const friendRequestQuery =
    "SELECT * FROM friendreq WHERE receiverUsername = ? AND status = 'pending'";

  dbConnection.query(
    friendRequestQuery,
    [requestedUsername],
    (friendReqErr, friendReqResults) => {
      if (friendReqErr) {
        console.error("Friend Request Query Error: ", friendReqErr);
        res.status(500).send("Internal Server Error");
      } else {
        const friendRequests = friendReqResults;

        // Bildirim var mı kontrolü
        const hasNotification = friendRequests.length > 0;

        // Şimdi requestedUsername ile veritabanından ilgili kullanıcıyı sorgulayabilirsiniz.
        const userQuery = "SELECT * FROM users WHERE username = ?";

        dbConnection.query(
          userQuery,
          [requestedUsername],
          (userErr, userResults) => {
            if (userErr) {
              console.error("User Query Error: ", userErr);
              res.status(500).send("Internal Server Error");
            } else {
              if (userResults.length > 0) {
                // Kullanıcı bulundu, bilgileri userInfo'ye ekle
                const userInfo = {
                  id: userResults[0].id,
                  username: userResults[0].username,
                  password: userResults[0].password,
                  name: userResults[0].name,
                  surname: userResults[0].surname,
                };

                res.render("users/notification", {
                  currentPage: "/notification",
                  userInfo,
                  friendRequests,
                  hasNotification,
                });
              } else {
                // Kullanıcı bulunamadı
                res.render("users/dashboard", {
                  currentPage: "/dashboard",
                  userInfo: null,
                  friendRequests: [],
                  hasNotification: false,
                });
              }
            }
          }
        );
      }
    }
  );
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

// Arkadaşı listeden çıkarma işlemi
router.get("/removeFriend/:username/:deleteUsername", (req, res) => {
  const { username, deleteUsername } = req.params;
  const loggedInUsername = username;
  const friendToRemove = deleteUsername;

  // Arkadaşı listeden çıkarma sorgusu (friendships tablosu)
  const removeFriendshipQuery =
    "DELETE FROM friendships WHERE (user1Username = ? AND user2Username = ?) OR (user1Username = ? AND user2Username = ?)";

  // Arkadaşı listeden çıkarma sorgusu (friendreq tablosu)
  const removeFriendRequestQuery =
    "DELETE FROM friendreq WHERE (senderUsername = ? AND receiverUsername = ?) OR (senderUsername = ? AND receiverUsername = ?)";

  // Arkadaşlıktan çıkarma işlemlerini sırasıyla gerçekleştir
  dbConnection.query(
    removeFriendshipQuery,
    [loggedInUsername, friendToRemove, friendToRemove, loggedInUsername],
    (friendshipErr, friendshipResults) => {
      if (friendshipErr) {
        console.error("Friendship Removal Query Error: ", friendshipErr);
        res.status(500).send("Internal Server Error");
        return;
      }

      // friendreq tablosundan satırları silme işlemi
      dbConnection.query(
        removeFriendRequestQuery,
        [loggedInUsername, friendToRemove, friendToRemove, loggedInUsername],
        (friendRequestErr, friendRequestResults) => {
          if (friendRequestErr) {
            console.error(
              "Friend Request Removal Query Error: ",
              friendRequestErr
            );
            res.status(500).send("Internal Server Error");
            return;
          }

          // Başarılı bir şekilde tamamlandığında başarılı bir yanıt döndür
          res.redirect(`/profile/user/${loggedInUsername}`);
        }
      );
    }
  );
});

router.use("/profile/user/:username", checkAuth, (req, res) => {
  const requestedUsername = req.params.username;

  // Kullanıcının bilgilerini almak için sorgu
  const query = "SELECT id, username FROM users WHERE username = ?";
  // Arkadaşların bilgilerini almak için sorgu
  const friendQuery = `
    SELECT 
      friends.friend_username AS friendUsername,
      u.name,
      u.surname,
      u.username
    FROM (
      SELECT 
        CASE 
          WHEN user1Username = ? THEN user2Username 
          ELSE user1Username 
        END AS friend_username
      FROM friendships
      WHERE user1Username = ? OR user2Username = ?
    ) AS friends
    JOIN users u ON friends.friend_username = u.username;
  `;

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
        };

        dbConnection.query(
          friendQuery,
          [requestedUsername, requestedUsername, requestedUsername],
          (friendErr, friendResults) => {
            if (friendErr) {
              console.error("Friendship Query Error: ", friendErr);
              res.status(500).send("Internal Server Error");
            } else {
              let isTeamLeader = false;
              const loggedInUsername = req.session.userInfo.username;
              if (requestedUsername === loggedInUsername) {
                isTeamLeader = true;
              }

              // Kullanıcı bilgilerini ve arkadaşlık bilgisini gönder
              res.render("users/profile", {
                currentPage: "/profile",
                userInfo,
                friends: friendResults,
                isTeamLeader: isTeamLeader,
              });
            }
          }
        );
      } else {
        // Kullanıcı bulunamadı
        res.render("users/profile", {
          currentPage: "/profile",
          userInfo: null,
          friends: null,
          isTeamLeader: false,
        });
      }
    }
  });
});

router.get("/dashboard/user/:username", checkAuth, (req, res) => {
  const requestedUsername = req.params.username;

  // Arkadaşlık isteklerini sorgula
  const friendRequestQuery =
    "SELECT COUNT(*) AS friendRequestCount FROM friendreq WHERE receiverUsername = ? AND status = 'pending'";

  dbConnection.query(
    friendRequestQuery,
    [requestedUsername],
    (friendReqErr, friendReqResults) => {
      if (friendReqErr) {
        console.error("Friend Request Query Error: ", friendReqErr);
        res.status(500).send("Internal Server Error");
      } else {
        const friendRequestCount = friendReqResults[0].friendRequestCount;

        // Şimdi requestedUsername ile veritabanından ilgili kullanıcıyı sorgulayabilirsiniz.
        const userQuery = "SELECT * FROM users WHERE username = ?";

        dbConnection.query(
          userQuery,
          [requestedUsername],
          (userErr, userResults) => {
            if (userErr) {
              console.error("User Query Error: ", userErr);
              res.status(500).send("Internal Server Error");
            } else {
              if (userResults.length > 0) {
                // Kullanıcı bulundu, bilgileri userInfo'ye ekle
                const userInfo = {
                  id: userResults[0].id,
                  username: userResults[0].username,
                  password: userResults[0].password,
                  name: userResults[0].name,
                  surname: userResults[0].surname,
                };

                // Friend request sayısına göre hasNotification değerini ayarla
                const hasNotification = friendRequestCount > 0;

                // Kullanıcının becerilerini sorgula
                const skillsQuery = "SELECT skillName FROM dbname.skills;";

                dbConnection.query(
                  skillsQuery,
                  [requestedUsername],
                  (skillsErr, skillsResults) => {
                    if (skillsErr) {
                      console.error("Skills Query Error: ", skillsErr);
                      res.status(500).send("Internal Server Error");
                    } else {
                      const skills = skillsResults.map(
                        (skill) => skill.skillName
                      );

                      // Arkadaşları sorgula
                      const friendsQuery = `
  SELECT u.name, u.surname
  FROM users u
  JOIN friendships f ON u.username = f.user2Username
  WHERE f.user1Username = ?
  UNION
  SELECT u.name, u.surname
  FROM users u
  JOIN friendships f ON u.username = f.user1Username
  WHERE f.user2Username = ?;
`;

                      dbConnection.query(
                        friendsQuery,
                        [requestedUsername, requestedUsername],
                        (friendsErr, friendsResults) => {
                          if (friendsErr) {
                            console.error("Friends Query Error: ", friendsErr);
                            res.status(500).send("Internal Server Error");
                          } else {
                            const friends = friendsResults.map((friend) => ({
                              name: friend.name,
                              surname: friend.surname,
                            }));

                            res.render("users/dashboard", {
                              currentPage: "/dashboard",
                              userInfo,
                              hasNotification,
                              skills,
                              friends,
                            });
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                // Kullanıcı bulunamadı
                res.render("users/dashboard", {
                  currentPage: "/dashboard",
                  userInfo: null,
                  hasNotification: false,
                });
              }
            }
          }
        );
      }
    }
  );
});
router.post("/createTeam/:username", (req, res) => {
  console.log("create team çalıştı");
  const { teamName, selectedFriends } = req.body;

  console.log("teamName: " + teamName);
  console.log("selectedFriends: " + selectedFriends.length);
  const totalFriendsNumber = Array.isArray(selectedFriends)
    ? selectedFriends.length
    : 1;
  const createdByUsername = req.session.userInfo.name;

  let friend1, friend2, friend3, friend4, friend5;
  console.log("selectedFriends.length: " + selectedFriends.length);
  console.log("*******************");
  for (let i = 0; i < 8; i++) {
    console.log(selectedFriends[i]);
  }
  if (totalFriendsNumber > 1) {
    console.log("ife girdi ---");
    friend1 = selectedFriends[0];
    friend2 = selectedFriends[1];
    friend3 = selectedFriends[2];
    friend4 = selectedFriends[3];
    friend5 = selectedFriends[4];
  } else if (totalFriendsNumber == 1) {
    console.log("else ife girdi ---");
    friend1 = selectedFriends;
  }
  console.log("friend1: " + friend1);
  console.log("friend2: " + friend2);
  console.log("friend3: " + friend3);
  console.log("friend4: " + friend4);
  console.log("friend5: " + friend5);

  const createTeamQuery =
    "INSERT INTO team (createdByUsername, teamName, creationDate, member1Username, member2Username, member3Username, member4Username, member5Username) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)";

  dbConnection.query(
    createTeamQuery,
    [
      createdByUsername,
      teamName,
      friend1 || null,
      friend2 || null,
      friend3 || null,
      friend4 || null,
      friend5 || null,
    ],
    (teamErr, teamResult) => {
      if (teamErr) {
        console.error("Team Creation Error: ", teamErr);
        return res.status(500).send("Internal Server Error");
      }

      // 3. Başarı durumunda kullanıcıyı takım sayfasına yönlendir
      res.redirect("/users/team/" + req.session.userInfo.name);
    }
  );
});

router.get("/users/team/:username", checkAuth, (req, res) => {
  const requestedUsername = req.params.username;

  // Şimdi requestedUsername ile veritabanından ilgili kullanıcıyı sorgulayabilirsiniz.
  const userQuery = "SELECT * FROM users WHERE username = ?";

  dbConnection.query(userQuery, [requestedUsername], (userErr, userResults) => {
    if (userErr) {
      console.error("User Query Error: ", userErr);
      res.status(500).send("Internal Server Error");
    } else {
      if (userResults.length > 0) {
        // Kullanıcı bulundu, bilgileri userInfo'ye ekle
        const userInfo = {
          id: userResults[0].id,
          username: userResults[0].username,
          password: userResults[0].password,
          name: userResults[0].name,
          surname: userResults[0].surname,
        };

        // Arkadaşları sorgula
        const friendsQuery = `
  SELECT u.username, u.name, u.surname
  FROM users u
  JOIN friendships f ON u.username = f.user2Username
  WHERE f.user1Username = ?
  UNION
  SELECT u.username, u.name, u.surname
  FROM users u
  JOIN friendships f ON u.username = f.user1Username
  WHERE f.user2Username = ?;
`;
        dbConnection.query(
          friendsQuery,
          [requestedUsername, requestedUsername],
          (friendsErr, friendsResults) => {
            if (friendsErr) {
              console.error("Friends Query Error: ", friendsErr);
              res.status(500).send("Internal Server Error");
            } else {
              const friends = friendsResults.map((friend) => ({
                username: friend.username,
                name: friend.name,
                surname: friend.surname,
              }));

              res.render("users/teamCre", {
                currentPage: "/teamCre",
                userInfo,
                friends,
              });
            }
          }
        );
      } else {
        // Kullanıcı bulunamadı
        res.status(404).send("Kullanıcı bulunamadı");
      }
    }
  });
});

router.get("/users/team/:username/:name/:surname", checkAuth, (req, res) => {
  const getUsername = req.params.username;
  const getName = req.params.name;
  const getSurname = req.params.surname;

  // Takımın oluşturulduğu kullanıcıya ait tüm takımların bilgilerini almak için sorgu
  const teamQuery = `
    SELECT *
    FROM team
    WHERE createdByUsername = ?;
  `;

  // Üye olduğu takımların bilgilerini almak için yeni sorgu
  const memberTeamsQuery = `
    SELECT *
    FROM team
    WHERE member1Username = ? OR
          member2Username = ? OR
          member3Username = ? OR
          member4Username = ? OR
          member5Username = ?;
  `;

  dbConnection.query(teamQuery, [getUsername], (teamErr, teamResults) => {
    if (teamErr) {
      console.error("Team Query Error: ", teamErr);
      return res.status(500).send("Internal Server Error");
    }

    // Üye olduğu takımların bilgilerini al
    dbConnection.query(
      memberTeamsQuery,
      [getUsername, getUsername, getUsername, getUsername, getUsername],
      (memberErr, memberTeamResults) => {
        if (memberErr) {
          console.error("Member Team Query Error: ", memberErr);
          return res.status(500).send("Internal Server Error");
        }

        // Tüm takımların sonuçlarını birleştir
        const allTeams = [...teamResults, ...memberTeamResults];

        // Render the team page with data
        res.render("users/team", {
          currentPage: "/users/team",
          userInfo: {
            username: getUsername,
            name: getName,
            surname: getSurname,
          },
          teams: allTeams, // Tüm takım bilgilerini EJS dosyasına iletmek
        });
      }
    );
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

router.use((req, res, next) => {
  res.status(404).render("404", { currentPage: "/404" });
});

module.exports = router;
