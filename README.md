# Next-App-Login

Next-App-Login is a web application built with Next.js that provides user registration and login functionality. It allows users to create an account, log in, and access a protected dashboard.

## Features

- User registration with name, email, and password
- User login with email and password
- Protected dashboard accessible only to authenticated users
- Error handling for invalid form inputs and authentication failures
- JWT-based authentication with session management
- API Management with Server Response and status codes.
- API to handle signin, signup, edit, delete requests on the server with protected page check.

## Technologies Used

- Next.js: A React framework for building server-side rendered and static websites
- Node.js: A JavaScript runtime for server-side development
- MySQL: A relational database management system for storing user information
- bcrypt: A library for hashing and comparing passwords securely
- jsonwebtoken: A library for generating and verifying JSON Web Tokens (JWTs)

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- MySQL database set up and running

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kkvarshney/next-app-login.git
   ```
2. Install dependencies:

```bash
cd next-app-login
npm install
```

3. Set up environment variables:

- Create a .env file in the project root directory.
- Add the following variables to the .env file:

```bash
DB_HOST=your-mysql-host
DB_PORT=your-mysql-port
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_NAME=your-mysql-database-name
JWT_SECRET=your-secret-key
```
4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:3000 to access the application

### Usage

- Sign up: Fill out the registration form with your name, email, and password. Click the "Sign Up" button to create an account.
- Log in: Enter your email and password in the login form. Click the "Login" button to authenticate.
- Dashboard: After successful login, you will be redirected to the protected dashboard page.

### License

- This project is licensed under the MIT License.

### Contributing

- Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.
- If you have questions about the project, you can reach out to me at krishnavarshney@outlook.com
