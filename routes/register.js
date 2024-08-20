const express = require('express');
const router = express.Router();
const validator = require('email-validator');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Render the registration page
router.get('/register', async (req, res) => {
    try {
        // Optionally, prepare any data needed for rendering the page, e.g., passing previous form data (if any)
        res.render('register', { title: 'Register', data: req.session.formData || {} });
        // Clear any session data after rendering (optional, depends on your use case)
        req.session.formData = null;
    } catch (error) {
        console.error("Error rendering registration page:", error);
        res.status(500).send("Error loading registration page: " + error.message);
    }
});

// Handle registration logic
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, gender, address, dateOfBirth, phoneNumber, usertype,terms } = req.body;
    // Check if Terms and Conditions were accepted
    if (!terms) {
        return res.render('register', { errorMessage: 'You must agree to the Terms and Conditions.', data: req.body });
    }

    // Validate email
    if (!validator.validate(email)) {
        return res.render('register', { errorMessage: 'Invalid email address', data: req.body });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.render('register', { errorMessage: 'Passwords do not match.', data: req.body });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.render('register', {
            errorMessage: 'Password must be at least 8 characters long, include a number, a special character, and an uppercase letter.',
            data: req.body
        });
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.render('register', { errorMessage: 'Email already in use.', data: req.body });
    }

    try {
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(saltRounds));

        // Create user record
        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                gender,
                address,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                phoneNumber,
                usertype: usertype || 'USER', // defaulting to 'USER' if not provided
            },
        });

        // Redirect to login on successful registration
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).render('register', { errorMessage: 'There was a problem with your registration.', data: req.body });
    }
});

module.exports = router;
