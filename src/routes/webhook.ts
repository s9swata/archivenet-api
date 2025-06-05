import express from 'express';

const webhook = express.Router();

webhook.post('/user/registered', (req, res) => {
    // Handle user registration webhook
    console.log('User registered:', req.body);
    res.status(200).send('User registration received');
})

