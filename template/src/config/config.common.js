module.exports = {
    port: 9901,
    name: 'Api',
    debug: true,
    access_control_allow: {
        Origin: "*",
        Headers: "*",
        Methods: "PUT,POST,GET,DELETE,OPTIONS",
        Credentials: true
    },
    keys:{
    },
    // mysql:{
    //     host: "127.0.0.1",
    //     port: 3306,
    //     user: 'xx',
    //     password:'xxxxxxx',
    //     database:'xx'
    // },
    // redis:{
    //     host: "127.0.0.1",
    //     port: 6379
    // }
    exceptions: {
        //# 1xxx logic error
        1000: "Missing parameter",
        1001: "Missing parameter (%s0)",
        1002: "The type of parameter %s0 is incorrect. The correct type is %s1.",

        //# 4xxx client error
        4000: "Bad Request",
        4001: "Unauthorized",
        4003: "Forbidden",
        4004: "Not Found",

        //# 5xxx server error
        5000: "The server does not support this request",
        5001: "The server does not support this request[%s0]"
    }

}
