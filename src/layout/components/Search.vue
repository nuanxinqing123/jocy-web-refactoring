<template>
    <div class="search-container flex align-center content-between">
        <a-input placeholder="搜索番剧" v-model="searchValue"
            :class="isMobile ? 'flex-base search' : 'search navbar-search'" 
            @input="handleSearchInput"
            @press-enter="handleSearch" 
            @blur="searchBlur" 
            autocomplete="off">
            <template #suffix>
                <icon-search @click="handleSearch" size="20" class="theme-icon p-pointer" />
            </template>
        </a-input>
        <div class="search-containerh-recommend" v-if="searchItems.length && !isMobile">
            <div 
                class="recommend-item flex align-center"
                v-for="item in searchItems" 
                :key="item.id"
                @click="handleRecommendItemClick(item)"
            >
                <span v-html="item.nameAll"></span>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { getVideoKey } from "@/api/video";
import { Message } from "@arco-design/web-vue";
import { useCommonStore } from '@/stores/commonStore';

const router = useRouter();
const route = useRoute();
const commonStore = useCommonStore();
const isMobile = computed(() => commonStore.isMobile);

const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false
    }
});

const searchValue = ref('');
const searchItems = ref([]);

// 监听路由变化，更新搜索框的值
watch(
    () => route.query.wd,
    (newWd) => {
        if (newWd) {
            searchValue.value = newWd;
        }
    },
    { immediate: true }
);

// 处理推荐项点击
const handleRecommendItemClick = (item) => {
    searchValue.value = item.name;
    searchBlur();
    router.push(`/search?wd=${item.name}`);
};

// 根据设备类型决定搜索行为
const handleSearchInput = async (value) => {
    // 移动端不执行快捷检索
    if (isMobile.value) {
        return;
    }
    
    // PC端执行快捷检索
    await searchChange(value);
};

const searchChange = async (value) => {
    if (!value) {
        searchItems.value = [];
        return;
    }
    
    try {
        const response = await getVideoKey({
            key: value,
            limit: 1,
            page: 15,
        });

        // 处理响应数据
        if (response && response.data) {
            let videoData;
            
            // 处理不同的数据结构
            if (typeof response.data === 'string') {
                videoData = JSON.parse(response.data);
            } else if (response.data.value) {
                // 处理 { data: { value: ... } } 结构
                if (typeof response.data.value === 'string') {
                    videoData = JSON.parse(response.data.value);
                } else {
                    videoData = response.data.value;
                }
            } else {
                // 直接使用 response.data
                videoData = response.data;
            }

            // 根据API响应结构提取items
            let items = [];
            if (videoData.data && videoData.data.items) {
                items = videoData.data.items;
            } else if (videoData.items) {
                items = videoData.items;
            }

            // 处理搜索结果项
            if (items && items.length > 0) {
                searchItems.value = items.map((item) => {
                    if (typeof item.name === 'string') {
                        item.nameAll = item.name.replace(new RegExp(value, 'gi'), match => 
                            `<span class='theme-color'>${match}</span>`);
                    } else {
                        item.nameAll = item.name || '';
                    }
                    return item;
                });
            } else {
                searchItems.value = [];
            }
        } else {
            searchItems.value = [];
        }
    } catch (error) {
        console.error('搜索失败:', error);
        searchItems.value = [];
    }
};

const searchBlur = () => {
    setTimeout(() => {
        searchItems.value = [];
    }, 200);
};

// 处理搜索提交
const handleSearch = () => {
    if (!searchValue.value) {
        Message.error('请输入搜索内容');
        return;
    }
    searchBlur();
    // 跳转search页面
    router.push(`/search?wd=${searchValue.value}`);
};

// 监听移动设备状态变化
onMounted(() => {
    watch(
        () => commonStore.isMobile,
        () => {
            // 清空搜索结果，防止移动端切换到PC时显示搜索结果
            searchItems.value = [];
        }
    );
});
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