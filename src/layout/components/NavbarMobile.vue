<template>
    <div class="navbar-mobile flex align-center" v-if="currentRoute?.path !== '/search'">
        <div class="navbar-mobile-left flex-base flex align-center">
            <div class="mobile-left-item flex align-items" v-for="(item, index) in filteredMenus" :key="item.name"
                @click="goPath(item, index)">
                <div class="left-text">{{ item.meta.locale }}</div>
                <div class="left-current" v-if="activeIndex === index"></div>
            </div>
        </div>
        <div class="navbar-mobile-right flex align-center">
            <div class="right-item flex align-center" @click="router.push('/search')">
                <icon-search size="20" class="right-item-icon" />
            </div>
            <div class="mac_user header-op-user main-btn flash-view theme-button-bg" title="会员中心" @click="openLogin"
                v-if="!isLogin">登录</div>
            <a-dropdown trigger="click" v-else>
                <a-avatar :size="40" :image-url="`${baseURL}users/avatar?id=${userInfo?.id}`"
                    :style="{ cursor: 'pointer' }" />
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
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '@/utils/request';
import { postUserLogoutAPI, getUserInfoAPI } from "@/api/user";
import { useCommonStore } from '@/stores/commonStore';
import {IconExport, IconSearch} from "@/components/icons/index.js";

const route = useRoute();
const router = useRouter();
const currentRoute = route;
const commonStore = useCommonStore();
const isLogin = ref(false);
const userInfo = ref({});

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
})

const menus = ref([
    {
        path: "/",
        name: "home",
        meta: {
            parentLocale: "",
            locale: "首页",
            requiresAuth: true,
            icon: "icon-home",
        },
    },
    {
        path: "/library",
        name: "library",
        meta: {
            parentLocale: "",
            locale: "影视库",
            requiresAuth: true,
            icon: "icon-file-video",
        },
    },

    {
        path: "/collect",
        name: "collect",
        meta: {
            locale: "收藏",
            icon: "icon-heart",
            requiresLogin: true,
        },
    },
    {
        path: "/historical",
        name: "historical",
        meta: {
            locale: "历史记录",
            icon: "icon-history",
            requiresLogin: true,
        },
    },
    {
        path: "https://t.me/jocyweb",
        name: "link",
        meta: {
            locale: "TG群组",
            requiresAuth: true,
            icon: "icon-link",
        },
    },
    {
        path: "https://qm.qq.com/q/qi60FX7AiY",
        name: "link",
        meta: {
            locale: "QQ群组",
            requiresAuth: true,
            icon: "icon-link",
        },
    }
]);

// 过滤菜单项，根据登录状态
const filteredMenus = computed(() => {
    return menus.value.filter(menu => {
        // 如果菜单项需要登录但用户未登录，则不显示该项
        return !(menu.meta.requiresLogin && !isLogin.value);
    });
});

const activeIndex = ref(0);

const goPath = (item, index) => {
    if (item.name === 'link') {
        window.open(item.path);
        return;
    }
    activeIndex.value = index;
    router.push(item.path);
};

// 初始化根据当前路由设置活动菜单
const init = () => {
    const currentPath = route.path;
    filteredMenus.value.forEach((menu, index) => {
        if (menu.path === currentPath) {
            activeIndex.value = index;
        }
    });
};

// 监听路由变化，更新选中的菜单项
watch(
    () => route.path,
    () => {
        init();
    }
);

onMounted(() => {
    init();
});
</script>

<style lang="less" scoped>
.navbar-mobile {
    width: 100%;
    height: 44px;
    padding: 0 16px;

    ::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
        color: transparent;
    }

    .navbar-mobile-right {
        width: 110px;
        height: 100%;
        margin-left: 8px;
        justify-content: flex-end;
        gap: 10px;
    }

    .navbar-mobile-left {
        height: 100%;
        overflow-x: auto;
    }

    .mobile-left-item {
        font-size: 16px;
        font-weight: 700;
        color: #616161;
        flex: 0 0 auto;
        margin-right: 20px;
        position: relative;
        height: 100%;

        .left-text {
            position: relative;
            z-index: 2;
        }

        .left-current {
            position: absolute;
            background: #fcd877;
            width: 60%;
            height: 20%;
            bottom: 10px;
            left: 20%;
            z-index: 1;
        }
    }

    .right-item {
        margin-right: 0;
    }
}
</style>
