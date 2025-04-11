<template>
  <div ref="artPlayerRef" class="art-player-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Artplayer from 'artplayer';
import { postHistoryAPI } from '@/api/video';
import { useCommonStore } from '@/stores/commonStore';

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
  },
  url: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['nextPlay']);
const artPlayerRef = ref(null);
const commonStore = useCommonStore();
let art = null;
let secondCounter = ref(0);
let currentPlayTime = ref(0);
let timeInterval = null;

// 初始化播放器
const initPlayer = () => {
  // 销毁旧的播放器实例
  if (art) {
    art.destroy();
    art = null;
  }
  
  // 检测是否为移动端设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 获取播放历史时间点
  const startTime = getPlayTime();
  
  // 播放器配置
  const options = {
    container: artPlayerRef.value,
    url: props.url,
    volume: 0.5,
    autoSize: true,
    autoplay: false,
    pip: !isMobile,
    autoOrientation: isMobile,
    fastForward: isMobile,
    fullscreen: true,
    fullscreenWeb: true,
    airplay: true,
    playsInline: true,
    lang: 'zh-cn',
    setting: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: true,
    hotkey: true,
    miniProgressBar: true,
    autoPlayback: true,
    mutex: true,
    theme: '#FF2F54',
    moreVideoAttr: {
      playsInline: true,
      preload: 'auto',
      x5VideoPlayerFullscreen: true,
      x5VideoOrientation: 'portrait',
      'webkit-playsinline': true
    },
    icons: {
      loading: '<img src="https://artplayer.org/assets/img/ploading.gif">',
      state: '<img width="150" heigth="150" src="https://artplayer.org/assets/img/state.svg">',
    },
    customType: {},
  };
  
  // 创建播放器实例
  art = new Artplayer(options);
  
  // 监听播放器事件
  art.on('ready', () => {
    if (startTime > 0) {
      art.seek = startTime;
    }
    
    // 记录播放历史初始点（0）
    postHistoryAPI({
      vid: Number(props.videoId),
      play: props.playType,
      part: props.part,
      time_point: 0
    }).catch(err => console.error('初始播放记录保存失败', err));
  });
  
  // 监听播放状态
  art.on('play', () => {
    startTimeTracking();
  });
  
  art.on('pause', () => {
    clearTimeTracking();
  });
  
  // 监听播放结束
  art.on('ended', () => {
    clearTimeTracking();
    // 通知父组件播放下一集
    emit('nextPlay', true);
  });
  
  // 监听错误
  art.on('error', (error) => {
    console.error('播放器错误:', error);
  });
};

// 获取播放记录时间
const getPlayTime = () => {
  const historyList = commonStore.historyList || [];
  const currentHistory = historyList.find(
    (item) => 
      Number(item.vid) === Number(props.videoId) &&
      item.part === props.part
  );
  return currentHistory ? (currentHistory.time_point || 0) : 0;
};

// 开始时间跟踪
const startTimeTracking = () => {
  clearTimeTracking(); // 确保不会有重复的定时器
  
  timeInterval = setInterval(() => {
    secondCounter.value += 1;
    if (!art) return;
    
    const currentTime = Math.floor(art.currentTime);
    const isFastForward = currentTime - currentPlayTime.value > 2;
    currentPlayTime.value = currentTime;
    
    // 更新本地历史记录
    updateLocalHistory(currentTime);
    
    // 每60秒或快进时保存到服务器
    if (secondCounter.value % 60 === 0 || isFastForward) {
      saveHistoryToServer(currentTime);
    }
  }, 1000);
};

// 清除时间跟踪
const clearTimeTracking = () => {
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  secondCounter.value = 0;
};

// 更新本地历史记录
const updateLocalHistory = (currentTime) => {
  try {
    const historyList = [...(commonStore.historyList || [])];
    const historyIndex = historyList.findIndex(
      (item) => 
        Number(item.vid) === Number(props.videoId) && 
        item.part === props.part
    );
    
    if (historyIndex !== -1) {
      historyList[historyIndex].time_point = currentTime;
    } else {
      historyList.push({
        vid: Number(props.videoId),
        play: props.playType,
        part: props.part,
        time_point: currentTime
      });
    }
    
    commonStore.setHistoryList(historyList);
  } catch (error) {
    console.error('更新本地历史记录失败', error);
  }
};

// 保存历史到服务器
const saveHistoryToServer = (currentTime) => {
  postHistoryAPI({
    vid: Number(props.videoId),
    play: props.playType,
    part: props.part,
    time_point: currentTime * 1000
  }).catch(err => console.error('播放记录保存失败', err));
};

// 监听props变化
watch([() => props.part, () => props.playType, () => props.url], () => {
  if (art && props.url) {
    art.switchUrl(props.url);
    clearTimeTracking();
  } else {
    initPlayer();
  }
});

onMounted(() => {
  if (props.url) {
    initPlayer();
  }
});

onBeforeUnmount(() => {
  clearTimeTracking();
  if (art) {
    art.destroy();
    art = null;
  }
});
</script>

<style scoped lang="less">
.art-player-container {
  width: 100%;
  height: 100%;
  background-color: #000;
}
</style> 