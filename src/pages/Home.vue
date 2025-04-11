<template>
    <div class="home-container">
        <!-- 轮播图 -->
        <Carousel />

        <!-- 日漫推荐 -->
        <div class="video-section">
            <div class="section-header">
                <h2 class="section-title">推荐 · 日漫</h2>
                <router-link :to="{ path: '/library', query: { channel: '1', sort: 'addtime' } }" class="more-link">查看更多 <IconArrowRight /></router-link>
            </div>
            <VideoItem :channel="'1'" :sort="'weight'"/>
        </div>
        
        <!-- 国漫推荐 -->
        <div class="video-section">
            <div class="section-header">
                <h2 class="section-title">推荐 · 国漫</h2>
                <router-link :to="{ path: '/library', query: { channel: '2', sort: 'addtime' } }" class="more-link">查看更多 <IconArrowRight /></router-link>
            </div>
            <VideoItem :channel="'2'" :sort="'weight'"/>
        </div>
        
        <!-- 动漫电影推荐 -->
        <div class="video-section">
            <div class="section-header">
                <h2 class="section-title">推荐 · 动漫电影</h2>
                <router-link :to="{ path: '/library', query: { channel: '26', sort: 'addtime' } }" class="more-link">查看更多 <IconArrowRight /></router-link>
            </div>
            <VideoItem :channel="'26'" :sort="'weight'"/>
        </div>
        
        <!-- 其他动漫推荐 -->
        <div class="video-section">
            <div class="section-header">
                <h2 class="section-title">推荐 · 其他动漫</h2>
                <router-link :to="{ path: '/library', query: { channel: '3', sort: 'addtime' } }" class="more-link">查看更多 <IconArrowRight /></router-link>
            </div>
            <VideoItem :channel="'3'" :sort="'weight'"/>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Carousel from '@/components/carousel/index.vue';
import VideoItem from '@/components/video-item/index.vue';
import { useCommonStore } from '@/stores/commonStore';
import { IconArrowRight } from '@arco-design/web-vue/es/icon';

const commonStore = useCommonStore();

// 检测设备类型
onMounted(() => {
    commonStore.checkIsMobile();
});

// 滚动处理函数
const scrollHandler = (e) => {
    // 可以在这里处理滚动逻辑
    console.log('Home页面滚动处理');
};

// 将方法暴露给父组件
defineExpose({
    scrollHandler
});
</script>

<style scoped lang="less">
.home-container {
    padding: 16px;
    
    .video-section {
        margin-bottom: 20px;
        text-align: left;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: var(--color-text);
            position: relative;
            border-left: 4px solid #f596aa;
            padding-left: 10px;
            line-height: 1.2;
            text-align: left;
            display: flex;
            align-items: center;
            margin: 0;
        }

        .more-link {
            font-size: 14px;
            color: #999;
            text-decoration: none;
            display: flex;
            align-items: center;
            transition: color 0.3s;

            &:hover {
                color: #f596aa;
            }

            :deep(svg) {
                margin-left: 4px;
                font-size: 12px;
            }
        }
    }
}
</style> 