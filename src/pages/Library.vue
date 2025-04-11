<template>
    <div class="library-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
            <!-- 分类筛选 -->
            <div class="filter-item" v-for="(options, key) in filterData" :key="key">
                <div class="filter-label flex align-center">{{ filterLabels[key] }} <IconCaretRight
                        class="filter-label-text" /></div>
                <div class="filter-content">
                    <a-space :size="8" wrap>
                        <a-tag v-for="item in options" :key="item.value"
                            :class="{ active: filters[key] === item.value }" checkable
                            :checked="filters[key] === item.value" @click="handleFilterChange(key, item.value)">
                            {{ item.label }}
                        </a-tag>
                    </a-space>
                </div>
            </div>
        </div>

        <!-- 视频列表区域 -->
        <video-item 
            :channel="filters.channel.toString()" 
            :type="filters.type || ''" 
            :year="filters.year || ''" 
            :area="filters.area || '日本'" 
            :sort="filters.sort || 'addtime'" 
            :limit="18" 
            :page="1" 
            :enablePagination="true" 
            ref="videoItemRef"
        />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getChannelAPI } from '@/api/channel';
import { Message } from '@arco-design/web-vue';
import { globalConfig } from '@/utils/global-config';
import VideoItem from '@/components/video-item/index.vue';
import { IconCaretRight } from '@arco-design/web-vue/es/icon';

const route = useRoute();

// 筛选项标签
const filterLabels = {
    channel: '分类',
    type: '类型',
    year: '年份',
    area: '地区',
    sort: '排序'
};

// 筛选数据
const filterData = ref({
    channel: [],
    type: [],
    year: [],
    area: [],
    sort: []
});

// 选中的筛选值
const filters = ref({
    channel: 0,
    type: '',
    year: '',
    area: '',
    sort: ''
});

// 初始化数据
const channelData = ref();
const initFilterData = async () => {
    try {
        const res = await getChannelAPI();
        channelData.value = res.data;

        if (!channelData.value) {
            Message.warning(channelData.value.message);
            return;
        }

        if (channelData.value.data && channelData.value.data.length > 0) {
            // 处理频道数据
            filterData.value.channel = channelData.value.data.map(item => ({
                label: item.name,
                value: item.id
            }));

            // 处理类型数据（使用第一个频道的类型）
            filterData.value.type = [
                { label: '全部', value: '' },
                ...channelData.value.data[0].types.map(type => ({
                    label: type,
                    value: type
                }))
            ];

            // 处理年份数据（使用第一个频道的年份）
            filterData.value.year = [
                { label: '全部', value: '' },
                ...channelData.value.data[0].years.map(year => ({
                    label: year,
                    value: year
                }))
            ];

            // 处理地区数据
            filterData.value.area = channelData.value.data[0].areas.map(area => ({
                label: area,
                value: area
            }));

            // 处理排序数据
            filterData.value.sort = [
                { label: '最新上线', value: 'addtime' },
                { label: '最多播放', value: 'weight' },
                { label: '热门推荐', value: 'hits' },
                { label: '最多好评', value: 'gold' },
                { label: '综合推荐', value: '' },
            ];

            // 读取URL参数设置初始值
            const queryChannel = route.query.channel ? parseInt(route.query.channel) : null;
            const querySort = route.query.sort || '';
            
            // 设置默认值，优先使用URL参数
            filters.value.channel = queryChannel || channelData.value.data[0].id;
            filters.value.type = '';  // 默认选择全部
            filters.value.year = '';  // 默认选择全部
            
            // 根据当前选中的频道获取默认地区
            const selectedChannel = channelData.value.data.find(item => item.id === filters.value.channel);
            if (selectedChannel) {
                filters.value.area = selectedChannel.areas[0] || '';
            } else {
                filters.value.area = channelData.value.data[0].areas[0] || '';
            }
            
            // 排序方式，优先使用URL参数
            filters.value.sort = querySort || 'addtime';  // 默认选择最新上线
        }
    } catch (error) {
        console.error('Failed to fetch channel data:', error);
    }
};

// 监听频道变化，更新对应的类型、年份和地区选项
watch(() => filters.value.channel, (newChannelId) => {
    const selectedChannel = filterData.value.channel.find(c => c.value === newChannelId);
    if (selectedChannel) {
        const channel = channelData.value?.data.find(item => item.id === newChannelId);
        if (channel) {
            // 更新类型选项
            filterData.value.type = [
                { label: '全部', value: '' },
                ...channel.types.map(type => ({
                    label: type,
                    value: type
                }))
            ];
            // 更新年份选项
            filterData.value.year = [
                { label: '全部', value: '' },
                ...channel.years.map(year => ({
                    label: year,
                    value: year
                }))
            ];
            // 更新地区选项
            filterData.value.area = channel.areas.map(area => ({
                label: area,
                value: area
            }));
            // 重置类型、年份和地区的选择
            filters.value.type = '';
            filters.value.year = '';
            filters.value.area = channel.areas[0] || '';
        }
    }
}, { deep: true });

// 监听URL参数变化
watch(
    () => route.query,
    (query) => {
        if (query.channel) {
            const channelId = parseInt(query.channel);
            filters.value.channel = channelId;
        }
        if (query.sort) {
            filters.value.sort = query.sort;
        }
    },
    { immediate: true }
);

// 页面加载时初始化数据
onMounted(() => {
    document.title = `视频库 - ${globalConfig.title}`;
    initFilterData();
});

// 处理筛选项变化
const handleFilterChange = (key, value) => {
    filters.value[key] = value;
};

const videoItemRef = ref(null);

const scrollHandler = (e) => {
    videoItemRef.value?.scrollHandler(e);
};

defineExpose({
    scrollHandler
});
</script>

<style scoped lang="less">
.library-container {
    padding: 16px;

    .filter-section {
        background: #ffffff;
        border-radius: 4px;
        padding: 16px;
        border: 1px solid #e5e6eb;
        margin-bottom: 16px;

        .filter-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;

            &:last-child {
                margin-bottom: 0;
            }

            .filter-label {
                flex-shrink: 0;
                width: 50px;
                color: var(--color-text-2);
                font-size: 14px;
                line-height: 34px;

                .filter-label-text {
                    color: #c2c6d0;
                    font-size: 12px;
                    margin-left: 5px;
                }
            }

            .filter-content {
                flex: 1;

                :deep(.arco-tag) {
                    margin: 0;
                    cursor: pointer;
                    background: #ffffff;
                    border: 1px solid #e5e6eb;
                    color: var(--color-text-2);

                    &:hover {
                        color: #f596aa;
                        border-color: #f596aa;
                    }

                    &.active {
                        color: #f596aa;
                        background: #ffffff;
                        border-color: #f596aa;
                    }
                }

                :deep(.arco-space-item) {
                    margin-bottom: 8px;
                    margin-right: 0;

                    .arco-tag {
                        min-width: 52px;
                        height: 34px;
                        line-height: 32px;
                        text-align: center;
                        border-radius: 8px;
                        display: inline-block;

                        &.arco-tag-checked {
                            color: #f596aa;
                            background: #ffddd5;
                            font-weight: 700;
                            border: 1px solid #ffddd5;
                        }
                    }
                }
            }
        }
    }
}
</style> 