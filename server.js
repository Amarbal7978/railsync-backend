require('dotenv').config();
const { pool, testDatabaseConnection } = require('./db/database');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { findUserByLogin } = require('./db/auth');
const { hashPassword, verifyPassword } = require('./db/password');
const { sendOtpEmail } = require('./utils/mailer');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Deterministic Indian Railways Demo Users
const DEMO_USERS = {
  'admin@railsync.ai': {
    id: 'usr_admin_01',
    employeeId: 'IR-892011-ADM',
    name: 'Rajesh Sharma',
    email: 'admin@railsync.ai',
    department: 'Administration & Operations IT',
    role: 'System Administrator',
    division: 'Delhi (DLI)',
    zone: 'Northern Railway (NR)',
    status: 'Active',
    lastLogin: '2026-09-12T17:30:00Z',
    createdAt: '2026-01-15T00:00:00Z',
    allowedModules: ['*']
  },
  'controller@railsync.ai': {
    id: 'usr_ctrl_02',
    employeeId: 'IR-774023-CTR',
    name: 'Vikram Singh',
    email: 'controller@railsync.ai',
    department: 'Operating / Section Control',
    role: 'Section Controller',
    division: 'Delhi (GZB–ALJN Section)',
    zone: 'Northern Railway (NR)',
    status: 'Active',
    lastLogin: '2026-09-12T17:45:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    allowedModules: ['/', '/trains', '/conflicts', '/planner', '/simulator', '/network', '/copilot', '/weekly', '/monthly']
  },
  'engineering@railsync.ai': {
    id: 'usr_eng_03',
    employeeId: 'IR-552109-ENG',
    name: 'Amit Kumar Verma',
    email: 'engineering@railsync.ai',
    department: 'Civil Engineering / Permanent Way',
    role: 'Engineering Officer',
    division: 'Delhi (DLI)',
    zone: 'Northern Railway (NR)',
    status: 'Active',
    lastLogin: '2026-09-12T16:15:00Z',
    createdAt: '2026-02-10T00:00:00Z',
    allowedModules: ['/', '/intelligence', '/fusion', '/planner', '/network', '/weekly', '/monthly', '/copilot']
  },
  'ohe@railsync.ai': {
    id: 'usr_ohe_04',
    employeeId: 'IR-339842-OHE',
    name: 'Suresh Nair',
    email: 'ohe@railsync.ai',
    department: 'Electrical / OHE Traction',
    role: 'OHE Officer',
    division: 'Delhi (DLI)',
    zone: 'Northern Railway (NR)',
    status: 'Active',
    lastLogin: '2026-09-12T15:20:00Z',
    createdAt: '2026-03-01T00:00:00Z',
    allowedModules: ['/', '/asset-health', '/intelligence', '/planner', '/network', '/copilot']
  },
  'snt@railsync.ai': {
    id: 'usr_snt_05',
    employeeId: 'IR-441208-SNT',
    name: 'Pooja Deshmukh',
    email: 'snt@railsync.ai',
    department: 'Signal & Telecommunication',
    role: 'S&T Officer',
    division: 'Delhi (DLI)',
    zone: 'Northern Railway (NR)',
    status: 'Active',
    lastLogin: '2026-09-12T14:10:00Z',
    createdAt: '2026-03-05T00:00:00Z',
    allowedModules: ['/', '/intelligence', '/planner', '/network', '/copilot']
  }
};

// Map employee IDs to users
const DEMO_USERS_BY_EMP_ID = {};
Object.values(DEMO_USERS).forEach(u => {
  DEMO_USERS_BY_EMP_ID[u.employeeId.toLowerCase()] = u;
});

// In-memory active session token store for demo
const activeSessions = new Map();

// Deterministic API routes for Base44 frontend compatibility
app.get('/api/apps/public/prod/public-settings/by-id/:appId', (req, res) => {
  res.json({
    id: req.params.appId,
    public_settings: {
      auth_required: true,
      app_name: 'RailSync AI'
    }
  });
});

app.get('/api/apps/:appId/entities/User/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  let user = activeSessions.get(token);
  if (!user && token) {
    // If token encodes a known user key
    for (const [email, u] of Object.entries(DEMO_USERS)) {
      if (token.includes(u.id) || token.includes(email)) {
        user = u;
        break;
      }
    }
  }

  // Fallback to Section Controller if demo token exists
  if (!user && token && token.startsWith('demo_token_')) {
    user = DEMO_USERS['controller@railsync.ai'];
  }

  if (user) {
    return res.json({
      id: user.id,
      email: user.email,
      full_name: user.name,
      employee_id: user.employeeId,
      department: user.department,
      role: user.role,
      division: user.division,
      zone: user.zone,
      created_at: user.createdAt,
      last_login: user.lastLogin
    });
  }

  res.status(401).json({
    status: 401,
    message: 'Authentication required',
    data: { extra_data: { reason: 'auth_required' } }
  });
});

app.post('/api/apps/:appId/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const login = (email || '').trim().toLowerCase();

    if (!login || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Email and password are required'
      });
    }

    const dbUser = await findUserByLogin(login);

    const passwordValid = dbUser
  ? await verifyPassword(password, dbUser.password)
  : false;
  console.log("LOGIN DEBUG:", {
  login,
  userFound: !!dbUser,
  passwordFieldExists: !!dbUser?.password,
  passwordHashLength: dbUser?.password?.length || 0,
  passwordValid
});

