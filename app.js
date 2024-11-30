require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const userModel = require("./models/users");
const postModel = require("./models/posts");
const passport = require("passport");
const flash = require("connect-flash");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const expressSession = require("express-session");
const upload = require("./models/multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.set("view engine", "ejs");
app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true }));

app.use(flash());

app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.post("/register", function (req, res) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/home");
    });
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res) {}
);

app.get("/", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

app.get("/home", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  await user.populate("userPosts");
  await user.populate({
    path: "userPosts",
    populate: { path: "author" },
  });
  const posts = await postModel
    .find({})
    .sort({ createdAt: -1 })
    .populate("author");
  res.render("index", {
    user: user,
    timeAgo: timeAgo,
    posts: posts,
  });
});

app.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  await user.populate("userPosts");
  await user.populate({
    path: "userPosts",
    options: { sort: { createdAt: -1 } },
    populate: { path: "author" },
  });
  res.render("profile", {
    user: user,
    joinedDate: formatJoinedDate(user.createdAt),
    timeAgo: timeAgo,
  });
});

app.get("/user-profile/:username", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.params.username,
  });
  await user.populate("userPosts");
  await user.populate({
    path: "userPosts",
    options: { sort: { createdAt: -1 } },
    populate: { path: "author" },
  });
  res.render("user-profile", {
    user: user,
    joinedDate: formatJoinedDate(user.createdAt),
    timeAgo: timeAgo,
  });
});

app.post("/edit-about", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  user.about.genres = req.body.genres;
  user.about.directors = req.body.directors;
  await user.save();
  res.redirect("/profile");
});

app.post("/edit-bio", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  user.bio = req.body.bio;
  await user.save();
  res.redirect("/profile");
});

app.post("/create-post", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = new postModel({
    caption: req.body.postText,
    author: user._id,
  });
  await post.save();
  user.userPosts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.post(
  "/edit-profilePic",
  isLoggedIn,
  upload.single("profilePic"),
  async function (req, res) {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profilePic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

app.get("/like-post/:id", isLoggedIn, async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.id });
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  if (!user.likedPosts.includes(post._id)) {
    post.likes++;
    await post.save();
    user.likedPosts.push(post._id);
    await user.save();
  } else {
    post.likes--;
    await post.save();
    user.likedPosts.pull(post._id);
    await user.save();
  }
  res.redirect(req.get("referer") || "/home");
});

app.get("/recommendations", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("userPosts likedPosts");

  const userData = {
    bio: user.bio,
    about: user.about,
    captions: user.userPosts.map((post) => post.caption),
    likedCaptions: user.likedPosts.map((post) => post.caption),
  };

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

  const prompt = `Suggest 10 movies/series based on the user data which is collected by a social media platform : 
  user bio : ${userData.bio}, user favorite directors : ${userData.about.directors}, user favorite genres : ${userData.about.genres}, the posts the user have made in the social media platform : ${userData.captions}, the posts the user have liked in the social media platform : ${userData.likedCaptions}
  `;

  try {
    const result = await model.generateContent(prompt);
    const recommendationsText =
      result.response.candidates[0].content.parts[0].text;

    const lines = recommendationsText.split("\n");

    const movies = lines
      .map((line) => {
        const match = line.match(/(\d+)\.\s\*\*(.*?)\s\((.*?)\):\*\*\s(.*)/);
        if (match) {
          return {
            title: match[2],
            director: match[3],
            description: match[4],
          };
        }
        return null;
      })
      .filter((movie) => movie !== null);

    res.render("recommendations", { movies });
  } catch (error) {
    console.log("Error fetching : ", error);
    res.status(500).send("Failed to generate content. Please try again later.");
  }
});

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function formatJoinedDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long" };
  return date.toLocaleDateString("en-US", options);
}

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const timeIntervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "min", seconds: 60 },
    { label: "sec", seconds: 1 },
  ];

  for (const interval of timeIntervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

app.listen(port, () => {
  console.log("Server started on port 3000");
});
