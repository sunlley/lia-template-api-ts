module.exports = {
    port: 9001,
    name: 'Api',
    debug: true,
    AccessControlAllow:{
        Origin:"*",
        Headers:"*",
        Methods:"PUT,POST,GET,DELETE,OPTIONS",
        Credentials:true
    },
    // redis:{
    //     host: "127.0.0.1",
    //     port: 6379
    // },
}
