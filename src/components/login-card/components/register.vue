<template>
    <div class="register-box">
        <div class="close-btn">
            <a-button @click="emit('closeLoginModal')">
                <icon-close />
            </a-button>
        </div>
        <h2 class="register-title"><span class="register-title-text">用户注册</span></h2>

        <div class="input-group">
            <!-- 用户名输入框 -->
            <a-input v-model="registerForm.username" placeholder="请输入用户名" @blur="validateUsername"
                :style="{ marginBottom: usernameError ? '5px' : '20px' }">
                <template #prefix>
                    <icon-user />
                </template>
            </a-input>
            <span v-if="usernameError" class="error">{{ usernameError }}</span>

            <!-- 图形验证码 -->
            <div class="captcha-group">
                <a-input v-model="registerForm.imageCaptcha" placeholder="请输入图形验证码">
                    <template #prefix>
                        <icon-safe />
                    </template>
                </a-input>
                <div class="captcha-image" @click="refreshCaptcha">
                    <img :src="captchaUrl" alt="验证码" />
                </div>
            </div>

            <!-- 手机号/邮箱输入框 -->
            <div class="contact-group">
                <a-input v-model="registerForm.contact" placeholder="手机号/邮箱"
                    @blur="validateContact" :style="{ marginBottom: contactError ? '5px' : '0' }">
                    <template #prefix>
                        <icon-mobile v-if="!isEmail" />
                        <icon-email v-else />
                    </template>
                </a-input>
                <a-button type="outline" :disabled="!canSendCode" @click="sendVerificationCode"
                    class="send-code-btn">
                    {{ sendCodeText }}
                </a-button>
            </div>
            <span v-if="contactError" class="error">{{ contactError }}</span>

            <!-- 验证码输入框 -->
            <a-input v-model="registerForm.verificationCode" placeholder="请输入验证码" class="verification-input">
                <template #prefix>
                    <icon-check-circle />
                </template>
            </a-input>

            <!-- 密码输入框 -->
            <a-input-password v-model="registerForm.password" placeholder="请输入密码" @blur="validatePassword"
                :style="{ marginBottom: passwordError ? '5px' : '20px' }">
                <template #prefix>
                    <icon-lock />
                </template>
            </a-input-password>
            <span v-if="passwordError" class="error">{{ passwordError }}</span>
        </div>

        <a-button type="primary" class="register-btn flash-view" :loading="loading" @click="handleRegister">
            注册
        </a-button>

        <div class="footer-links">
            <span class="p-pointer" @click="goLogin">已有账号？去登录</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { postRegisterAPI, postUserCaptchaAPI, postUserSmsAPI } from '@/api/user';
import { Message } from '@arco-design/web-vue';
import { IconClose, IconUser, IconLock, IconMobile, IconEmail, IconSafe, IconCheckCircle } from '@arco-design/web-vue/es/icon';

// 验证码相关变量
const captchaUUID = ref('');
const captchaUrl = ref('');
const countdown = ref(0);

// 注册表单数据
const registerForm = ref({
    username: '',
    imageCaptcha: '',
    contact: '',
    verificationCode: '',
    password: ''
});

// 错误提示
const usernameError = ref('');
const contactError = ref('');
const passwordError = ref('');

// 加载状态
const loading = ref(false);

// 定义emit
const emit = defineEmits(['goLogin', 'closeLoginModal']);

// 是否为邮箱模式
const isEmail = computed(() => {
    return registerForm.value.contact.includes('@');
});

// 是否可以发送验证码
const canSendCode = computed(() => {
    return registerForm.value.contact && !countdown.value;
});

// 发送验证码按钮文本
const sendCodeText = computed(() => {
    return countdown.value ? `${countdown.value}秒后重试` : '发送验证码';
});

// 刷新验证码
const refreshCaptcha = async () => {
    try {
        const res = await postUserCaptchaAPI("reg");
        if (!res.data) {
            Message.error(res.data.message);
            return;
        }
        captchaUUID.value = res.data.data.uuid;
        captchaUrl.value = res.data.data.image_base64;
    } catch (error) {
        console.error('获取验证码失败:', error);
        Message.error('获取验证码失败，请刷新页面重试');
    }
};

// 发送验证码
const sendVerificationCode = () => {
    if (!canSendCode.value) return;

    countdown.value = 60;
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
        }
    }, 1000);

    // 创建符合SmsCodeType类型的对象
    const smsCodeData = {
        username: registerForm.value.contact,
        uuid: captchaUUID.value,
        // 将图形验证码转换为数字类型
        dots: registerForm.value.imageCaptcha,
        type: "reg",
        enum: isEmail.value ? 1 : 0
    };

    // 发送验证码
    postUserSmsAPI(smsCodeData).then(res => {
        if (res.data.code !== 200) {
            Message.warning(res.data.message);
            return;
        }
        Message.success(res.data.message);
    })
};

// 表单验证
const validateUsername = () => {
    if (!registerForm.value.username) {
        usernameError.value = '用户名不能为空';
        return false;
    }
    usernameError.value = '';
    return true;
};

const validateContact = () => {
    const contact = registerForm.value.contact;
    if (!contact) {
        contactError.value = '手机号/邮箱不能为空';
        return false;
    }

    if (isEmail.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
            contactError.value = '请输入有效的邮箱地址';
            return false;
        }
    } else {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(contact)) {
            contactError.value = '请输入有效的手机号';
            return false;
        }
    }

    contactError.value = '';
    return true;
};

