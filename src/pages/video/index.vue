<template>
    <div class="video-page" v-if="detail">
        <div class="main-content">
            <div class="video-container">
                <VideoPlayer
                    v-if="isPlayerReady"
                    :video-id="route.params.id.toString()"
                    :part="currentEpisode"
                    :play-type="currentPlayType"
                    @next-play="handleNextEpisode"
                />
                <div v-else class="player-placeholder">
                    <a-result status="info" title="播放器加载中" subtitle="请稍后...">
                        <template #extra>
                            <a-spin :size="50" />
                        </template>
                    </a-result>
                </div>
            </div>
            <!-- 移动端侧边栏容器，只在移动端显示 -->
            <div class="mobile-sidebar-container" v-if="isMobile">
                <!-- 侧边栏标题和折叠按钮 -->
                <div class="sidebar-header">
                    <h3>剧集选择</h3>
                    <button class="collapse-btn" @click="isMobileSidebarCollapsed = !isMobileSidebarCollapsed">
                        {{ isMobileSidebarCollapsed ? '展开' : '收起' }}
                        <icon-up v-if="!isMobileSidebarCollapsed" />
                        <icon-down v-else />
                    </button>
                </div>
                <!-- 侧边栏内容，根据折叠状态显示或隐藏 -->
                <div class="sidebar-content" :class="{ 'collapsed': isMobileSidebarCollapsed }">
                    <VideoSidebar
                        v-if="detail"
                        :title="detail.name"
                        :year="detail.year"
                        :region="detail.area"
                        :type="detail.type"
                        :parts="detail.parts"
                        :current-episode="currentEpisode"
                        :current-play-type="currentPlayType"
                        :content="detail.content"
                        @episode-change="handleEpisodeChange"
                    />
                </div>
            </div>
            <!-- 评论区 -->
            <CommentList v-if="detail" :vid="route.params.id.toString()" />
        </div>
        <div class="side-content" v-if="!isMobile">
            <div class="sidebar-container">
                <VideoSidebar
                    v-if="detail"
                    :title="detail.name"
                    :year="detail.year"
                    :region="detail.area"
                    :type="detail.type"
                    :parts="detail.parts"
                    :current-episode="currentEpisode"
                    :current-play-type="currentPlayType"
                    :content="detail.content"
                    @episode-change="handleEpisodeChange"
                />
            </div>
            <div class="related-container">
                <RelatedVideos
                    :channel="detail?.cid.toString()"
                    :limit="6"
                    :sort="`hits`"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { getVideoDetailAPI } from '@/api/video';
import { useCommonStore } from '@/stores/commonStore';
import { IconUp, IconDown } from '@arco-design/web-vue/es/icon';
import VideoPlayer from './components/VideoPlayer.vue';
import VideoSidebar from './components/VideoSidebar.vue';
import RelatedVideos from './components/RelatedVideos.vue';
import CommentList from './components/CommentList.vue';

const route = useRoute();
const router = useRouter();
const commonStore = useCommonStore();
const { isMobile } = storeToRefs(commonStore);

// 视频详情数据
const detail = ref(null);
const currentEpisode = ref('');
const currentPlayType = ref('');
const isPlayerReady = ref(false);
const isMobileSidebarCollapsed = ref(true);

// 获取视频详情
const getVideoDetail = async () => {
    try {
        const res = await getVideoDetailAPI({
            "id": route.params.id.toString()
        });

        if (res.data) {
            detail.value = res.data.data;
            // 设置SEO相关内容
            document.title = `正在播放【${detail.value?.name}】- Jocy动漫`;

            // 检查 URL 中是否存在 part 参数
            const urlPart = route.query.part;
            if (urlPart && detail.value?.parts.some(part => part.part && part.part.includes(urlPart.toString()))) {
                // 如果 URL 中的 part 参数有效，使用该参数
                currentEpisode.value = urlPart.toString();
                // 查找对应剧集的播放类型
                const episode = detail.value.parts.find(part => part.part && part.part.includes(urlPart.toString()));
                currentPlayType.value = episode?.play || '';
            } else if (detail.value?.parts && detail.value.parts.length > 0 && detail.value.parts[0].part?.length > 0) {
                // 如果没有有效的 URL 参数，使用第一个剧集
                currentEpisode.value = detail.value.parts[0].part[0];
                currentPlayType.value = detail.value.parts[0].play;
            } else {
                console.error('未找到有效的剧集信息');
            }

            // 确保两个参数都有值后，才设置播放器为就绪状态
            if (currentEpisode.value && currentPlayType.value) {
                isPlayerReady.value = true;
            }
        } else {
            // 处理数据不存在
            router.push('/404');
        }
    } catch (error) {
        console.error('获取视频详情失败:', error);
        router.push('/404');
    }
};

// 处理剧集切换
const handleEpisodeChange = (episode, playType) => {
    // 先将播放器设为未就绪状态
    isPlayerReady.value = false;

    // 设置新的剧集和播放类型
    currentEpisode.value = episode;
    currentPlayType.value = playType;

    // 更新URL参数但不刷新页面
    const query = { ...route.query, part: episode };
    router.push({ query });

    // 确保参数设置完成后，将播放器设为就绪状态
    if (currentEpisode.value && currentPlayType.value) {
        isPlayerReady.value = true;
    }
};

// 处理播放下一集
const handleNextEpisode = () => {
    if (!detail.value?.parts) return;

    // 查找当前播放线路
    const currentPart = detail.value.parts.find(part => part.play === currentPlayType.value);
    if (!currentPart?.part) return;

    // 查找当前剧集的索引
    const currentIndex = currentPart.part.findIndex(episode => episode === currentEpisode.value);
    if (currentIndex === -1 || currentIndex >= currentPart.part.length - 1) return;

    // 播放下一集
    handleEpisodeChange(currentPart.part[currentIndex + 1], currentPlayType.value);
};

// 监听路由参数变化
watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            getVideoDetail();
        }
    }
);

onMounted(() => {
    getVideoDetail();
});
</script>

<style scoped lang="less">
.video-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 20px;
    min-height: calc(100vh - 60px);

    @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: 10px;
    }

    .main-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .side-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .video-container {
        width: 100%;
        background-color: #000;
        border-radius: 12px;
        overflow: hidden;
        aspect-ratio: 16/9;
        transform: translateZ(0);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        will-change: transform;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

        .player-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;

            :deep(.arco-result) {
                background: transparent;

                .arco-result-title {
                    color: #fff;
                }

                .arco-result-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                }
            }
        }
    }

    .sidebar-container {
        width: 100%;
        height: fit-content;
        max-height: calc(100vh - 100px);
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
        }

        &::-webkit-scrollbar-track {
            background-color: transparent;
        }
    }

    // 移动端侧边栏
    .mobile-sidebar-container {
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
        overflow: hidden;

        .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;

            h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
            }

            .collapse-btn {
                background: none;
                border: none;
                color: var(--color-text-3);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 0;
                font-size: 14px;

                &:hover {
                    color: var(--color-text-1);
                }
            }
        }

        .sidebar-content {
            max-height: 300px;
            overflow-y: auto;
            transition: all 0.3s ease;

            &.collapsed {
                max-height: 0;
            }
        }
    }
}
</style>
