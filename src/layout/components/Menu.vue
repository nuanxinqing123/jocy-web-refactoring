<template>
    <div class="app-menu flex flex-column">
        <div class="menu-logo flex align-items" :class="activeIndex === 0 ? 'menu-top-radius' : ''">
            <img src="@/assets/image/logo.jpg" class="menu-logo-img"  alt="logo"/>
        </div>
        <div class="menu-item flex align-center" v-for="(item, index) in filteredMenus" :key="index" :class="[
            activeIndex === index ? 'active' : '',
            activeIndex - 1 === index ? 'menu-top-radius' : '',
            activeIndex + 1 === index ? 'menu-bottom-radius' : '',
        ]" @click="goPath(item, index)">
            <div class="menu-item-icon-active" v-if="activeIndex === index"></div>
            <component :is="item?.meta?.icon" class="menu-item-icon" size="20"></component>
            <div class="menu-item-name">{{ item.meta.locale }}</div>
            <icon-arrow-right class="menu-item-go" size="14" />
        </div>
        <div class="menu-more flex-base"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useCommonStore } from '@/stores/commonStore';
import {IconArrowRight} from "@/components/icons/index.js";

const route = useRoute();
const router = useRouter();
const commonStore = useCommonStore();
const isLogin = ref(false);

// 菜单项定义
const menus = ref([
    {
        path: "/",
        name: "home",
        meta: {
            parentLocale: "",
            locale: "首页",
            requiresAuth: true,
            icon: "icon-home",
            localeName: "首页",
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
            localeName: "日漫",
        },
    },

    {
        path: "/collect",
        name: "collect",
        meta: {
            locale: "我的收藏",
            icon: "icon-heart",
            requiresLogin: true,
        },
    },
    {
        path: "/historical",
        name: "historical",
        meta: {
            locale: "观看历史",
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
]);

// 过滤菜单项，根据登录状态
const filteredMenus = computed(() => {
    return menus.value.filter(menu => {
        // 如果菜单项需要登录但用户未登录，则不显示该项
        return !(menu.meta.requiresLogin && !isLogin.value);
    });
});

const activeIndex = ref(0);

// 根据当前路由设置活动菜单
const setActiveMenu = () => {
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
        setActiveMenu();
    }
);

onMounted(() => {
    // 初始化登录状态
    isLogin.value = commonStore.isLogin;

    // 监听登录状态变化
    watch(
        () => commonStore.isLogin,
        (newValue) => {
            isLogin.value = newValue;
        }
    );

    setActiveMenu();
});

const goPath = (item, index) => {
    if (item.name === 'link') {
        window.open(item.path);
        return;
    }
    activeIndex.value = index;
    router.push(item.path);
};
</script>

<style lang="less" scoped>
.app-menu {
    width: 100%;
    height: 100%;

    .menu-item {
        width: 100%;
        height: 50px;
        padding: 0 16px;
        padding-left: 31px;
        cursor: pointer;
        position: relative;
        background: #fff;
        border-right: 1px solid #e9ecef;

        .menu-item-name {
            color: #282828;
            font-size: 16px;
            margin-left: 8px;
            font-weight: bold;
        }

        // 小于550px
        @media screen and (max-width: 550px) {
            .menu-item-name {
                display: none;
            }
        }

        .menu-item-icon {
            font-weight: bold;
        }

        .menu-item-go {
            display: none;
            position: absolute;
            right: 60px;
            color: #f596aa;
            font-weight: 700;
        }

        @keyframes go {
            0% {
                right: 60px;
            }

            100% {
                right: 30px;
            }
        }

        &:hover {
            .menu-item-icon {
                color: #f596aa;
            }

            .menu-item-name {
                color: #f596aa;
                font-weight: bold;
            }

            .menu-item-go {
                display: block;
                right: 16px;
                animation: go 0.3s ease forwards;
            }
        }

        &.active {
            background: #f7f8f9;
            border-right: none;

            .menu-item-icon {
                color: #f596aa;
            }

            .menu-item-name {
                color: #f596aa;
                font-weight: bold;
            }

            &:hover {
                .menu-item-go {
                    display: none;
                }
            }
        }

        .menu-item-icon-active {
            position: absolute;
            top: 0;
            left: 0;
            width: 30px;
            height: 100%;
            background: transparent;
            opacity: 0.3;
        }
    }

    .menu-logo {
        width: 100%;
        padding: 10px 0;
        background: #fff;
        border-right: 1px solid #e9ecef;

        .menu-logo-img {
            max-height: 40px;
        }
    }

    @radius: 25px;

    .menu-top-radius {
        border-bottom-right-radius: @radius;
    }

    .menu-bottom-radius {
        border-top-right-radius: @radius;
    }

    .menu-more {
        background: #fff;
    }

    // 小于1000px样式设置
    @media screen and (max-width: 1000px) {
        .menu-item-icon-active {
            display: none;
        }

        .menu-item {
            -webkit-flex-direction: column;
            flex-direction: column;
            align-items: center;
            -webkit-justify-content: center;
            justify-content: center;

            .menu-item-name {
                margin-left: 0;
                margin-top: 3px;
                font-size: 12px;
            }

            &:hover {
                .menu-item-go {
                    display: none;
                }
            }
        }
    }
}
</style>
