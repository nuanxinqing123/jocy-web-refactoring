<template>
    <div class="search-container">
        <!-- 移动端顶部搜索框 -->
        <div v-if="isMobile" class="mobile-search-header flex align-center">
            <Search :isMobile="true">
                <div class="search-cancel-btn" @click="router.go(-1)">取消</div>
            </Search>
        </div>

        <!-- 搜索结果区域 -->
        <div class="search-result-area">
            <div class="search-container-top font-bold">
                <p v-if="searchWd">搜索"<span class="theme-color">{{ searchWd }}</span>"，找到{{ videoList.length }}部影片</p>
                <p v-else>请输入搜索关键词</p>
                <Divider />
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
                <Spin :size="30" tip="搜索中..."></Spin>
            </div>

            <div v-else class="search-container-content flex flex-wrap content-between">
                <!-- 空结果提示 -->
                <div v-if="searchWd && !videoList.length" class="empty-state">
                    <Empty>
                        <template #image>
                            <IconEmpty style="font-size: 80px; color: var(--color-text-3)" />
                        </template>
                        <div class="empty-text">
                            <div class="main-text">没有找到与"<span class="theme-color">{{ searchWd }}</span>"相关的影片</div>
                            <div class="sub-text">可尝试缩短关键词试试，如 七龙珠第一季粤语 可换成 七龙珠 进行搜索</div>
                        </div>
                    </Empty>
                </div>

                <!-- 搜索结果列表 -->
                <div class="content-video" v-for="(item, index) in videoList" :key="index">
                    <div class="content-video-img" @click="router.push(`/video/${item.id}`)">
                        <img :src="item.pic" class="video-img" alt="视频封面"
                            @error="e => e.target.src = 'https://placeholder.pics/svg/200x280/DEDEDE/555555/暂无封面'" />
                        <div class="video-img-text text-center">{{ item.continu }}</div>
                    </div>
                    <div class="content-video-info">
                        <div class="info-title hide-overflow theme-color-text-hover p-pointer p-right" @click="router.push(`/detail/${item.id}`)">
                            {{ item.name }}
                        </div>
                        <div class="info-type hide-overflow p-right">{{ item.year }} <span class="divider-line">/</span> {{ item.type }}
                        </div>
                        <div class="info-type hide-overflow p-right">{{ item.actor }}</div>
                        <div class="info-actions flex align-center">
                            <div class="btn-actions" @click="router.push(`/video/${item.id}`)">
                                <div class="play-btn flash-view theme-button-bg">
                                    <IconPlayCircle />播放
                                </div>
                            </div>
                            <div class="btn-actions btn-right">
                                <div class="detail-btn flash-view theme-button-border"
                                    @click="router.push(`/detail/${item.id}`)">
                                    详情
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="content-video-bg"></div>
                    <!-- 连载状态标签 -->
                    <div class="info-icon" v-if="item.isend === 0">连载中</div>
                    <div class="info-icon" v-if="item.isend === 1">已完结</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import Search from "@/layout/components/Search.vue";
import { useCommonStore } from '@/stores/commonStore';
import { getVideoSearch } from "@/api/video";
import { Empty, Spin, Divider } from '@arco-design/web-vue';
// 使用官方推荐的方式导入图标
import IconPlayCircle from '@arco-design/web-vue/es/icon/icon-play-circle';
import IconEmpty from '@arco-design/web-vue/es/icon/icon-empty';

const router = useRouter();
const route = useRoute();
const commonStore = useCommonStore();
const isMobile = computed(() => commonStore.isMobile);

// 获取query参数
const searchWd = ref(route.query.wd || '');
const videoList = ref([]);
const loading = ref(false);

// 获取搜索数据
const fetchData = async () => {
    if (!searchWd.value) {
        videoList.value = [];
        return;
    }

    loading.value = true;
    try {
        const response = await getVideoSearch({
            key: searchWd.value,
            limit: 25,
            page: 1,
        });

        if (response && response.data) {
            videoList.value = response.data.data.items || [];
        } else {
            videoList.value = [];
        }
    } catch (error) {
        console.error('搜索数据获取失败:', error);
        videoList.value = [];
    } finally {
        loading.value = false;
    }
};

// 初始加载
onMounted(() => {
    fetchData();
});

// 监听路由变化，更新搜索结果
watch(
    () => route.query,
    (newQuery) => {
        searchWd.value = newQuery?.wd || '';
        fetchData();
    },
    { deep: true }
);

// 暴露scrollHandler方法，供布局调用
const scrollHandler = (e) => {
    // 滚动处理逻辑
    // console.log('Search页面滚动处理');
};

