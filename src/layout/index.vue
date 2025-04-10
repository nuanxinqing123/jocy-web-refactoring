<template>
    <div class="app flex" v-if="isMobile">
        <div class="flex-base flex flex-column">
            <NavbarMobile />
            <div class="app-content flex-base app-content-mobile" @scroll="scrollHandler">
                <router-view v-slot="{ Component }">
                    <component :is="Component" ref="currentPage" />
                </router-view>
                <FootBottom />
            </div>
        </div>
    </div>

    <div class="app flex" v-else>
        <div class="app-layout">
            <Menu></Menu>
        </div>
        <div class="flex-base flex flex-column">
            <NavBar />
            <div class="app-content flex-base" @scroll="scrollHandler">
                <router-view v-slot="{ Component }">
                    <component :is="Component" ref="currentPage" />
                </router-view>
                <FootBottom />
            </div>
        </div>
    </div>
    <LoginCard />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Menu from "./components/Menu.vue";
import FootBottom from "./components/FootBottom.vue";
import NavBar from "./components/NavBar.vue";
import NavbarMobile from "./components/NavbarMobile.vue";
import LoginCard from "@/components/login-card/index.vue";
import { useCommonStore } from '@/stores/commonStore'

const isMobile = ref(false);
const commonStore = useCommonStore();
const currentPage = ref(null);

onMounted(() => {
    isMobile.value = commonStore.isMobile;

    watch(
        () => commonStore.isMobile,
        (newValue) => {
            isMobile.value = newValue;
        }
    );
})

// 防抖函数
const debounce = (fn, delay) => {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};

// 监听滚动事件
const scrollHandler = debounce((e) => {
    // 调用路由页面的滚动处理方法
    currentPage.value?.scrollHandler?.(e);
}, 200);
</script>

<style lang="less" scoped>
.app {
    width: 100vw;
    height: 100vh;
    background: #f7f8f9;

    .app-layout {
        width: 200px;
        height: 100%;

        // 小于1000px样式设置
        @media screen and (max-width: 1000px) {
            width: 100px;
        }
    }

    .app-content {
        padding: 40px;
        padding-top: 0;
        width: 100%;
        overflow-y: auto;

        &.app-content-mobile {
            padding: 16px;
        }
    }
}
</style> 