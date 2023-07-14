const exceptions: any = {

    //# 1xx base error
    100: {
        en: "Missing parameter",
        zh: "请求缺少参数",
    },
    101: {
        en: "Missing parameter %s0",
        zh: "请求缺少参数 %s0",
    },
    //# 2xx user error
    200: {
        en: "The user not found!",
        zh: "用户未找到",
    },

    //# 5xx server error
    500: {
        en: "The server does not support this request",
        zh: "服务器不支持此请求",
    },
    501: {
        en: "The server does not support this request[%s0]",
        zh: "服务器不支持此请求[%s0]",
    }
}

export default exceptions;
