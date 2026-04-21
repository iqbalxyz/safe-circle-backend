# Neighborhood Watch Express API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express.js Version](https://img.shields.io/badge/express-%5E4.18.2-blue)](https://expressjs.com/)

## 📋 Overview

A modern, production-ready REST API server built with Express.js. This boilerplate includes essential features like authentication, database integration, error handling, logging, and request validation.

## 🚀 Features

- ✅ **REST API** - Clean and scalable API architecture
- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📦 **Database Integration** - MySQL MariaDB
- 🛡️ **Input Validation** - Request validation using Zod
- 📝 **Logging** - Winston logger for debugging and monitoring
- 🔄 **Error Handling** - Centralized error handling middleware
- 🔒 **Security** - CORS, rate limiting, and security headers
- 🚦 **Environment Configuration** - Dotenv for environment variables

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- MySQL MariaDB
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/iqbalxyz/neighborhood-watch-express.git
cd neighborhood-watch-express
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Set up environment variables
```bash
# SERVER PORT
PORT=****

# NODE ENV
NODE_ENV=development

# DATABASE CONFIGURATION
DATABASE_USERNAME=****
DATABASE_PASSWORD=****
DATABASE_NAME=****
DATABASE_HOST=****
DATABASE_PORT=****

# JWT KEYS AND CONFIG
JWT_SECRET_KEY=****
JWT_REFRESH_SECRET_KEY=****
JWT_EXPIRES_IN=****
JWT_REFRESH_EXPIRES_IN=****
```

# 🏃 Running the Application
Development mode (with auto-reload)
```bash
npm run dev
# or
yarn dev
```

Production mode
```bash
npm run build
npm start
# or
yarn build
yarn start
```

# 🔌 API Endpoints
[Visit Documentation](https://www.notion.so/Neighborhood-Watch-API-Documentation-30e73d2c6b6a800c81f3ef3febe7ffe0)

# 👥 Authors
Moch. Iqbal S - [iqbalxyz](https://github.com/iqbalxyz)
