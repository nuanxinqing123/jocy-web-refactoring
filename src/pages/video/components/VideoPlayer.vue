<template>
  <div class="video-player">
    <ArtPlayer
      v-if="playerUrl"
      :video-id="videoId"
      :part="part"
      :play-type="playType"
      :url="playerUrl"
      @next-play="handleNextPlay"
    />
    <div v-else class="loading-container">
      <a-spin :size="40" tip="加载中..." />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVideoPlayAPI, postPlayResourcesAPI } from "@/api/video";
import ArtPlayer from '@/components/art-player/index.vue';

const props = defineProps({
  videoId: {
    type: String,
    required: true
  },
  part: {
    type: String,
    required: true
  },
  playType: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['next-play']);
const route = useRoute();
const router = useRouter();
const playerUrl = ref('');

// 获取视频播放地址
const getVideoUrl = async () => {
  try {
    // 重置播放地址
    playerUrl.value = '';

    // 获取播放地址
    const res = await getVideoPlayAPI({
      id: props.videoId,
      play: props.playType,
      part: props.part,
    });

    // 处理播放类型
    let url;
    if (res.data.type === "multi") {
      url = res.data.url.multi[0].url;
    } else {
      url = res.data.url.single;
    }

    // 处理m3u8格式
    if (url.toString().includes(".m3u8")) {
      // 判断URL地址是否为HTTPS
      if (url.toString().includes("https://")) {
        playerUrl.value = url;
      } else {
        // 需要转换非https的m3u8
        const m3u8Res = await postPlayResourcesAPI(url);
        // string转换为m3u8文件
        const blob = new Blob([m3u8Res.data]);
        // 创建虚拟URL
        playerUrl.value = URL.createObjectURL(blob);
      }
    } else {
      // 直接使用非m3u8地址
      playerUrl.value = url;
    }
  } catch (error) {
    console.error('获取视频播放地址失败:', error);
  }
};

// 处理下一集播放
const handleNextPlay = (isEnded) => {
  // 播放结束后自动切换下一集的逻辑
  if (isEnded) {
    emit('next-play');
  }
};

// 监听播放参数变化
watch(
  [() => props.videoId, () => props.part, () => props.playType],
  () => {
    if (props.videoId && props.part && props.playType) {
      getVideoUrl();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.videoId && props.part && props.playType) {
    getVideoUrl();
  }
});
</script>

<style lang="less" scoped>
.video-player {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .loading-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }
}
</style>
