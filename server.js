const express = require("express");
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express(); // Initialize the app
const PORT = 3000;

// Pinata API keys
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YThhYzBmZS1iZDFmLTRhZjItOWVhNi0yYjBjYWI3YTE3OTAiLCJlbWFpbCI6ImpvaW4yYXJub2JAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImU2OGYwM2JhMzRlN2E2NjkzYjg0Iiwic2NvcGVkS2V5U2VjcmV0IjoiYjM5OTljMmE1YjYwY2MyMjk5NjlhM2FjODNlZjk1YWEwMzg0OWViNjU4NjE5NDA5Yjk4MGQ2NjdlOWE5MmZlOCIsImV4cCI6MTc2MzM2NDQzNH0.QqtFbFXsPltABW_BH3QPuBHGHkvtl0DPgi7vvvl_lMw"; // Replace with your Pinata JWT

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: "b3999c2a5b60cc229969a3ac83ef95aa03849eb658619409b980d667e9a92fe8", // Replace with a secure key
    resave: false,
    saveUninitialized: true,
  })
);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filenames
  },
});
const upload = multer({ storage });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to check login state
function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login page if not authenticated
  }
  next();
}

// Function to upload files to Pinata
async function uploadToPinata(file) {
  const fileStream = fs.createReadStream(file.path);
  const formData = new FormData();
  formData.append("file", fileStream);

  const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      ...formData.getHeaders(),
    },
  });

  fs.unlinkSync(file.path); // Remove temp file
  return response.data.IpfsHash; // Return Pinata IPFS hash
}

// Setup route to handle form submission
app.post(
  "/setup",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "mainVideo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, bulletTitles, bulletDescriptions } = req.body;

      // Convert to arrays if necessary
      const bulletTitlesArray = Array.isArray(bulletTitles) ? bulletTitles : [bulletTitles];
      const bulletDescriptionsArray = Array.isArray(bulletDescriptions)
        ? bulletDescriptions
        : [bulletDescriptions];

      // Validate lengths
      if (bulletTitlesArray.length !== bulletDescriptionsArray.length) {
        return res.status(400).send("Mismatched bullet titles and descriptions.");
      }

      // Upload files to Pinata
      const profilePictureHash = await uploadToPinata(req.files.profilePicture[0]);
      const mainVideoHash = await uploadToPinata(req.files.mainVideo[0]);

      // Save user data in session
      req.session.userData = {
        name,
        profilePictureHash,
        mainVideoHash,
        bullets: bulletTitlesArray.map((title, index) => ({
          title,
          description: bulletDescriptionsArray[index],
        })),
      };

      console.log("User data saved in session:", req.session.userData);

      // Redirect to home
      res.redirect("/home.html");
    } catch (error) {
      console.error("Setup Error:", error.message);
      res.status(500).send("Error during setup. Please try again. " + error.message);
    }
  }
);

// Home route for dynamically generated page
app.get("/home.html", checkLogin, (req, res) => {
  const userData = req.session.userData;

  if (!userData) {
    return res.redirect("/setup"); // Redirect to setup if data is missing
  }

  // Dynamically generate the home page HTML
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header>
      <img src="https://gateway.pinata.cloud/ipfs/${userData.profilePictureHash}" alt="Profile Picture" class="profile-picture">
      <div class="header-content">
        <h2>I am</h2>
        <h1>${userData.name}</h1>
      </div>
    </header>
    <main>
      <section class="overview">
        <h2>Overview</h2>
        ${userData.bullets
          .map(
            (bullet) => `
          <div class="bullet">
            <h3>${bullet.title}</h3>
            <p>${bullet.description}</p>
          </div>`
          )
          .join("")}
      </section>
      <section class="main-video">
        <h2>Main Video</h2>
        <video controls>
          <source src="https://gateway.pinata.cloud/ipfs/${userData.mainVideoHash}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </section>
    </main>
  </body>
  </html>
  `;

  res.send(html); // Send dynamically generated HTML
});

// Other routes
app.get("/setup", checkLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "setup.html"));
});

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home.html");
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!req.session.users) req.session.users = {};
  if (req.session.users[email]) {
    return res.status(400).send("User already exists. Please log in.");
  }

  req.session.users[email] = { name, email, password };
  res.send("Signup successful! <a href='/'>Login</a>");
});

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
  res.redirect("/setup");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
    }
    res.redirect("/");
  });
});

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
