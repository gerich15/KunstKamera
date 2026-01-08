module.exports = {
  apps: [
    {
      name: 'kunstkamera',
      script: 'npm',
      args: 'start',
      cwd: '/home/u/your-username/kunstkamera',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Добавьте ваши переменные окружения здесь ИЛИ используйте .env.local файл
        // NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
        // NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_anon_key_here',
        // NEXT_PUBLIC_SITE_URL: 'https://your-domain.com',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}

