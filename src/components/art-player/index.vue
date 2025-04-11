<template>
  <div ref="artPlayerRef" class="art-player-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Artplayer from 'artplayer';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import { postHistoryAPI } from '@/api/video';
import { getDanmuAPI } from '@/api/video';
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

const emit = defineEmits(['next-play']);
const artPlayerRef = ref(null);
const commonStore = useCommonStore();
let art = null;
let secondCounter = ref(0);
let currentPlayTime = ref(0);
let timeInterval = null;

// 获取弹幕数据
const getDanmuData = async (startTime, endTime) => {
  try {
    const params = {
      vid: props.videoId,
      play: 'mp4', // 固定为mp4
      part: props.part,
      start_time_point: startTime,
      end_time_point: endTime,
      limit: 100,
      page: 1
    };

    const res = await getDanmuAPI(params);
    if (res.data) {
      // 处理弹幕数据
      return res.data.data.items.map(item => {
        try {
          let contentObj;
          try {
            // 尝试解析JSON内容
            contentObj = JSON.parse(item.content);
          } catch (parseError) {
            // JSON解析失败，使用默认值
            console.warn('弹幕内容JSON解析失败:', parseError);
            contentObj = { content: item.content, color: 4294967295 }; // 默认白色
          }

          // 转换弹幕格式为artplayer-plugin-danmuku需要的格式
          return {
            text: contentObj.content || '弹幕内容',
            time: (item.time_point || 0) / 1000, // 转换为秒
            color: formatColor(contentObj.color || 4294967295), // 转换颜色格式，默认白色
            border: false,
            mode: 0, // 0-滚动弹幕 1-顶部弹幕 2-底部弹幕
          };
        } catch (itemError) {
          console.error('处理弹幕项目失败:', itemError);
          return null;
        }
      }).filter(item => item !== null); // 过滤掉处理失败的项
    }
    return [];
  } catch (error) {
    console.error('获取弹幕失败:', error);
    return [];
  }
};

// 格式化颜色值
const formatColor = (colorValue) => {
  // 将数字颜色值转换为16进制颜色字符串
  return '#' + (colorValue & 0xFFFFFF).toString(16).padStart(6, '0');
};

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

  // 初始化弹幕插件
  const danmukuPlugin = artplayerPluginDanmuku({
    // 弹幕配置
    name: 'artplayerPluginDanmuku', // 确保插件名称正确
    danmuku: function() {
      // 默认返回空数组，初始不加载弹幕
      return [];
    },
    speed: 7, // 弹幕速度
    opacity: 0.9, // 弹幕透明度
    fontSize: 25, // 弹幕字体大小
    color: '#FFFFFF', // 默认颜色
    mode: 0, // 默认模式：滚动
    margin: [10, '25%'], // 弹幕上下边距
    antiOverlap: true, // 防重叠
    useWorker: true, // 使用 web worker
    synchronousPlayback: false, // 同步播放
    filter: function(danmu) {
      return danmu.text.length < 50; // 过滤超长弹幕
    }
  });

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
    miniProgressBar: true,
    airplay: true,
    playsInline: true,
    lang: 'zh-cn',
    setting: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: false,
    hotkey: true,
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
      loading: '<img src="https://artplayer.org/assets/img/ploading.gif" alt="loading">',
      state: '<img width="150" height="150" src="https://artplayer.org/assets/img/state.svg" alt="state">',
    },
    customType: {},
    plugins: [danmukuPlugin],
  };

  // 增加设置菜单项 - 弹幕控制
  options.settings = [
    {
      html: '弹幕',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 2h-11c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5.5 6c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1zm4 2c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1zm-9 6h11c1.1 0 2 .9 2 2v2h-15v-2c0-1.1.9-2 2-2z"/></svg>',
      tooltip: '弹幕开关',
      switch: true,
      default: true
    }
  ];

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

    // 初始加载弹幕
    loadDanmuku(0, 60);
  });

  // 动态加载弹幕
  let lastLoadTime = 0;
  art.on('timeupdate', () => {
    const currentTime = art.currentTime;
    // 每隔30秒加载一次弹幕
    if (currentTime - lastLoadTime >= 30) {
      loadDanmuku(currentTime, currentTime + 60);
      lastLoadTime = currentTime;
    }
  });

  // 加载弹幕函数
  const loadDanmuku = async (startTime, endTime) => {
    try {
      // 将时间转换为毫秒
      const start = Math.floor(startTime * 1000);
      const end = Math.floor(endTime * 1000);

      // 获取弹幕数据
      const danmuList = await getDanmuData(start, end);

      // 添加弹幕到播放器[循环添加]
      danmuList.forEach(danmu => {
        art.plugins.artplayerPluginDanmuku.emit(danmu);
      });
    } catch (error) {
      console.error('加载弹幕失败:', error);
    }
  };

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
    emit('next-play', true);
  });

  // 监听错误
  art.on('error', (error) => {
    console.error('播放器错误:', error);
  });
};

// 获取播放记录时间
const getPlayTime = () => {
  try {
    const historyList = commonStore.historyList || [];
    const currentHistory = historyList.find(
      (item) =>
        Number(item.vid) === Number(props.videoId) &&
        item.part === props.part
    );
    return currentHistory ? (currentHistory.time_point || 0) : 0;
  } catch (error) {
    console.error('获取播放历史时间失败:', error);
    return 0;
  }
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

    commonStore.updateHistoryList(historyList);
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
}
</style>
