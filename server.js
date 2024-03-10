const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/wasd', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    confirmPassword: String,
    mobile: String,
    country: String,
    gender: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', async (req, res) => {
    try {
        const userData = req.body;

        // Basic validation for required fields
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            return res.status(400).render('index', { error: 'Please provide all required information', userData });
        }

        // Password length validation
        if (userData.password.length < 6) {
            return res.status(400).render('index', { error: 'Password must be at least 6 characters long', userData });
        }

        // Check if the password and confirm password match
        if (userData.password !== userData.confirmPassword) {
            return res.status(400).render('index', { error: 'Passwords do not match', userData });
        }

        const newUser = new User(userData);

        const savedUser = await newUser.save();
        res.redirect('/display');
    } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for displaying data
app.get('/display', async (req, res) => {
    try {
        const mongoDBData = await User.find();

        if (mongoDBData.length > 0) {
            res.render('display', { mongoDBData });
        } else {
            console.log('No data found.');
            res.render('display', { mongoDBData: [] });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
