const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: "your-secret-key", // Replace with a secure key
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to check login state
function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login page if not authenticated
  }
  next();
}

// Root route (Login page explicitly)
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home.html"); // Redirect to home.html if logged in
  }
  res.sendFile(path.join(__dirname, "public", "login.html")); // Serve login.html for unauthenticated users
});

// Route for signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html")); // Serve signup.html
});

// Handle signup form submission
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Dummy user storage
  if (!req.session.users) req.session.users = {};
  if (req.session.users[email]) {
    return res.status(400).send("User already exists. Please log in.");
  }

  req.session.users[email] = { name, email, password };
  res.send("Signup successful! <a href='/'>Login</a>");
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!req.session.users || !req.session.users[email]) {
    return res.status(401).send("Invalid email. Please sign up.");
  }

  const user = req.session.users[email];
  if (user.password !== password) {
    return res.status(401).send("Incorrect password.");
  }

  req.session.user = { email, name: user.name };
  res.redirect("/home.html"); // Redirect to home.html after login
});

// Route for home.html (requires login)
app.get("/home.html", checkLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
    }
    res.redirect("/"); // Redirect to login page after logout
  });
});

// Error handling for unmatched routes
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
