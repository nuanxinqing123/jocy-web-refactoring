<template>
    <div class="episodes-container">
        <div class="episodes-header">
            <div class="header-title">
                <h3>选集播放</h3>
                <span class="sort-text" @click="toggleSort">
                    <icon-sort :style="{ transform: isDesc ? 'rotate(180deg)' : 'none' }" />
                    {{ isDesc ? '倒序' : '正序' }}
                </span>
            </div>
            <div class="episodes-tabs">
                <a-tabs v-model:active-key="activeTab">
                    <a-tab-pane v-for="(item, index) in parts" :key="index + ''" :title="`${item.play_zh}`">
                        <div class="episodes-list">
                            <a-button v-for="part in getSortedParts(item.part)" :key="part"
                                :type="isCurrentEpisode(part, item.play) ? 'primary' : 'outline'" size="small"
                                @click="handleEpisodeClick(part, item.play)">
                                {{ part }}
                            </a-button>
                        </div>
                    </a-tab-pane>
                </a-tabs>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IconSort } from '@arco-design/web-vue/es/icon';

const props = defineProps({
    vid: {
        type: String,
        default: ''
    },
    parts: {
        type: Array,
        default: () => []
    },
    history: {
        type: Object,
        default: null
    }
});

const router = useRouter();

// 剧集相关
const activeTab = ref('0');
const currentEpisode = ref('');
const currentPlayer = ref('');
const isDesc = ref(false);

// 切换排序方式
const toggleSort = () => {
    isDesc.value = !isDesc.value;
};

// 获取排序后的剧集列表
const getSortedParts = (parts) => {
    if (!parts) return [];
    const sortedParts = [...parts].sort((a, b) => {
        return Number(a) - Number(b);
    });
    return isDesc.value ? sortedParts.reverse() : sortedParts;
};

// 判断是否为当前选中的剧集
const isCurrentEpisode = (episode, play) => {
    // 从数据看，episode可能是"第2集"这种格式的字符串
    // 确保字符串比较完全相等，不考虑数字部分
    return String(currentEpisode.value).trim() === String(episode).trim() &&
           String(currentPlayer.value).trim() === String(play).trim();
};

// 找到历史记录对应的标签页索引
const findTabIndexByPlayer = (player) => {
    if (!props.parts || !player) return '0';

    const index = props.parts.findIndex(item => item.play === player);
    return index >= 0 ? String(index) : '0';
};

// 初始化选中标签页和剧集
watch(() => [props.parts, props.history], ([newParts, newHistory]) => {
    try {
        // 确保 parts 存在且不为空
        if (!newParts || !Array.isArray(newParts) || newParts.length === 0) {
            return;
        }

        // 如果有历史记录，则根据历史记录设置选中的标签页和剧集
        if (newHistory && newHistory.player && newHistory.part) {
            // 设置当前播放器
            currentPlayer.value = newHistory.player;
            // 设置当前剧集 - 确保值完全匹配
            currentEpisode.value = newHistory.part;
            // 设置当前标签页
            activeTab.value = findTabIndexByPlayer(newHistory.player);
            return;
        }

        // 没有历史记录时，选中第一个标签页和剧集
        const firstTab = newParts[0];
        if (!firstTab || !firstTab.play_zh) {
            return;
        }

        // 确保 part 数组存在且不为空
        if (!Array.isArray(firstTab.part) || firstTab.part.length === 0) {
            return;
        }
        // 设置当前选中的线路和集数
        currentPlayer.value = firstTab.play;
        currentEpisode.value = firstTab.part[0];
    } catch (error) {
        console.error('初始化选集失败:', error);
    }
}, { immediate: true });

// 处理剧集点击
const handleEpisodeClick = (episode, play) => {
    currentEpisode.value = episode;
    currentPlayer.value = play;
    // 处理播放逻辑
    if (props.vid) {
        router.push(`/video/${props.vid}?play=${play}&part=${episode}`);
    }
};
</script>

<style scoped lang="less">
.episodes-container {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-top: 16px;

    :deep(.arco-tabs-nav-ink) {
        background: linear-gradient(90deg, rgb(244, 167, 185), rgb(245, 150, 170));
    }

    .episodes-header {
        .header-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;

            h3 {
                font-size: 18px;
                font-weight: bold;
                margin: 0;
                color: var(--color-text-1);
            }

            .sort-text {
                display: flex;
                align-items: center;
                gap: 4px;
                color: var(--color-text-2);
                font-size: 14px;
                cursor: pointer;
                user-select: none;

                :deep(.arco-icon) {
                    transition: transform 0.3s ease;
                }

                &:hover {
                    color: var(--color-text-1);
                }
            }
        }

        :deep(.arco-tabs) {
            .arco-tabs-nav {
                &::before {
                    display: none;
                }

                .arco-tabs-nav-tab {
                    border-bottom: 1px solid var(--color-neutral-3);
                }

                .arco-tabs-tab {
                    padding: 6px 12px;
                    background: transparent;
                    border-radius: 0;
                    margin-right: 24px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    color: var(--color-text-2);

                    &:hover {
                        color: var(--color-text-1);
                    }

                    &.arco-tabs-tab-active {
                        color: var(--color-primary);
                    }
                }

                .arco-tabs-tab-title {
                    position: relative;

                    &::after {
                        content: '';
                        position: absolute;
                        bottom: -7px;
                        left: 0;
                        width: 100%;
                        height: 2px;
                        background-color: var(--color-primary);
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                }

                .arco-tabs-tab-active .arco-tabs-tab-title::after {
                    opacity: 1;
                }
            }
        }
    }

    .episodes-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 16px 0;

        :deep(.arco-btn) {
            min-width: 60px;
            height: 32px;
            border-radius: 4px;
            font-size: 13px;
            padding: 0 12px;
            background: rgb(246, 246, 246);
            border: none;
            color: var(--color-text-1);

            &:hover {
                background: rgb(236, 236, 236);
                color: var(--color-text-1);
            }

            &.arco-btn-primary {
                background: var(--color-primary-light-1);
                color: var(--color-primary);

                &:hover {
                    background: var(--color-primary-light-2);
                }
            }
        }
    }

    // 移动端适配
    @media screen and (max-width: 768px) {
        padding: 16px;
        margin-top: 12px;

        .episodes-list {
            gap: 8px;
            padding: 12px 0;

            :deep(.arco-btn) {
                min-width: 50px;
                height: 28px;
                font-size: 12px;
                padding: 0 8px;
            }
        }

        .episodes-header {
            :deep(.arco-tabs) {
                .arco-tabs-nav {
                    .arco-tabs-tab {
                        margin-right: 16px;
                        padding: 4px 8px;
                    }
                }
            }
        }
    }

    :deep(.arco-btn.arco-btn-primary) {
        background: linear-gradient(90deg, rgb(244, 167, 185), rgb(245, 150, 170)) !important;
        color: #fff !important;
    }
}
</style>
