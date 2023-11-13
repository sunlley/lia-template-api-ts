const package = require('../../package.json');

module.exports = {
    name: package.name,
    port: package.port,
    version: package.version,
    description: package.description,
    debug: true,
    AccessControlAllow:{
        Origin:"*",
        Headers:"*",
        Methods:"PUT,POST,GET,DELETE,OPTIONS",
        Credentials:true
    }
}
