import express from 'express';

const webhook = express.Router();

webhook.post('/user/registered', (req, res) => {
    // Handle user registration webhook
    console.log('User registered:', req.body);
    res.status(200).send('User registration received');
})

webhook.post('/user/subscription/updated', (req, res) => {
    // Handle user subscription update webhook
    console.log('User subscription updated:', req.body);
    res.status(200).send('User subscription update received');
});

webhook.post('/user/deleted', (req, res) => {
    // Handle user deletion webhook
    console.log('User deleted:', req.body);
    res.status(200).send('User deletion received');
});

webhook.post('/user/apiKey/created', (req, res) => {
    // Handle API key creation webhook
    console.log('API key created:', req.body);
    res.status(200).send('API key creation received');
});

