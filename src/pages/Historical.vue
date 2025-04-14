<template>
    <div class="historical-container">
        <h1 class="page-title">共有{{ pagination.total }}部影片，观看记录</h1>
        <div class="content-box">
            <div v-if="loading" class="loading-container flex align-items">
                <a-spin :size="30" />
            </div>
            <div v-else-if="historyList.length === 0" class="empty-container flex align-items flex-column">
                <a-empty description="暂无观看记录" />
                <a-button type="primary" class="flash-view theme-button-bg" style="margin-top: 20px" @click="$router.push('/')">
                    去首页浏览
                </a-button>
            </div>
            <div class="history-grid" v-else>
                <div class="history-item" v-for="item in historyList" :key="item.id">
                    <div class="video-card">
                        <div class="video-cover">
                            <router-link :to="`/detail/${item.vid}`">
                                <img :src="handleImage(item.pic)" :alt="item.name">
                            </router-link>
                            <div class="watched-badge">
                                观看至{{item.part}}
                            </div>
                        </div>
                        <div class="video-info">
                            <h3 class="video-title">{{ item.name }}</h3>
                            <p class="video-update">{{ formatUpdateInfo(item) }}</p>
                            <p class="video-progress">{{ item.part }}已播放{{ formatTime(item.time_point) }}</p>
                        </div>
                        <div class="video-actions">
                            <button class="action-btn play-btn" @click="continuePlay(item)">
                                <icon-play-circle /> 播放
                            </button>
                            <button class="action-btn detail-btn" @click="$router.push(`/detail/${item.vid}`)">
                                详情
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-container" v-if="historyList.length > 0">
                <a-pagination
                    v-model:current="pagination.currentPage"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    :show-total="!isMobile"
                    :show-jumper="!isMobile"
                    :size="isMobile ? 'small' : 'medium'"
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
import { getHistoryList } from '@/api/video';
import { handleImage } from '@/utils/image';
import { useCommonStore } from '@/stores/commonStore';
import {globalConfig} from '@/utils/global-config';
import { IconPlayCircle, IconHistory } from '@arco-design/web-vue/es/icon';

const router = useRouter();
const commonStore = useCommonStore();
const isMobile = computed(() => commonStore.isMobile);

// 历史记录列表数据
const historyList = ref([]);
const loading = ref(true);

// 分页数据
const pagination = ref({
    currentPage: 1,
    pageSize: 24,
    total: 0
});

// 获取历史记录列表数据
const fetchHistoryList = async () => {
    loading.value = true;
    try {
        const res = await getHistoryList({
            page: pagination.value.currentPage,
            limit: pagination.value.pageSize
        });
        
        if (res && res.data && res.data.code === 20000) {
            historyList.value = res.data.data.items;
            pagination.value.total = res.data.data.total;
        } else {
            Message.error('获取历史记录失败');
        }
    } catch (error) {
        console.error('获取历史记录错误:', error);
        Message.error('获取历史记录失败');
    } finally {
        loading.value = false;
    }
};

// 处理分页变化
const handlePageChange = (page) => {
    pagination.value.currentPage = page;
    fetchHistoryList();
};

// 继续播放
const continuePlay = (item) => {
    router.push({
        path: `/video/${item.vid}`,
        query: { 
            part: item.part,
            time: item.time
        }
    });
};

// 格式化更新信息
const formatUpdateInfo = (item) => {
    if (!item.update_info) return '';
    
    // 这里根据实际数据格式进行调整
    return item.update_info;
};

// 格式化播放时间
const formatTime = (seconds) => {
    if (!seconds) return '0秒';

    seconds = seconds / 1000;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (minutes === 0) {
        return `${remainingSeconds}秒`;
    } else if (remainingSeconds === 0) {
        return `${minutes}分钟`;
    } else {
        return `${minutes}分${remainingSeconds}秒`;
    }
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
    document.title = `观看历史 - ${globalConfig.title}`;
    // 初始化加载历史记录列表
    fetchHistoryList();
});
</script>

<style scoped lang="less">
.historical-container {
    padding: 20px;
    padding-top: 0;
    
    @media screen and (max-width: 768px) {
        padding: 10px;
    }
    
    .page-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
        
        @media screen and (max-width: 768px) {
            font-size: 16px;
            margin-bottom: 15px;
            padding-bottom: 10px;
        }
    }
    
    .content-box {
        background-color: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        min-height: 300px;
        
        @media screen and (max-width: 768px) {
            padding: 15px;
            border-radius: 8px;
        }
        
        @media screen and (max-width: 480px) {
            padding: 10px;
        }
    }

    .loading-container, .empty-container {
        min-height: 300px;
    }

    .history-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 20px;
        
        @media screen and (max-width: 1200px) {
            grid-template-columns: repeat(4, 1fr);
        }
        
        @media screen and (max-width: 768px) {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
        
        @media screen and (max-width: 480px) {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }
    }

    .history-item {
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

            .watched-badge {
                position: absolute;
                top: 10px;
                left: 0;
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.6);
                color: #fff;
                font-size: 12px;
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                
                @media screen and (max-width: 480px) {
                    font-size: 10px;
                    padding: 3px 6px;
                }
            }
        }

        .video-info {
            padding: 10px;
            
            @media screen and (max-width: 480px) {
                padding: 8px;
            }

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
                
                @media screen and (max-width: 768px) {
                    font-size: 14px;
                }
                
                @media screen and (max-width: 480px) {
                    font-size: 12px;
                    margin-bottom: 3px;
                }
            }

            .video-update, .video-progress {
                font-size: 12px;
                color: #999;
                margin: 0 0 5px;
                line-height: 1.4;
                
                @media screen and (max-width: 480px) {
                    font-size: 10px;
                    margin-bottom: 3px;
                }
            }
            
            .video-progress {
                color: #f596aa;
            }
        }

        .video-actions {
            display: flex;
            padding: 0 10px 10px;
            flex-wrap: wrap;
            gap: 10px;
            
            @media screen and (max-width: 480px) {
                padding: 0 8px 8px;
                gap: 6px;
            }

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
                
                @media screen and (max-width: 768px) {
                    min-width: 60px;
                    height: 30px;
                    font-size: 12px;
                }
                
                @media screen and (max-width: 480px) {
                    min-width: 40px;
                    height: 26px;
                    font-size: 10px;
                    border-radius: 20px;
                }

                &.play-btn {
                    background: linear-gradient(135deg, #f596aa 0%, #f28b82 100%);
                    color: #fff;
                }

                &.detail-btn {
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
        
        @media screen and (max-width: 768px) {
            margin-top: 20px;
        }
    }
}
</style> 