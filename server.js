const express = require('express');
const cors = require('cors');
const path = require('path');

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

app.post('/api/apps/:appId/auth/login', (req, res) => {
  const { email, password } = req.body;
  const key = (email || '').trim().toLowerCase();

  const user = DEMO_USERS[key] || DEMO_USERS_BY_EMP_ID[key] || {
  id: `guest_${Date.now()}`,
  email: email,
  full_name: email.split('@')[0],
  role: 'Section Controller',
  employee_id: `GUEST-${Date.now()}`,
  department: 'Demo Operations',
  is_active: true,
  password: password
};

if (!email || !password) {
  return res.status(400).json({
    status: 400,
    message: 'Email and password are required'
  });
}

  const token = `demo_token_${user.id}_${Date.now()}`;
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
});

app.post('/api/apps/:appId/auth/register', (req, res) => {
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
  const newUser = {
    id: `usr_${Date.now()}`,
    employeeId: employeeId || `IR-${Math.floor(100000 + Math.random() * 900000)}`,
    name: name || 'Railway Officer',
    password: password,
    email: email || `user_${Date.now()}@railsync.ai`,
    department: department || 'Operations',
    role: role || 'Section Controller',
    division: division || 'Delhi (DLI)',
    zone: zone || 'Northern Railway (NR)',
    status: 'Active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    allowedModules: ['*']
  };

  DEMO_USERS[newUser.email.toLowerCase()] = newUser;
  DEMO_USERS_BY_EMP_ID[newUser.employeeId.toLowerCase()] = newUser;

  const token = `demo_token_${newUser.id}_${Date.now()}`;
  activeSessions.set(token, newUser);

  res.json({
    access_token: token,
    user: newUser,
    message: 'Registration successful'
  });
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
