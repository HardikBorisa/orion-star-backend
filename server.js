const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'aayush',
  database: 'orion'
});

const saltRounds = 10;
function hashPassword(password) {
  return bcrypt.hashSync(password, saltRounds);
}

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

const app = express();
app.use(express.json());
app.use(cors());
app.get('/users', (req, res) => {
  const sql = 'SELECT id, fname, lname, email, phone, city, state, country FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
    res.json({ users: results });
  });
});
app.post('/signup', (req, res) => {
    console.log('going');
    console.log(req.body);
    const { fname,lname, email, phone ,city,state,country } = req.body;
    console.log( fname,lname, email, phone ,city,state,country);
    const sql = 'INSERT INTO users ( fname,lname, email, phone ,city,state,country) VALUES (?,?,?,?,?,?,?)';
    db.query(sql, [ fname,lname, email, phone ,city,state,country], (err, result) => {
      if (err) {
        console.error('Error signing up:', err);
        return res.status(500).json({ error: 'An internal server error occurred' });
      }
      res.json({ message: 'Signed up successfully' });
    });
  });
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ error: 'An internal server error occurred' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Email or password is incorrect' });
        }
        const user = results[0];
        // Compare hashed passwords
        bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
            if (bcryptErr) {
                console.error('Error comparing passwords:', bcryptErr);
                return res.status(500).json({ error: 'An internal server error occurred' });
            }

            if (bcryptResult) {
                // Passwords match
                res.json({ message: 'Logged in successfully', user: { id: user.id, name: user.name, email: user.email } });
            } else {
                // Passwords don't match
                res.status(401).json({ error: 'Email or password is incorrect' });
            }
        });
    });
});
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
