// Import required modules
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const connectToDatabase = require('../db');
const dotenv = require('dotenv');

dotenv.config();
const mailerUser = process.env.MAILER_USER;
const mailerPass = process.env.MAILER_PASS;

router.post('/confirmation-code', async (req, res) => {
  const db = await connectToDatabase();
  const { email } = req.body;
  try {
    const [existingResults] = await db.query(
      'SELECT * FROM confirmations WHERE email = ? AND confirmed = 1',
      [email]
    );
    if (existingResults.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'This email has already been confirmed.' });
    }
    const [confirmationResult] = await db.query(
      'SELECT confirmation_code FROM confirmations WHERE email = ? AND confirmed = 0',
      [email]
    );
    if (confirmationResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No unconfirmed code found for this email.' });
    }
    const confirmationCode = confirmationResult[0].confirmation_code;
    console.log('confirmationCode:', confirmationCode);
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: mailerUser,
        pass: mailerPass
      }
    });
    const info = await transporter.sendMail({
      from: `Money Tracker App 👻" <${mailerUser}>`,
      // TODO: change my mail to env var as well
      to: `${email},fmagesty@gmail.com,${mailerUser}`,
      subject: 'Email Confirmation Code',
      text: `Your confirmation code is: ${confirmationCode}`,
      html: `<b>Your confirmation code is: ${confirmationCode}</b>`
    });
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, message: 'Confirmation email sent' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/validate-email', async (req, res) => {
  const db = await connectToDatabase();
  const { email, confirmationCode } = req.body;
  try {
    const [results] = await db.query(
      'SELECT * FROM confirmations WHERE email = ? AND confirmation_code = ?',
      [email, confirmationCode]
    );
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid email or code'
      });
    }
    await db.query(
      'UPDATE confirmations SET confirmed = 1 WHERE email = ? AND confirmation_code = ?',
      [email, confirmationCode]
    );
    return res.status(200).json({
      success: true,
      message: 'Email validated'
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
