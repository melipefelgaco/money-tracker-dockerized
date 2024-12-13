// TODO: Break down this component
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const connectToDatabase = require('./db');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/mail', emailRoutes);

// Function to check errors in the response
function handleErrorResponse(res, errorMessage) {
  console.error(errorMessage);
  res.status(500).json({ success: false, message: errorMessage });
}

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Money Tracker API!' });
});

// Create new user
app.post('/api/signup', async (req, res) => {
  const db = await connectToDatabase();
  const confirmationCode = Math.floor(100000 + Math.random() * 900000);
  const { name, lastname, cellphone, email, password } = req.body;
  if (password.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  try {
    const [existingResults] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingResults.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, lastname, cellphone, email, password) VALUES (?, ?, ?, ?, ?)',
      [name, lastname, cellphone, email, hashedPassword]
    );
    await db.query('INSERT INTO confirmations (email, confirmation_code) VALUES (?, ?)', [
      email,
      confirmationCode
    ]);
    await db.query('INSERT INTO user_expenses (user_id, expenses) VALUES (?, ?)', [
      result.insertId,
      '[]'
    ]);
    res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not register user');
  } finally {
    await db.end();
  }
});

// Log in user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const [confirmResults] = await db.query('SELECT * FROM confirmations WHERE email = ?', [email]);
    if (confirmResults.length === 0 || !confirmResults[0].confirmed) {
      return res.status(401).json({ success: false, message: 'Email not confirmed' });
    }
    const match = await bcrypt.compare(password, results[0].password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const user = { id: results[0].id, name: results[0].name };
    const token = jwt.sign(user, process.env.JWT_SECRET);
    res.status(200).json({ success: true, token, user: results[0] });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not log in user');
  } finally {
    if (db) {
      await db.end();
    }
  }
});

// Retrieve user data
app.get('/api/user', validateToken, async (req, res) => {
  const userId = req.user.id;
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = results[0];
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not retrieve user');
  } finally {
    if (db) {
      await db.end();
    }
  }
});

// Update user's balance
app.put('/api/user-balance', validateToken, async (req, res) => {
  const userId = req.user.id;
  const { balance } = req.body;
  let db;
  try {
    db = await connectToDatabase(); // Establish connection to the database
    const [result] = await db.query('UPDATE users SET balance = ? WHERE id = ?', [balance, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, balance });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not update balance');
  } finally {
    if (db) {
      await db.end();
    }
  }
});

// Update user's budget
app.put('/api/user-budget', validateToken, async (req, res) => {
  const userId = req.user.id;
  const { budget } = req.body;
  if (typeof budget !== 'number' || isNaN(budget)) {
    return handleErrorResponse(res, 'Invalid budget value');
  }
  let db;
  try {
    db = await connectToDatabase(); // Establish connection to the database
    const [result] = await db.query('UPDATE users SET budget = ? WHERE id = ?', [budget, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, budget });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not update budget');
  } finally {
    if (db) {
      await db.end();
    }
  }
});

// POST a new expense and update current expenses
app.post('/api/expenses', validateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, value, category, note, expense_date } = req.body;
  let db;
  try {
    db = await connectToDatabase();
    const timestamp = Date.now().toString(36);
    const expenseId = `${timestamp}-${userId}`;
    const expenseValue = parseFloat(value);
    if (isNaN(expenseValue)) {
      console.warn('Invalid value for expense:', value);
      return res.status(400).json({ success: false, message: 'Invalid expense value' });
    }
    const newExpense = {
      expense_id: expenseId,
      name,
      value: expenseValue,
      category: category || null,
      note: note || null,
      expense_date: expense_date || null
    };
    const [results] = await db.query('SELECT expenses FROM user_expenses WHERE user_id = ?', [
      userId
    ]);
    console.log('Full results:', JSON.stringify(results, null, 2));
    let currentExpenses = [];
    if (results.length > 0 && results[0].expenses) {
      try {
        currentExpenses =
          typeof results[0].expenses === 'string'
            ? JSON.parse(results[0].expenses)
            : results[0].expenses;
        console.log('Parsed current expenses:', currentExpenses);
      } catch (parseError) {
        console.warn('Failed to parse current expenses for user ID:', userId, parseError);
      }
    }
    currentExpenses.push(newExpense);
    console.log('Updated expenses array after push:', currentExpenses);
    if (results.length === 0) {
      await db.query('INSERT INTO user_expenses (user_id, expenses) VALUES (?, ?)', [
        userId,
        JSON.stringify(currentExpenses)
      ]);
      console.log('Inserted new expense record for user ID:', userId);
    } else {
      await db.query('UPDATE user_expenses SET expenses = ? WHERE user_id = ?', [
        JSON.stringify(currentExpenses),
        userId
      ]);
      console.log('Updated expense record for user ID:', userId);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ success: false, message: 'Could not add expense' });
  } finally {
    if (db) {
      await db.end();
    }
  }
});

// DELETE single expense
app.delete('/api/expenses/:expenseId', validateToken, async (req, res) => {
  const userId = req.user.id;
  const expenseId = req.params.expenseId;
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.query('SELECT expenses FROM user_expenses WHERE user_id = ?', [
      userId
    ]);
    if (results.length === 0 || results[0].expenses === null) {
      return res.status(404).json({ success: false, message: 'No expenses found for the user' });
    }
    const currentExpenses = results[0].expenses;
    const updatedExpenses = currentExpenses.filter((expense) => expense.expense_id !== expenseId);
    await db.query('UPDATE user_expenses SET expenses = ? WHERE user_id = ?', [
      JSON.stringify(updatedExpenses),
      userId
    ]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not delete expense');
  } finally {
    if (db) {
      await db.end();
    }
  }
});

// Delete ALL expenses
app.delete('/api/expenses', validateToken, async (req, res) => {
  const userId = req.user.id;
  let db;
  try {
    db = await connectToDatabase();
    await db.query('UPDATE user_expenses SET expenses = ? WHERE user_id = ?', ['[]', userId]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return handleErrorResponse(res, 'Could not delete all expenses');
  } finally {
    if (db) {
      await db.end(); // Close the database connection if it was established
    }
  }
});

// GET all expenses for a user
app.get('/api/expenses', validateToken, async (req, res) => {
  const userId = req.user.id;
  let db;
  try {
    db = await connectToDatabase();
    const [results] = await db.query('SELECT expenses FROM user_expenses WHERE user_id = ?', [
      userId
    ]);
    if (results.length === 0) {
      console.log('No results found for the user ID:', userId);
      return res.status(404).json({ success: false, message: 'No expenses found for the user' });
    }
    const expensesData = results[0].expenses;
    let expenses = [];
    try {
      expenses = expensesData ? expensesData : [];
    } catch (parseError) {
      console.warn('Invalid JSON format in expenses column for user ID:', userId, parseError);
    }
    res.status(200).json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch expenses' });
  } finally {
    if (db) {
      await db.end();
    }
  }
});

async function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return handleErrorResponse(res, 'Unauthorized. No token');
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return handleErrorResponse(res, 'Unauthorized. No token');
  }
  console.log(token);
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err.message);
    return handleErrorResponse(res, 'Unauthorized. Invalid token');
  }
}

app.listen(PORT, (err) => {
  if (err) {
    console.error(`Failed to start the server: ${err.message}`);
    process.exit(1);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
