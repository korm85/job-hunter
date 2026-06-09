module.exports = {
  apps: [
    {
      name: "linkedin-bridge",
      script: "dist/server.js",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
      restart_delay: 5000,
      max_restarts: 10,
    },
    {
      name: "cloudflare-tunnel",
      script: "cloudflared",
      args: "tunnel --url http://localhost:3001",
      interpreter: "none",
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