const validatePassword = () => {
    const password = registerForm.value.password;
    if (!password) {
        passwordError.value = '密码不能为空';
        return false;
    }
    if (password.length < 6) {
        passwordError.value = '密码长度不能少于6位';
        return false;
    }
    passwordError.value = '';
    return true;
};

// 注册处理
const handleRegister = async () => {
    if (!validateUsername() || !validateContact() || !validatePassword()) {
        return;
    }

    loading.value = true;
    try {
        // 调用注册接口
        const res = await postRegisterAPI({
            username: registerForm.value.contact,
            user_name: registerForm.value.username,
            sms_code: registerForm.value.verificationCode,
            password: registerForm.value.password,
            enum: isEmail.value ? 1 : 0
        });

        if (res.data.code !== 200) {
            Message.warning(res.data.message);
            loading.value = false;
            return;
        }
        Message.success(res.data.message);
        // 注册成功后跳转到登录页面
        goLogin();
    } catch (error) {
        // 处理错误
        Message.error('注册失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 跳转登录页面
const goLogin = () => {
    emit('goLogin');
}

// 初始化时刷新验证码
refreshCaptcha();
</script>

<style scoped lang="less">
.register-box {
    position: relative;
    width: 100%;
    background: #fff;
    border-radius: 16px;
    padding: 40px 30px;
    box-sizing: border-box;
    transition: all 0.3s ease;

    @media screen and (max-width: 480px) {
        padding: 30px 20px;
        border-radius: 12px;
    }

    h2 {
        text-align: center;
        font-size: 26px;
        color: #333;
        margin-bottom: 30px;

        @media screen and (max-width: 480px) {
            font-size: 22px;
            margin-bottom: 25px;
        }
    }
}

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 10;

    :deep(.arco-btn) {
        border: none;
        padding: 8px;
        min-width: auto;
        color: rgb(var(--gray-6));
        border-radius: 50%;
        transition: all 0.3s ease;

        &:hover {
            color: #f596aa;
            background-color: rgb(var(--primary-1));
            box-shadow: 0 2px 8px rgba(var(--primary-6), 0.2);
        }
    }
}

.input-group {
    margin-bottom: 10px;

    :deep(.arco-input-wrapper) {
        background-color: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 10px;
        padding: 10px 15px;
        transition: all 0.3s ease;

        &:hover, &:focus-within {
            border-color: #f596aa;
            background-color: #fff;
            box-shadow: 0 0 0 2px rgba(245, 150, 170, 0.1);
        }

        .arco-input-prefix {
            margin-right: 10px;
            color: #999;
        }
    }

    :deep(.arco-input) {
        font-size: 15px;
    }

    .verification-input {
        margin-bottom: 20px;
    }
}

.register-title {
    position: relative;
    text-align: center;

    .register-title-text {
        position: relative;
        z-index: 2;
    }

    &::before {
        content: '';
        position: absolute;
        width: 100px;
        height: 15px;
        left: 50%;
        margin-left: -50px;
        background: #ffddd5;
        bottom: 3px;
        border-radius: 4px;
        transform: skewX(-15deg);
        z-index: 1;
    }
}

.captcha-group {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;

    :deep(.arco-input-wrapper) {
        margin-bottom: 0;
        flex: 1;
    }

    .captcha-image {
        width: 150px;
        height: 40px;
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 3px 8px rgba(245, 150, 170, 0.3);
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}

.contact-group {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;

    :deep(.arco-input-wrapper) {
        margin-bottom: 0;
        flex: 1;
    }

    .send-code-btn {
        width: 120px;
        white-space: nowrap;
        height: 40px;
        border-color: #f596aa;
        color: #f596aa;

        &:hover:not(:disabled) {
            background-color: rgba(245, 150, 170, 0.1);
            border-color: #f28b82;
            color: #f28b82;
        }

        &:disabled {
            border-color: #ddd;
            color: #999;
        }

        @media screen and (max-width: 480px) {
            width: 110px;
            font-size: 13px;
        }
    }
}

.error {
    color: #f53f3f;
    font-size: 12px;
    min-height: 20px;
    margin: 0 0 15px;
    display: block;
    padding-left: 5px;
}

.register-btn {
    width: 100%;
    height: 46px;
    background: linear-gradient(135deg, #f596aa 0%, #f28b82 100%);
    border: none;
    border-radius: 23px;
    font-size: 16px;
    margin: 25px 0 20px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(245, 150, 170, 0.3);

    &:hover {
        background: linear-gradient(135deg, #f28b82 0%, #f596aa 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(245, 150, 170, 0.4);
    }

    @media screen and (max-width: 480px) {
        height: 44px;
        font-size: 15px;
        margin: 20px 0 15px;
    }
}

.footer-links {
    text-align: center;
    padding: 0 5px;

    span {
        color: #666;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            color: #f596aa;
        }
    }

    @media screen and (max-width: 480px) {
        font-size: 13px;
    }
}

// 添加动画效果
.flash-view {
    position: relative;
    overflow: hidden;

    &::after {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
        );
        transform: rotate(30deg);
        opacity: 0;
        transition: opacity 0.3s;
    }

    &:hover::after {
        opacity: 1;
        animation: flash 1.5s infinite;
    }
}

@keyframes flash {
    0% {
        transform: translate(-100%, -100%) rotate(30deg);
    }
    100% {
        transform: translate(100%, 100%) rotate(30deg);
    }
}
</style> 