if (!dbUser || !passwordValid) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid email/employee ID or password'
      });
    }

    const user = {
      id: dbUser.id,
      employeeId: dbUser.employee_id,
      name: dbUser.name,
      email: dbUser.email,
      department: dbUser.department,
      role: dbUser.role,
      division: dbUser.division,
      zone: dbUser.zone,
      status: dbUser.status,
      createdAt: dbUser.created_at,
      lastLogin: dbUser.last_login
    };

    const token = `db_token_${user.id}_${Date.now()}`;
    activeSessions.set(token, user);

    res.json({
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        employee_id: user.employeeId,
        department: user.department,
        role: user.role,
        division: user.division,
        zone: user.zone
      }
    });
  } catch (error) {
    console.error('Database login error:', error.message);

    res.status(500).json({
      status: 500,
      message: 'Login failed due to server error'
    });
  }
});
app.post('/api/apps/:appId/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      role,
      division,
      zone
    } = req.body;

    const loginEmail = (email || '').trim().toLowerCase();

    if (!name || !loginEmail || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 400,
        message: 'Password must contain at least 6 characters'
      });
    }

    const existingUser = await pool.query(
      `SELECT id FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [loginEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: 409,
        message: 'Email is already registered'
      });
    }

    const newUserId = `usr_${Date.now()}`;
    const newEmployeeId =
      employeeId || `IR-${Math.floor(100000 + Math.random() * 900000)}`;

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users
       (id, employee_id, name, email, password, department, role, division, zone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, employee_id, name, email, department, role, division, zone`,
      [
        newUserId,
        newEmployeeId,
        name,
        loginEmail,
        hashedPassword,
        department || 'Operations',
        role || 'Section Controller',
        division || 'Delhi (DLI)',
        zone || 'Northern Railway (NR)'
      ]
    );

    const dbUser = result.rows[0];

    const user = {
      id: dbUser.id,
      employeeId: dbUser.employee_id,
      name: dbUser.name,
      email: dbUser.email,
      department: dbUser.department,
      role: dbUser.role,
      division: dbUser.division,
      zone: dbUser.zone
    };

    const token = `db_token_${user.id}_${Date.now()}`;

    activeSessions.set(token, user);

    res.status(201).json({
      access_token: token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        employee_id: user.employeeId,
        department: user.department,
        role: user.role,
        division: user.division,
        zone: user.zone
      },
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Database registration error:', error.message);

    res.status(500).json({
      status: 500,
      message: 'Registration failed due to server error'
    });
  }
});

app.post('/api/apps/:appId/auth/reset-password-request', (req, res) => {
  const { email } = req.body;
  res.json({
    message: 'Password reset instructions dispatched to authorized railway communication channel.',
    email: email
  });
});

app.post('/api/apps/:appId/auth/reset-password', (req, res) => {
  res.json({
    message: 'Password reset successfully. Please log in with your updated credentials.'
  });
});

app.post('/api/apps/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  activeSessions.delete(token);
  res.json({ message: 'Logged out successfully' });
});
// Forgot Password - Send OTP
app.post('/api/apps/:appId/auth/forgot-password', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userResult = await pool.query(
      `SELECT id, email FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );

    // Do not reveal whether an email exists
    if (userResult.rows.length === 0) {
      return res.json({ message: 'If the email exists, an OTP has been sent.' });
    }

    const user = userResult.rows[0];
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    await pool.query(
      `INSERT INTO password_reset_tokens
       (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [user.id, otpHash]
    );

    await sendOtpEmail(user.email, otp);

    res.json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Unable to send OTP right now' });
  }
});

// Forgot Password - Reset Password
app.post('/api/apps/:appId/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: 'Email, OTP and a password of at least 6 characters are required'
      });
    }

    const userResult = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const userId = userResult.rows[0].id;
    const otpHash = crypto
      .createHash('sha256')
      .update(String(otp))
      .digest('hex');

    const tokenResult = await pool.query(
      `SELECT id FROM password_reset_tokens
       WHERE user_id = $1
         AND token_hash = $2
         AND used = FALSE
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, otpHash]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, userId]
    );

    await pool.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
      [tokenResult.rows[0].id]
    );

    res.json({ message: 'Password reset successfully. Please login again.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Unable to reset password right now' });
  }
});
// Serve static frontend assets from public/
app.use(express.static(path.join(__dirname, 'public'), {
  index: false // Let SPA fallback handle index.html
}));

// SPA Routing: Send all non-API and non-file requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server with error handling
const server = app.listen(PORT, () => {
  testDatabaseConnection().catch((err) => {
    console.error('Database connection failed:', err.message);
  });
  console.log(`\n======================================================`);
  console.log(`🚆 RailSync AI Server running on http://localhost:${PORT}`);
  console.log(`======================================================`);
  console.log(`Demo Roles available:`);
  console.log(`- admin@railsync.ai       (System Administrator)`);
  console.log(`- controller@railsync.ai  (Section Controller)`);
  console.log(`- engineering@railsync.ai (Engineering Officer)`);
  console.log(`- ohe@railsync.ai         (OHE Officer)`);
  console.log(`- snt@railsync.ai         (S&T Officer)`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = PORT + 1;
    console.log(`Port ${PORT} in use, trying port ${nextPort}...`);
    app.listen(nextPort, () => {
      console.log(`🚆 RailSync AI Server running on http://localhost:${nextPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
