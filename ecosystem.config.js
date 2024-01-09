module.exports = {
  apps: [
    {
      name: "backend",
      script: "./build/index.js",
      cwd: "./build/",
      //instances: "max",
      //exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ]
};
