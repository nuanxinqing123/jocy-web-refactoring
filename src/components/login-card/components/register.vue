<template>
    <div class="register-box">
        <div class="close-btn">
            <a-button @click="closeLoginModal">
                <icon-close />
            </a-button>
        </div>
        <h2 class="register-title"><span class="register-title-text">注册账号</span></h2>
        
        <div class="input-group">
            <a-input v-model="registerForm.username" placeholder="手机号/邮箱" @blur="validateUsername"
                :style="{ marginBottom: usernameError ? '5px' : '20px' }">
                <template #prefix>
                    <icon-user />
                </template>
            </a-input>
            <span v-if="usernameError" class="error">{{ usernameError }}</span>
            
            <a-input-password v-model="registerForm.password" placeholder="设置密码"
                :style="{ marginBottom: passwordError ? '5px' : '20px' }">
                <template #prefix>
                    <icon-lock />
                </template>
            </a-input-password>
            <span v-if="passwordError" class="error">{{ passwordError }}</span>
            
            <a-input-password v-model="registerForm.confirmPassword" placeholder="确认密码"
                :style="{ marginBottom: confirmPasswordError ? '5px' : '20px' }">
                <template #prefix>
                    <icon-check-circle />
                </template>
            </a-input-password>
            <span v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</span>
        </div>
        
        <a-button type="primary" class="register-btn flash-view" @click="handleRegister">注册</a-button>
        <div class="footer-links">
            <span @click="goLogin" class="p-pointer">已有账号? 去登录</span>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { IconClose, IconUser, IconLock, IconCheckCircle } from '@arco-design/web-vue/es/icon';
import { postRegisterAPI } from "@/api/user";
import { Message } from "@arco-design/web-vue";

const emit = defineEmits(['goLogin', 'closeLoginModal']);

const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    enum: 0 // 0代表手机号，1代表邮箱
});

const usernameError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// 验证用户名
function validateUsername() {
    const phoneRegex = /^1[3-9]\d{9}$/;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    
    if (registerForm.username === "") {
        usernameError.value = "";
        return;
    }
    
    if (!phoneRegex.test(registerForm.username) && !emailRegex.test(registerForm.username)) {
        usernameError.value = "请输入有效的手机号或邮箱";
    } else {
        usernameError.value = "";
    }
}

// 验证密码
function validatePassword() {
    if (registerForm.password === "") {
        passwordError.value = "";
        return;
    }
    
    if (registerForm.password.length < 6) {
        passwordError.value = "密码长度不能少于6位";
    } else {
        passwordError.value = "";
    }
}

// 验证确认密码
function validateConfirmPassword() {
    if (registerForm.confirmPassword === "") {
        confirmPasswordError.value = "";
        return;
    }
    
    if (registerForm.confirmPassword !== registerForm.password) {
        confirmPasswordError.value = "两次输入的密码不一致";
    } else {
        confirmPasswordError.value = "";
    }
}

// 监听密码变化
watch(() => registerForm.password, () => {
    validatePassword();
    if (registerForm.confirmPassword) {
        validateConfirmPassword();
    }
});

// 监听确认密码变化
watch(() => registerForm.confirmPassword, validateConfirmPassword);

// 处理注册
async function handleRegister() {
    // 先验证所有字段
    validateUsername();
    validatePassword();
    validateConfirmPassword();
    
    // 检查是否有错误
    if (usernameError.value || passwordError.value || confirmPasswordError.value) {
        return;
    }
    
    // 判断数据类型
    if (registerForm.username.includes("@")) {
        registerForm.enum = 1; // 邮箱
    } else {
        registerForm.enum = 0; // 手机号
    }
    
    try {
        const result = await postRegisterAPI({
            username: registerForm.username,
            password: registerForm.password,
            enum: registerForm.enum
        });
        
        if (result.data.code === 200) { // 假设状态码OK为200
            Message.success('注册成功，请登录');
            goLogin();
        } else {
            Message.error(result.data.message || '注册失败，请稍后重试');
        }
    } catch (error) {
        console.error('注册失败:', error);
        Message.error('注册失败，请稍后重试');
    }
}

// 去登录页面
function goLogin() {
    emit('goLogin');
}

// 关闭登录弹窗
function closeLoginModal() {
    emit('closeLoginModal');
}
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
    }
}

.footer-links {
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
</style> 