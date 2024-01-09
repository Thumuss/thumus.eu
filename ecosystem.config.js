module.exports = {
  apps: [
    {
      name: "backend",
      script: "./packages",
      cwd: "./build/",
      //instances: "max",
      //exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {

    }
  }
};
