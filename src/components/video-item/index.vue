<template>
    <div class="video-list">
        <a-row :gutter="[16, 16]" v-if="isMobile">
            <a-col :span="12" v-for="item in channelData" :key="item.id">
                <div class="video-card">
                    <div class="video-cover">
                        <router-link :to="`/detail/${item.id}`">
                            <img :src="handleImage(item.pic)" :alt="item.name">
                        </router-link>
                    </div>
                    <div class="video-info">
                        <router-link :to="`/detail/${item.id}`" class="video-link">
                            <h3 class="video-title">{{ item.name }}</h3>
                            <p class="video-episode">{{ item.continu }}</p>
                        </router-link>
                    </div>
                </div>
            </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" v-else>
            <a-col :span="8" :xs="8" :sm="8" :md="6" :lg="4" v-for="item in channelData" :key="item.id">
                <div class="video-card">
                    <div class="video-cover">
                        <router-link :to="`/detail/${item.id}`">
                            <img :src="handleImage(item.pic)" :alt="item.name">
                        </router-link>
                    </div>
                    <div class="video-info">
                        <router-link :to="`/detail/${item.id}`" class="video-link">
                            <h3 class="video-title">{{ item.name }}</h3>
                            <p class="video-episode">{{ item.continu }}</p>
                        </router-link>
                    </div>
                </div>
            </a-col>
        </a-row>
        <!-- 加载状态和无数据提示 -->
        <div class="load-more" v-if="enablePagination">
            <a-spin v-if="loading && hasMore" />
            <p v-if="!hasMore" class="no-more">没有更多数据喽～</p>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { getVideoListAPI } from '@/api/video';
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/commonStore'
import { handleImage } from '@/utils/image';

const commonStore = useCommonStore();
const { isMobile } = storeToRefs(commonStore);

const props = defineProps({
    channel: {
        type: String,
        default: '1'
    },
    sort: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    area: {
        type: String,
        default: ''
    },
    year: {
        type: String,
        default: ''
    },
    limit: {
        type: Number,
        default: 12
    },
    page: {
        type: Number,
        default: 1
    },
    enablePagination: {
        type: Boolean,
        default: false
    }
});

// 列表数据和状态
const channelData = ref([]);
const currentPage = ref(1);
const total = ref(0);
const loading = ref(false);
const hasMore = ref(true);

// 计算实际要使用的限制数
const actualLimit = computed(() => {
    return isMobile.value ? 6 : props.limit;
});

// 获取频道数据
const getVideoList = async (isLoadMore = false) => {
    if (loading.value || (!isLoadMore && !hasMore.value)) return;

    loading.value = true;
    try {
        const res = await getVideoListAPI({
            ...props,
            limit: actualLimit.value,
            page: currentPage.value
        });

        // 检查响应是否有效
        if (res && res.data) {
            // 标准响应格式
            total.value = res.data.data.total || 100;
                
            if (isLoadMore) {
                channelData.value.push(...res.data.data.items);
            } else {
                channelData.value = res.data.data.items;
                currentPage.value = 1;
                hasMore.value = true;
            }

            // 检查是否还有更多数据
            hasMore.value = channelData.value.length < total.value;
        }
    } catch (error) {
        console.error('获取视频列表失败:', error);
        hasMore.value = false;
    } finally { 
        loading.value = false;
    }
};

// 监听筛选条件变化
watch(
    () => ({
        channel: props.channel,
        sort: props.sort,
        type: props.type,
        area: props.area,
        year: props.year,
        isMobile: isMobile.value
    }),
    () => {
        currentPage.value = 1;
        hasMore.value = true;
        getVideoList();
    },
    { deep: true, immediate: true }
);

// 设置滚动监听
onMounted(() => {
    getVideoList();
});

// 监听滚动加载更多
const scrollHandler = async (e) => {
    if (!hasMore.value || loading.value) return;
    
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight > scrollHeight - 300) {
        currentPage.value++;
        await getVideoList(true);
    }
};

defineExpose({
    scrollHandler
});
</script>

<style scoped lang="less">
.video-list {
    padding: 0;
    margin-bottom: 20px;
}

.video-card {
    width: 100%;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
        transform: translateY(-6px);

        .video-info {
            .video-title {
                color: #f596aa;
            }
        }
    }

    .video-cover {
        width: 100%;
        position: relative;
        padding-top: 133%;
        overflow: hidden;

        a {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
        }
    }

    .video-info {
        width: 100%;
        padding: 8px;
        height: 60px;

        .video-link {
            text-decoration: none;
            color: inherit;
            display: block;
            height: 100%;
        }

        .video-title {
            font-size: 14px;
            font-weight: 500;
            margin: 0 0 4px;
            color: var(--color-text);
            line-height: 1.4;
            height: 20px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            overflow: hidden;
            white-space: normal;
            word-break: break-all;
            text-overflow: ellipsis;
        }

        .video-episode {
            font-size: 12px;
            color: #999;
            margin: 0;
            line-height: 1.5;
            height: 18px;
            overflow: hidden;
        }
    }
}

.load-more {
    text-align: center;
    padding: 20px 0;
    
    .no-more {
        color: #999;
        font-size: 14px;
    }
}
</style> 