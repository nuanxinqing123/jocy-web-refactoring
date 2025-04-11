<template>
    <div class="navbar-container view-sticky">
        <div class="navbar flex align-center content-between">
            <Search />
            <div class="navbar-right flex align-center">
                <div class="right-item flex align-center" @click="router.push('/collect')" v-if="isLogin">
                    <icon-heart size="20" class="right-item-icon" /><span class="right-item-text">收藏记录</span>
                </div>
                <div class="right-item flex align-center" @click="router.push('/historical')" v-if="isLogin">
                    <icon-history size="20" class="right-item-icon" /><span class="right-item-text">观看记录</span>
                </div>
                <div class="mac_user header-op-user main-btn flash-view theme-button-bg" title="会员中心" @click="openLogin"
                    v-if="!isLogin">登录</div>
                <a-dropdown trigger="click" v-else>
                    <a-avatar :size="40" :image-url="`${baseURL}users/avatar?id=${userInfo?.id}`"
                        :style="{ cursor: 'pointer', marginLeft: '18px' }" />
                    <template #content>
                        <a-doption>
                            <a-space @click="handleLogout">
                                <icon-export />
                                <span>退出登录</span>
                            </a-space>
                        </a-doption>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import Search from "./Search.vue";
import { useCommonStore } from '@/stores/commonStore';
import { postUserLogoutAPI, getUserInfoAPI } from "@/api/user";
import { baseURL } from '@/utils/request';

const router = useRouter();
const commonStore = useCommonStore();
const isLogin = ref(false);
const userInfo = ref({});

onMounted(() => {
    isLogin.value = commonStore.isLogin;
    
    // 如果用户已登录，先从store获取数据，然后再从API获取最新数据
    if (isLogin.value) {
        userInfo.value = commonStore.userInfo;
        
        // 调用API获取最新用户信息
        getUserInfoAPI().then(res => {
            if (res.data) {
                const userData = {
                    ...res.data.data,
                };
                commonStore.setUserInfo(userData);
                userInfo.value = userData;
            }
        }).catch(err => {
            console.error('获取用户信息失败:', err);
        });
    }
    
    watch(
        () => commonStore.isLogin,
        (newValue) => {
            isLogin.value = newValue;
        }
    );
    
    watch(
        () => commonStore.userInfo,
        (newValue) => {
            userInfo.value = newValue;
        }
    );
});

const openLogin = () => {
    commonStore.setIsShowLoginModal(true);
}

const handleLogout = async () => {
    try {
        await postUserLogoutAPI();
        commonStore.clearToken();
        commonStore.setLoginState(false);
    } catch (error) {
        console.error('退出登录失败:', error);
    }
}
</script>

<style lang="less" scoped>
.navbar-container {
    padding: 0 40px;
    width: 100%;
}

// 小于500px
@media screen and (max-width: 600px) {
    .right-item-text {
        display: none;
    }
}

.header-op-user {
    height: 36px;
    font-size: 14px;
    position: relative;
    color: rgb(255, 255, 255);
    margin-left: 10px;
}

.right-item {
    margin-left: 18px;
    cursor: pointer;

    .right-item-icon {
        margin-right: 5px;
        color: #000;
    }
    
    .right-item-text {
        color: #000;
    }
}

.navbar {
    width: 100%;
    height: 60px;
    border-bottom: 1px solid #eaebec;
    margin-bottom: 20px;
    background: #f7f8f9;
}

:deep(.arco-dropdown-option) {
    padding: 8px 12px;

    &:hover {
        background-color: var(--color-fill-2);
    }

    .arco-space {
        color: var(--color-text-1);
    }

    .arco-icon {
        font-size: 16px;
        color: var(--color-text-2);
    }
}

:deep(.arco-dropdown) {
    .arco-dropdown-list {
        padding: 4px;
        min-width: 140px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
}

@media screen and (max-width: 600px) {
    .right-item-text {
        display: none;
    }
}
</style> 