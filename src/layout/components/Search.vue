<template>
    <div class="search-container flex align-center content-between">
        <a-input placeholder="搜索番剧" v-model="searchValue"
            :class="isMobile ? 'flex-base search' : 'search navbar-search'" @input="searchChange"
            @press-enter="searchInput" @blur="searchBlur" autocomplete="off">
            <template #suffix>
                <icon-search @click="searchInput" size="20" class="theme-icon p-pointer" />
            </template>
        </a-input>
        <div class="search-containerh-recommend" v-if="searchItems.length">
            <router-link 
                :to="`/search?wd=${item.name}`" 
                class="recommend-item flex align-center"
                v-for="item in searchItems" 
                :key="item.id"
            >
                <span v-html="item.nameAll"></span>
            </router-link>
        </div>
        <slot></slot>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';
import { getVideoKey } from "@/api/video";
import { Message } from "@arco-design/web-vue";

const router = useRouter();
const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false
    }
});

const searchValue = ref('');
const searchItems = ref([]);

const searchChange = async (value) => {
    if (!value) {
        searchItems.value = [];
        return;
    }
    
    try {
        const { data } = await getVideoKey({
            key: value,
            limit: 1,
            page: 50,
        });

        const videoDetailData = JSON.parse(data.value);
        if (videoDetailData.code === 200) { // 假设状态码OK为200
            searchItems.value = videoDetailData.data.items?.map((item) => {
                item.nameAll = item.name.replace(value, `<span class='theme-color'>${value}</span>`)
                return item;
            });
        } else {
            // 处理数据不存在
            router.push('/404');
        }
    } catch (error) {
        console.error('搜索失败', error);
        searchItems.value = [];
    }
};

const searchBlur = () => {
    setTimeout(() => {
        searchItems.value = [];
    }, 200);
};

const searchInput = () => {
    if (!searchValue.value) {
        Message.error('请输入搜索内容');
        return;
    }
    searchBlur();
    // 跳转search页面
    router.push(`/search?wd=${searchValue.value}`);
};
</script>

<style lang="less" scoped>
:deep(.arco-input-focus) {
    border-color: var(--color-primary);
}

.search-container {
    position: relative;

    .search {
        border-radius: 8px;
        height: 40px;
        background: #E4E6EA;
    }

    .navbar-search {
        width: 260px;

        @media (min-width: 550px) {
            width: 220px;
        }

        @media (min-width: 650px) {
            width: 280px;
        }

        @media (min-width: 850px) {
            width: 500px;
        }

        @media (min-width: 1100px) {
            width: 580px;
        }
    }

    .search-containerh-recommend {
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, .1);
        padding: 10px 0;
        border-radius: 0 0 8px 8px;
        position: absolute;
        z-index: 20;
        width: 97%;
        left: 1.5%;
        top: 40px;
        background: #fff;

        .recommend-item {
            color: #282828;
            font-size: 15px;
            line-height: 40px;
            cursor: pointer;
            padding: 0 10px;
            text-decoration: none;
            font-weight: 600;

            &:hover {
                background: #a5a5a5;
            }
        }
    }
}
</style> 