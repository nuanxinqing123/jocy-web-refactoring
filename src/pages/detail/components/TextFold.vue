<template>
    <div class="text-fold">
        <div class="text-content" ref="textRef" :class="{ 'expanded': isExpanded }">
            <p>{{ text }}</p>
        </div>
        <div v-if="showButton" class="text-fold-button" @click="toggleExpand">
            {{ isExpanded ? '收起' : '展开' }}
            <icon-up v-if="isExpanded" />
            <icon-down v-else />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { IconUp, IconDown } from '@arco-design/web-vue/es/icon';
import { storeToRefs } from 'pinia';
import { useCommonStore } from '@/stores/commonStore';

const props = defineProps({
    text: {
        type: String,
        default: ''
    },
    maxLines: {
        type: Number,
        default: 3
    }
});

const commonStore = useCommonStore();
const { isMobile } = storeToRefs(commonStore);

const textRef = ref(null);
const isExpanded = ref(!isMobile.value); // PC端默认展开，移动端默认收起
const showButton = ref(false);
const lineHeight = ref(22); // 默认行高

// 计算文本是否超出了最大行数限制
const checkOverflow = async () => {
    if (!textRef.value) return;

    // 等待DOM更新
    await nextTick();

    // 计算文本实际高度
    const element = textRef.value;
    const computedStyle = window.getComputedStyle(element);

    // 获取实际行高
    lineHeight.value = parseInt(computedStyle.lineHeight) || 22;

    // 计算最大高度
    const maxHeight = props.maxLines * lineHeight.value;

    // 检查是否需要显示展开/收起按钮
    const actualHeight = element.scrollHeight;

    // 如果实际高度大于最大高度，则需要显示按钮
    showButton.value = actualHeight > maxHeight;

    // 如果需要显示按钮，且未展开，则应用最大高度限制
    if (showButton.value && !isExpanded.value) {
        element.style.maxHeight = `${maxHeight}px`;
    } else {
        element.style.maxHeight = 'none';
    }
};

// 切换展开/收起状态
const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;

    if (isExpanded.value) {
        textRef.value.style.maxHeight = 'none';
    } else {
        textRef.value.style.maxHeight = `${props.maxLines * lineHeight.value}px`;
    }
};

// 监听文本变化
watch(() => props.text, () => {
    checkOverflow();
}, { immediate: false });

// 监听移动端状态变化
watch(() => isMobile.value, (newValue) => {
    // 仅当状态发生变化时处理
    if (newValue !== (isExpanded.value === false)) {
        isExpanded.value = !newValue;
        checkOverflow();
    }
});

// 初始化
onMounted(() => {
    checkOverflow();

    // 监听窗口大小变化，重新计算
    window.addEventListener('resize', checkOverflow);
});

// 清理事件监听
onUnmounted(() => {
    window.removeEventListener('resize', checkOverflow);
});
</script>

<style scoped lang="less">
.text-fold {
    margin-bottom: 16px;

    .text-content {
        overflow: hidden;
        position: relative;
        transition: max-height 0.3s ease;

        p {
            margin: 0;
            line-height: 1.6;
            color: var(--color-text-2);
            word-break: break-word;
        }

        &:not(.expanded)::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 24px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
        }
    }

    .text-fold-button {
        margin-top: 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--color-primary);
        cursor: pointer;
        user-select: none;
        font-size: 14px;

        &:hover {
            opacity: 0.8;
        }
    }
}
</style>
