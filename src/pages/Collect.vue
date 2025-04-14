<template>
    <div class="collect-container">
        <h1 class="page-title">共收藏{{ pagination.total }}部影片</h1>
        <div class="content-box">
            <div v-if="loading" class="loading-container flex align-items">
                <a-spin :size="30" />
            </div>
            <div v-else-if="collectList.length === 0" class="empty-container flex align-items flex-column">
                <a-empty description="暂无收藏内容" />
                <a-button type="primary" class="flash-view theme-button-bg" style="margin-top: 20px" @click="$router.push('/')">
                    去首页浏览
                </a-button>
            </div>
            <div class="collect-grid" v-else>
                <div class="collect-item" v-for="item in collectList" :key="item.id">
                    <div class="video-card">
                        <div class="video-cover">
                            <router-link :to="`/detail/${item.vid}`">
                                <img :src="handleImage(item.pic)" :alt="item.name">
                            </router-link>
                            <div class="collected-badge">
                                <icon-heart-fill class="heart-icon" /> 已收藏
                            </div>
                        </div>
                        <div class="video-info">
                            <h3 class="video-title">{{ item.name }}</h3>
                            <p class="video-episode">{{ item.continu }}</p>
                        </div>
                        <div class="video-actions">
                            <button class="action-btn play-btn" @click="goToPlay(item.vid)">
                                <icon-play-circle /> 播放
                            </button>
                            <button class="action-btn cancel-btn" @click="cancelCollect(item)">
                                取消收藏
                            </button>
                            <button class="action-btn detail-btn" @click="$router.push(`/detail/${item.vid}`)">
                                详情
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-container" v-if="collectList.length > 0">
                <a-pagination
                    v-model:current="pagination.currentPage"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    show-total
                    show-jumper
                    @change="handlePageChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { getCollectList, delCollect } from '@/api/video';
import { handleImage } from '@/utils/image';
import { useCommonStore } from '@/stores/commonStore';
import {globalConfig} from '@/utils/global-config';
import { IconPlayCircle, IconDelete, IconHeartFill } from '@arco-design/web-vue/es/icon';

const router = useRouter();
const commonStore = useCommonStore();
const isMobile = computed(() => commonStore.isMobile);

// 收藏列表数据
const collectList = ref([]);
const loading = ref(true);

// 分页数据
const pagination = ref({
    currentPage: 1,
    pageSize: 24,
    total: 0
});

// 获取收藏列表数据
const fetchCollectList = async () => {
    loading.value = true;
    try {
        const res = await getCollectList({
            page: pagination.value.currentPage,
            limit: pagination.value.pageSize
        });
        
        if (res && res.data && res.data.code === 20000) {
            collectList.value = res.data.data.items;
            pagination.value.total = res.data.data.total;
        } else {
            Message.error('获取收藏列表失败');
        }
    } catch (error) {
        console.error('获取收藏列表错误:', error);
        Message.error('获取收藏列表失败');
    } finally {
        loading.value = false;
    }
};

// 处理分页变化
const handlePageChange = (page) => {
    pagination.value.currentPage = page;
    fetchCollectList();
};

// 取消收藏
const cancelCollect = async (item) => {
    try {
        await delCollect({ vid: item.vid });
        Message.success('取消收藏成功');
        // 刷新列表
        fetchCollectList();
    } catch (error) {
        console.error('取消收藏失败:', error);
        Message.error('取消收藏失败');
    }
};

// 跳转到播放页
const goToPlay = (vid) => {
    router.push(`/video/${vid}`);
};

// 暴露scrollHandler方法，供布局调用
const scrollHandler = (e) => {
    // 滚动到底部自动加载更多（如需要）
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight > scrollHeight - 100) {
        // 这里可以添加自动加载更多的逻辑
    }
};

// 将方法暴露给父组件
defineExpose({
    scrollHandler
});

onMounted(() => {
    document.title = `我的收藏 - ${globalConfig.title}`;
    // 初始化加载收藏列表
    fetchCollectList();
});
</script>

<style scoped lang="less">
.collect-container {
    padding: 20px;
    padding-top: 0;
    
    .page-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }
    
    .content-box {
        background-color: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        min-height: 300px;
    }

    .loading-container, .empty-container {
        min-height: 300px;
    }

    .collect-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 20px;
        
        @media screen and (max-width: 1200px) {
            grid-template-columns: repeat(4, 1fr);
        }
        
        @media screen and (max-width: 768px) {
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        
        @media screen and (max-width: 480px) {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
    }

    .collect-item {
        width: 100%;
        margin-bottom: 10px;
    }

    .video-card {
        width: 100%;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

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

            .collected-badge {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 6px 10px;
                background-color: rgba(0, 0, 0, 0.6);
                color: #fff;
                font-size: 12px;
                text-align: center;
                
                .heart-icon {
                    color: #f596aa;
                    margin-right: 4px;
                }
            }
        }

        .video-info {
            padding: 10px;

            .video-title {
                font-size: 16px;
                font-weight: 500;
                margin: 0 0 5px;
                color: #333;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                white-space: normal;
                word-break: break-all;
                text-overflow: ellipsis;
            }

            .video-episode {
                font-size: 12px;
                color: #999;
                margin: 0;
            }
        }

        .video-actions {
            display: flex;
            padding: 0 10px 10px;
            flex-wrap: wrap;
            gap: 10px;

            .action-btn {
                flex: 1;
                min-width: 80px;
                height: 32px;
                border-radius: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                border: none;
                outline: none;

                &.play-btn {
                    background: linear-gradient(135deg, #f596aa 0%, #f28b82 100%);
                    color: #fff;
                }

                &.cancel-btn, &.detail-btn {
                    border: 1px solid #f596aa;
                    color: #f596aa;
                    background-color: #fff;
                    
                    &:hover {
                        background-color: #fff4f5;
                    }
                }

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 2px 6px rgba(245, 150, 170, 0.2);
                }
            }
        }
    }

    .pagination-container {
        margin-top: 30px;
        display: flex;
        justify-content: center;
    }
}
</style> 