// 将方法暴露给父组件
defineExpose({
    scrollHandler
});
</script>

<style scoped lang="less">
.search-container {
    padding: 20px;

    .mobile-search-header {
        margin-bottom: 20px;

        .search-cancel-btn {
            cursor: pointer;
            margin-left: 10px;
            color: #f596aa;
            font-size: 16px;
            transition: color 0.3s;

            &:hover {
                color: darken(#f596aa, 10%);
            }
        }
    }

    .search-result-area {
        .search-container-top {
            font-size: 18px;
            font-weight: bold;
            color: var(--color-text);
            margin-bottom: 16px;

            .theme-color {
                color: var(--color-primary);
            }
        }

        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
        }
    }
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    width: 100%;
    margin: 0 auto;

    .empty-text {
        text-align: center;

        .main-text {
            font-size: 16px;
            color: var(--color-text-1);
            margin-bottom: 8px;
        }

        .sub-text {
            font-size: 14px;
            color: var(--color-text-3);
        }
    }
}

.search-container-content {
    width: 100%;
    margin-top: 20px;
}

.content-video {
    // 间隔变量为16px
    @gap: 16px;
    width: 100%;
    height: 163px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 40px;
    position: relative;
    padding: 0 10px 10px 150px;
    float: left;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    // 屏幕大于等于1000,小于1300px width为50%
    @media (min-width: 1000px) and (max-width: 1300px) {
        width: calc((100% - @gap)/2);
        margin-right: @gap;

        // 2的倍数，margin-right为0
        &:nth-child(2n+2) {
            margin-right: 0;
        }
    }

    // 屏幕大于等于1300，width为33.33%
    @media (min-width: 1300px) and (max-width: 1800px) {
        width: calc((100% - (2 * @gap))/3);
        margin-right: @gap;

        &:nth-child(3n+3) {
            margin-right: 0;
        }
    }

    // 屏幕大于等于1800，width为25%
    @media (min-width: 1800px) {
        width: calc((100% - 3 * @gap)/4);
        margin-right: @gap;

        // 4的倍数，margin-right为0
        &:nth-child(4n+4) {
            margin-right: 0;
        }
    }

    .content-video-bg {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: calc(100% - 20px);
        height: 30px;
        background: rgb(243, 245, 247);
        border-radius: 8px;
        z-index: 3;
    }

    .content-video-info {
        padding-left: 150px;
        position: absolute;
        top: 10px;
        z-index: 6;
        right: 0;
        width: 100%;
        padding-right: 10px;

        .info-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
            cursor: pointer;
            color: #666666;

            &:hover {
                color: var(--color-primary);
            }
        }

        .info-type {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;

            .divider-line {
                display: inline-block;
                margin: 0 4px;
                color: #999;
            }
        }

        .info-actions {
            position: absolute;
            bottom: -40px;
            left: 160px;
            z-index: 5;
            display: flex;

            .btn-actions {
                margin-right: 10px;

                .play-btn, .detail-btn {
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .play-btn {
                    background-color: var(--color-primary);
                    color: #fff;
                }

                .detail-btn {
                    border: 1px solid var(--color-primary);
                    color: var(--color-primary);
                }
            }
        }
    }

    .content-video-img {
        width: 130px;
        height: 143px;
        position: absolute;
        left: 10px;
        bottom: 20px;
        z-index: 4;
        cursor: pointer;
        overflow: hidden;
        border-radius: 8px;

        &:hover {
            .video-img {
                transform: scale(1.05);
            }
        }

        .video-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .video-img-text {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 21;
            background: linear-gradient(to bottom, transparent 0, rgba(0, 0, 0, 0.4) 100%);
            padding: 50px 5px 10px;
            pointer-events: none;
            color: #fff;
            font-weight: 600;
            font-size: 11px;
        }
    }

    .info-icon {
        position: absolute;
        top: 10px;
        left: 10px;
        background: var(--color-primary);
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 7;
    }
}

// 移动端样式适配
@media screen and (max-width: 768px) {
    .search-container {
        padding: 10px;

        .search-container-content {
            margin-top: 10px;
        }

        .content-video {
            height: auto;
            padding: 10px 10px 50px;

            .content-video-img {
                position: relative;
                width: 100%;
                height: 180px;
                left: 0;
                bottom: 0;
                margin-bottom: 10px;
            }

            .content-video-info {
                position: relative;
                padding-left: 0;
                top: 0;

                .info-actions {
                    position: relative;
                    left: 0;
                    bottom: 0;
                    margin-top: 10px;
                }
            }

            .content-video-bg {
                display: none;
            }
        }
    }
}
</style>
