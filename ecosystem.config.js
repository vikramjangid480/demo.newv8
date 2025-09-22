module.exports = {
  apps: [
    {
      name: 'boganto-backend',
      script: 'mock-backend.js',
      cwd: '/home/user/webapp',
      env: {
        PORT: 8000,
        NODE_ENV: 'development'
      },
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 5,
      autorestart: true
    },
    {
      name: 'boganto-frontend',
      script: 'npm',
      args: ['run', 'dev'],
      cwd: '/home/user/webapp/frontend',
      interpreter: 'none',
      env: {
        PORT: 5173,
        HOST: '0.0.0.0'
      },
      log_file: './logs/frontend.log',
      out_file: './logs/frontend-out.log', 
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 5,
      autorestart: true
    }
  ]
}