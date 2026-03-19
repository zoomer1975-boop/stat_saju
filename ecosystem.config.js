module.exports = {
  apps: [
    {
      name: 'stat-saju-proxy',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        BASE_URL: 'https://stat6.kmu.ac.kr/saju',
        PORT: 3003,
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
