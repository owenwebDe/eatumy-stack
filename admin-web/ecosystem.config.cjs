module.exports = {
    apps: [{
        name: "eatumy-admin",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3001",
        cwd: "./",
        interpreter: "node",
        env: {
            NODE_ENV: "production"
        }
    }]
}
