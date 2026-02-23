module.exports = {
    apps: [
        {
            name: 'eatumy-backend',
            cwd: 'c:/Users/Administrator/Desktop/shares/private/eatumy-stack/backend',
            script: 'dist/index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        },
        {
            name: 'eatumy-admin',
            cwd: 'c:/Users/Administrator/Desktop/shares/private/eatumy-stack/admin-web',
            script: '.next/standalone/server.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        },
        {
            name: 'portfolio-web',
            cwd: 'c:/Users/Administrator/Desktop/shares/private/eatumy-stack/shareholder-web',
            script: '.next/standalone/server.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
