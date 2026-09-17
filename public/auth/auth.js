async login(identifier, password, rememberMe = true) {
  const key = (identifier || '').trim();

  try {
    const response = await fetch('/api/apps/railsync/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: key,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.user) {
      return {
        success: false,
        message: data.message || 'Invalid Employee ID / Email or Password.'
      };
    }

    const user = data.user;

    user.lastLogin = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 16);

    this.saveSession(user, rememberMe);

    localStorage.setItem(
      'railsync_access_token',
      data.access_token || ''
    );

    this.hideAuthModal();
    this.updateHeaderBadge();
    this.enforceRolePermissions();

    if (
      window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/register')
    ) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    return { success: true, user };

  } catch (error) {
    console.error('RailSync backend login error:', error);

    return {
      success: false,
      message: 'Unable to connect to RailSync AI backend.'
    };
  }
},