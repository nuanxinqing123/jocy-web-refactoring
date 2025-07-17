import axios from 'axios'
import CryptoJS from 'crypto-js';
import { useCommonStore } from '@/stores/commonStore';

export const baseURL = 'https://修改为自己的开发/部署地址/app/';

// 创建axios实例
const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        // 尝试获取pinia store
        try {
            const commonStore = useCommonStore();
            const token = commonStore.token;

            // 如果有token则添加到请求头
            if (token) {
                config.headers['x-token'] = token;
            }
        } catch (error) {
            console.error('获取store失败:', error);
        }

        // 填充签名
        let { signature, timestamp } = generateSignature();
        config.headers['s'] = signature;
        config.headers['t'] = timestamp;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        // 判断 code 是否为 50014, 代表Token已失效, 需要强制登录
        if (response.data.code === 50014) {
            const commonStore = useCommonStore();
            commonStore.clearToken();
            commonStore.setLoginState(false);
            commonStore.setIsShowLoginModal(true);
        }

        return response;
    },
    (error) => {
        // 处理401未授权的情况
        if (error.response && error.response.status === 401) {
            try {
                const commonStore = useCommonStore();
                commonStore.clearToken();
                commonStore.setLoginState(false);

                // 弹出登录框
                commonStore.setIsShowLoginModal(true);
            } catch (error) {
                console.error('获取store失败:', error);
            }
        }

        return Promise.reject(error);
    }
);

// 生成签名的函数
export function generateSignature() {
    const jocy = 'jocy';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomStr = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const reversedRandomStr = randomStr.split('').reverse().join('');

    // 拼接字符串
    const signData = `${jocy}&${timestamp}&${randomStr}`;
    const md5Hash = CryptoJS.MD5(signData).toString();

    // 最终签名
    const signature = `${md5Hash}.${reversedRandomStr}`;

    return {
        signature,
        timestamp,
    };
}

// 同时提供默认导出和命名导出
export const request = instance;
export default instance;
