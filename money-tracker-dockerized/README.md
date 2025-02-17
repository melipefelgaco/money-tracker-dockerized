
# Disclaimer: for this dockerized version just run `docker compose up` to start the app and docker will take care of running mysql, frontend and backend based on the Dockerfile. Be sure to get the environment variables from the developer and set up the database first


# Money Tracker - Webapp

A web application designed for tracking personal expenses with user authentication, email verification, and expense management.

## Running the Project

### Frontend:

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Start the frontend development server:
   ```bash
   yarn start
   ```

### Backend:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the backend server with nodemon for hot-reloading:
   ```bash
   nodemon index.js
   ```

### Folder Structure

- `/`: Contains the React frontend
- `backend/`: Contains the Express backend and API

---

## Features

- **User Authentication**: Users can sign up and sign in securely using JWT

- **Email Verification**: A confirmation code is sent via email after sign-up

- **Expense Management**: Users can add, view, and manage their expenses

- **Ethereal Mail Integration**: Used for email testing (can be replaced with other services in the future)

---

## TODO

### Completed:

- [x] Reimplement database
- [x] Fix email validation after user sign-up with confirmation code (email not working yet, next step)
- [x] Fix Mailing (using Ethereal Mail for now, working for testing, may be replaced with another service)
- [x] Fix adding expenses

### In Progress:

- [ ] Improve frontend
- [ ] Clean code

### Future Improvements:

- [ ] Implement TypeScript
- [ ] Add "remember me" feature on sign-in page
- [ ] Create "forgot your password" feature on the sign-in page

---

## Development Notes

- **Backend** uses **Express** and **MongoDB** (via `mongoose`), with MySQL as a secondary option
- **Frontend** is built with **React** and **Tailwind CSS**
- Use **nodemon** for auto-reloading the backend during development
- Follow ESLint and Prettier for code formatting and linting

## Environment variables

This project requires two files for environment variables. Create a `.env` on `/` and another in `/backend`. You can use the `.env.example` on each directory as an example as to how set up the environment variables or ask a developer for help if you're having trouble setting them up alongside your development database

Not only that but be sure to get the initial file for the development database `money_tracker_db.sql` from one of the developers
