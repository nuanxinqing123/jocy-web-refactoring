<template>
    <div class="recommend-container">
        <div class="recommend-header">
            <h3>相关推荐</h3>
        </div>
        <div class="recommend-content">
            <VideoItem 
                :channel="validChannel" 
                :sort="'addtime'"
                :limit="12" 
                :enable-pagination="false"
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import VideoItem from '@/components/video-item/index.vue';

const props = defineProps({
    channel: {
        type: [String, Number],
        default: ''
    }
});

// 确保channel值有效
const validChannel = computed(() => {
    // 如果channel是undefined、null或空字符串，返回默认值'1'
    if (props.channel === undefined || props.channel === null || props.channel === '') {
        console.warn('Recommend组件: channel值无效，使用默认值"1"');
        return '1';
    }
    
    // 确保channel是字符串类型
    const channelStr = String(props.channel);
    
    // 检查是否是有效的数字或数字字符串
    const isValidChannel = /^\d+$/.test(channelStr) && parseInt(channelStr) > 0;
    
    // 如果转换后是'undefined'、'null'、'[object Object]'或非法值，返回默认值'1'
    if (channelStr === 'undefined' || channelStr === 'null' || channelStr === '[object Object]' || !isValidChannel) {
        console.warn(`Recommend组件: channel值异常 (${channelStr})，使用默认值"1"`);
        return '1';
    }
    
    // 返回有效的channel字符串
    return channelStr;
});
</script>

<style scoped lang="less">
.recommend-container {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-top: 16px;

    .recommend-header {
        h3 {
            font-size: 18px;
            font-weight: 500;
            margin: 0;
            padding-bottom: 16px;
        }
    }
}
</style> 