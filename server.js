const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json


const SECRET_KEY = 'your_secret_key';

function authenticateJWT(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid token.");
    }
    req.user = user;
    next();
  });
}


app.post('/signup', async (req, res) => {
  const { userHandle, password } = req.body;

  if (!userHandle || userHandle.length < 6 || !password || password.length < 6) {
    return res.status(400).json({ error: "userHandle and password must be at least 6 characters long." });
  }


  res.status(201).json({ message: "User registered successfully", userHandle });
});

app.post('/login', async (req, res) => {
  const { userHandle, password } = req.body;

  if (!userHandle || userHandle.length < 6 || !password || password.length < 6) {
    return res.status(400).json({ error: "userHandle and password must be at least 6 characters long." });
  }

  const token = jwt.sign({ userHandle }, SECRET_KEY, { expiresIn: '1h' });

  res.status(200).json({ jsonWebToken: token });
});


app.post('/high-scores', authenticateJWT, async (req, res) => {
  const { level, userHandle, score, timestamp } = req.body;

  if (!level || !userHandle || score === undefined || !timestamp) {
    return res.status(400).json({ error: "Level, userHandle, score, and timestamp are required." });
  }

  res.status(201).json({
    message: "High score posted successfully",
    level,
    userHandle,
    score,
    timestamp
  });
});

app.get('/high-scores', authenticateJWT, async (req, res) => {
  const { level, page = 1 } = req.query;

  if (!level || typeof level !== 'string') {
    return res.status(400).json({ error: 'Level is required and must be a string.' });
  }

  const pageSize = 20; 
  const skip = (page - 1) * pageSize;

  try {
    const highScores = [
      { level: "A4", userHandle: "DukeNukem", score: 34555, timestamp: "2019-08-24T14:15:22Z" },
    ];

    const sortedScores = highScores
      .filter(score => score.level === level)
      .sort((a, b) => b.score - a.score)
      .slice(skip, skip + pageSize); 

    res.status(200).json(sortedScores);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving high scores.' });
  }
});

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
