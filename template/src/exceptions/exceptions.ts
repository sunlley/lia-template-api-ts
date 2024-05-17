const exceptions: any = {

    //# 1xx base error
    1000: {
        en: "Missing parameter",
        zh: "请求缺少参数",
    },
    1001: {
        en: "Missing parameter (%s0)",
        zh: "请求缺少参数 (%s0)",
    },
    1002: {
        en: "The type of parameter %s0 is incorrect. The correct type is %s1.",
        zh: "参数 %s0 的类型不对，正确类型为 %s1.",
    },

    //# 2xx user error
    2008: {
        en: "Insufficient balance, please check and try again!",
        zh: "余额不足，请检查后重试",
    },

    //# 5xx server error
    5000: {
        en: "The server does not support this request",
        zh: "服务器不支持此请求",
    },
    5001: {
        en: "The server does not support this request[%s0]",
        zh: "服务器不支持此请求[%s0]",
    }
}

export default exceptions;
