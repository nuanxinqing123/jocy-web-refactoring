<template>
    <div class="synopsis-container">
        <div class="synopsis-content">
            <!-- 标题部分 -->
            <div class="title">
                <h1>{{ detail?.name }}</h1>
                <div class="tags">
                    <a-tag class="tag-link" bordered>{{ detail?.year }}</a-tag>
                    <a-tag class="tag-link" bordered>{{ detail?.area }}</a-tag>
                    <a-tag class="tag-link" bordered>{{ detail?.type ? detail.type.replace(/,/g, ' / ') : '' }}</a-tag>
                </div>
            </div>
            <!-- 简介内容 -->
            <TextFold :text="detail?.content" :max-lines="2" />

            <!-- 详细信息 -->
            <div class="info">
                <div class="info-item">
                    <span class="label">导演:</span>
                    <span class="value">{{ detail?.director }}</span>
                </div>
                <div class="info-item">
                    <span class="label">主演:</span>
                    <span class="value">{{ detail?.actor ? detail.actor.replace(/,/g, ' / ') : '' }}</span>
                </div>
                <div class="info-item">
                    <span class="label">更新:</span>
                    <span class="value">{{ formatTime(detail?.end_at) }}</span>
                </div>
                <div class="info-item">
                    <span class="label">备注:</span>
                    <span class="value">{{ detail?.continu }}</span>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions">
                <a-button type="primary" class="play-btn flash-view theme-button-bg" @click="handlePlay">
                    <template #icon>
                        <icon-play-circle />
                    </template>
                    {{ hasHistory ? '继续播放' : '立即播放' }}
                </a-button>
                <a-button class="collect-btn flash-view theme-button-bg"
                    :class="{ 'is-collected': detail?.iscollect === 1 }"
                    @click="handleCollect">
                    <template v-if="detail?.iscollect !== 1" #icon>
                        <icon-star />
                    </template>
                    <template v-else #icon>
                        <icon-star-fill />
                    </template>
                    {{ detail?.iscollect === 1 ? '已收藏' : '收藏' }}
                </a-button>
            </div>
        </div>

        <!-- 封面图 -->
        <div class="cover">
            <img v-if="detail?.pic" :src="handleImage(detail.pic)" :alt="detail?.name">
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconPlayCircle, IconStar, IconStarFill } from '@arco-design/web-vue/es/icon';
import { addVideoCollect, deleteVideoCollect } from '@/api/video';
import TextFold from './TextFold.vue';
import { handleImage } from '@/utils/image';
import { useCommonStore } from '@/stores/commonStore';

const router = useRouter();
const commonStore = useCommonStore();

const props = defineProps({
    detail: {
        type: Object,
        default: () => ({})
    }
});

// 判断是否有观看历史
const hasHistory = computed(() => {
    return !!props.detail?.history;
});

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return '未知';

    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const handlePlay = () => {
    if (props.detail?.id) {
        // 如果有观看历史记录，使用历史记录中的播放线路和剧集
        if (hasHistory.value && props.detail.history) {
            const { player, part, time_point } = props.detail.history;
            // 跳转到上次观看的位置
            router.push(`/video/${props.detail.id}?play=${player}&part=${part}&t=${time_point}`);
            return;
        }

        // 如果没有历史记录，则使用第一个播放线路和剧集
        if (props.detail.parts && props.detail.parts.length > 0) {
            // 获取第一个播放线路
            const firstPlayType = props.detail.parts[0].play;
            // 获取该线路的第一个剧集
            const firstEpisode = props.detail.parts[0].part?.[0];

            if (firstEpisode) {
                // 跳转到视频播放页面
                router.push(`/video/${props.detail.id}?play=${firstPlayType}&part=${firstEpisode}`);
                return;
            }
        }
        // 如果没有剧集信息，则直接跳转到视频页面
        router.push(`/video/${props.detail.id}`);
    }
};

// 处理收藏
const handleCollect = async () => {
    try {
        if (!props.detail?.id) return;

        // 检查用户是否已登录
        if (!commonStore.token) {
            Message.info({
                content: '收藏功能需要登录后才能使用哦~',
                duration: 3000
            });
            // 打开登录弹窗
            commonStore.setIsShowLoginModal(true);
            return;
        }

        if (props.detail.iscollect === 1) {
            // 取消收藏
            await deleteVideoCollect({ vid: props.detail.id });
            props.detail.iscollect = 0;
            Message.success('已取消收藏');
        } else {
            // 添加收藏
            await addVideoCollect({ vid: props.detail.id });
            props.detail.iscollect = 1;
            Message.success('收藏成功');
        }
    } catch (error) {
        Message.error('操作失败，请稍后重试');
    }
};
</script>

<style scoped lang="less">
.synopsis-container {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    gap: 24px;

    .tag-link {
        background: #fff !important;
        height: 30px;
        margin-right: 6px;
        padding: 0 12px;
        font-size: 14px;
        border-radius: 8px;
    }

    // 移动端样式
    @media screen and (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        padding: 16px;
        gap: 16px;

        .synopsis-content {
            width: 100%;
            order: 2;

            .title {
                text-align: center;

                h1 {
                    font-size: 20px;
                }

                .tags {
                    justify-content: center;
                }
            }

            .actions {
                justify-content: center;
            }
        }

        .cover {
            order: 1;
            width: 160px;
            height: 224px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
    }

    .synopsis-content {
        flex: 1;
        min-width: 0; // 防止flex子元素溢出
    }

    .cover {
        width: 200px;
        height: 280px;
        flex-shrink: 0;
        border-radius: 8px;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;

            &:hover {
                transform: scale(1.05);
            }
        }
    }

    .title {
        margin-bottom: 16px;

        h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 12px;
            word-break: break-all;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            :deep(.arco-tag) {
                background: transparent;
                border-color: var(--color-neutral-3);
                color: var(--color-text-2);
                margin: 0;
            }
        }
    }

    .info {
        margin-bottom: 24px;

        .info-item {
            margin-bottom: 8px;
            display: flex;

            .label {
                color: var(--color-text-3);
                min-width: 42px;
                margin-right: 8px;
            }

            .value {
                color: var(--color-text-2);
                flex: 1;
                word-break: break-all;
            }
        }
    }

    .actions {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        .play-btn, .collect-btn {
            padding: 0 20px;
            height: 40px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            font-size: 15px;
            transition: all 0.3s ease;

            :deep(.arco-icon) {
                margin-right: 4px;
            }
        }

        .play-btn {
            background: linear-gradient(90deg, rgb(244, 167, 185), rgb(245, 150, 170));
            color: white;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(244, 167, 185, 0.4);
            }
        }

        .collect-btn {
            background: white;
            color: var(--color-text-2);
            border: 1px solid var(--color-neutral-3);

            &:hover {
                color: #f596aa;
                border-color: #f596aa;
                background: white;
            }

            &.is-collected {
                color: #f596aa;
                border-color: #f596aa;
                background: rgba(245, 150, 170, 0.1);
            }
        }
    }
}
</style>
