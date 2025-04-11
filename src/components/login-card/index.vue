<template>
    <a-modal v-model:visible="isShowLoginModal" :footer="false" modal-class="login-modal" :body-style="{ padding: 0 }"
        :modal-style="{ width: 'initial' }" :render-to-body="false">
        <!-- 登录界面 -->
        <div class="login-box" v-if="isLoginState">
            <div class="close-btn">
                <a-button @click="closeLoginModal">
                    <icon-close />
                </a-button>
            </div>
            <h2 class="login-title"><span class="login-title-text">用户登录</span></h2>
            <div class="input-group">
                <a-input v-model="loginForm.username" placeholder="手机号/邮箱" @blur="validateUsername"
                    :style="{ marginBottom: usernameError ? '5px' : '20px' }">
                    <template #prefix>
                        <icon-user />
                    </template>
                </a-input>
                <span v-if="usernameError" class="error">{{ usernameError }}</span>
                <a-input-password v-model="loginForm.password" placeholder="登录密码">
                    <template #prefix>
                        <icon-lock />
                    </template>
                </a-input-password>
            </div>
            <a-button type="primary" class="login-btn flash-view" @click="handleLogin">登录</a-button>
            <div class="register-link">
                <span @click="switchToRegister" class="p-pointer">注册账号</span>
            </div>
            <div class="footer-links">
                <!-- <span>忘记密码</span> -->
            </div>
        </div>
        <!-- 注册界面 -->
        <div v-else>
            <Register @goLogin="switchToLogin" @closeLoginModal="closeLoginModal" />
        </div>
    </a-modal>
</template>

<script setup>
import { ref, reactive } from "vue";
import { IconClose, IconUser, IconLock } from '@arco-design/web-vue/es/icon';
import { postLoginAPI, getUserInfoAPI } from "@/api/user";
import { Message } from "@arco-design/web-vue";
// 导入注册组件
import Register from "./components/register.vue";
import { useCommonStore } from '@/stores/commonStore';

const commonStore = useCommonStore();
const isShowLoginModal = ref(false);
const isLoginState = ref(true);
const usernameError = ref("");

// 监听commonStore中isShowLoginModal的变化
import { watch } from 'vue';
watch(
    () => commonStore.isShowLoginModal,
    (newVal) => {
        isShowLoginModal.value = newVal;
    }
);

// 登录表单
const loginForm = reactive({
    username: '',
    phone: '',
    email: '',
    password: '',
    enum: 0
});

// 切换到注册页面
const switchToRegister = () => {
    isLoginState.value = false;
};

// 切换到登录页面
const switchToLogin = () => {
    isLoginState.value = true;
};

function handleLogin() {
    if (!usernameError.value) {
        // 判断数据类型, 手机号为0, 邮箱为1
        if (loginForm.username.includes("@")) {
            loginForm.email = loginForm.username;
            loginForm.enum = 1;
        } else {
            loginForm.phone = loginForm.username;
            loginForm.enum = 0;
        }

        postLoginAPI(loginForm).then(res => {
            if (!res.data) {
                Message.error(res.data.message);
                return;
            }

            // 成功处理
            commonStore.setIsShowLoginModal(false);
            commonStore.setLoginState(true);

            // 保存token
            const token = res.data.data.token;
            commonStore.setToken(token);

            // 获取用户信息并储存
            getUserInfoAPI().then(userRes => {
                if (userRes.data.code === 20000) {
                    // 确保用户ID正确保存
                    const userData = {
                        ...userRes.data.data,
                        id: res.data.data.id // 保存登录接口返回的用户ID
                    };
                    commonStore.setUserInfo(userData);
                }
                // 刷新当前页面
                location.reload();
            }).catch(err => {
                console.error('获取用户信息失败:', err);
                // 即使获取用户信息失败，登录仍然成功
                location.reload();
            });
        }).catch(err => {
            console.error('登录失败:', err);
            Message.error('登录失败，请稍后重试');
        });
    }
}

function validateUsername() {
    const phoneRegex = /^1[3-9]\d{9}$/;
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (loginForm.username === "") {
        usernameError.value = "";
        return;
    }

    if (!phoneRegex.test(loginForm.username) && !emailRegex.test(loginForm.username)) {
        usernameError.value = "请输入有效的手机号或邮箱";
    } else {
        usernameError.value = "";
    }
}

// 关闭登录弹窗
const closeLoginModal = () => {
    commonStore.setIsShowLoginModal(false);
    switchToLogin();
};
</script>

<style scoped lang="less">
// 登录弹窗样式
:deep(.login-modal) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    max-width: 420px;
    margin: 0 auto;

    @media screen and (max-width: 480px) {
        max-width: 100%;
        margin: 0 15px;
    }
}

.login-box {
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
}

.error {
    color: #f53f3f;
    font-size: 12px;
    min-height: 20px;
    margin: 0 0 15px;
    display: block;
    padding-left: 5px;
}

.login-btn {
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

.login-title {
    position: relative;

    .login-title-text {
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

.footer-links {
    display: flex;
    justify-content: space-between;
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

.register-link {
    display: flex;
    justify-content: center;
    gap: 30px;
    font-size: 14px;
    color: #999;
    transition: all 0.3s ease;

    span {
        transition: all 0.3s ease;
        position: relative;

        &:hover {
            color: #f596aa;
        }

        &::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 1px;
            background-color: #f596aa;
            transition: all 0.3s ease;
        }

        &:hover::after {
            width: 100%;
        }
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
