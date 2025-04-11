<template>
    <div v-if="detail">
        <Synopsis :detail="detail"/>
        <Option :parts="detail.parts" :vid="detail.id?.toString()" :history="detail.history"/>
        <Recommend :channel="detail.cid?.toString()"/>
    </div>
    <div v-else class="loading-container">
        <a-spin />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVideoDetailAPI } from '@/api/video';
import Synopsis from './components/Synopsis.vue';
import Option from './components/Option.vue';
import Recommend from './components/Recommend.vue';

const route = useRoute();
const router = useRouter();

// 获取数据
const detail = ref(null);
const loading = ref(true);

// 监视detail变化，检查关键数据
watch(() => detail.value, (newDetail) => {
    if (newDetail) {
        loading.value = false;
        console.log('视频详情数据:', {
            id: newDetail.id,
            cid: newDetail.cid,
            name: newDetail.name,
            historyExists: !!newDetail.history
        });
    }
}, { immediate: true });

const getVideoDetail = async () => {
    loading.value = true;
    try {
        const res = await getVideoDetailAPI({
            "id": route.params.id.toString()
        });

        if (res.data && res.data.data) {
            detail.value = res.data.data;

            // 检查cid是否存在且有效
            if (!detail.value.cid) {
                console.warn('视频详情中缺少cid字段:', detail.value);
            }

            // 设置SEO相关内容
            document.title = `【${detail.value?.name}】详情介绍_【${detail.value?.name}】在线观看 - Jocy动漫`;
        } else {
            // 处理数据不存在
            console.error('视频详情数据无效:', res);
            router.push('/404');
        }
    } catch (error) {
        console.error('获取视频详情失败:', error);
        router.push('/404');
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    getVideoDetail();
});
</script>

<style scoped lang="less">
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}
</style>
