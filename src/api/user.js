import request from '@/utils/request';

// 登录
export function postLoginAPI(data) {
    return request({
        url: '/users/login',
        method: 'post',
        data
    });
}

// 获取图片验证码
export const postUserCaptchaAPI = (data) => {
    return request.post("users/captcha", {
        "type": data
    });
}

// 发送注册验证码
export const postUserSmsAPI = (data) => {
    return request.post("users/smscode", {
        "phone": data.username,
        "email": data.username,
        "type": data.type,
        "uuid": data.uuid,
        "dots": data.dots,
        "enum": data.enum
    });
}

// 用户注册
export function postRegisterAPI(data) {
    return request({
        url: '/users/register',
        method: 'post',
        data
    });
}

// 用户登出
export function postUserLogoutAPI() {
    return request({
        url: '/users/logout',
        method: 'post'
    });
}

// 获取用户信息
export function getUserInfoAPI() {
    return request({
        url: '/users/info',
        method: 'get'
    });
}

// 更新用户信息
export function updateUserInfoAPI(data) {
    return request({
        url: '/users/info',
        method: 'put',
        data
    });
}

// 更新用户头像
export function updateUserAvatarAPI(data) {
    return request({
        url: '/users/avatar',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
