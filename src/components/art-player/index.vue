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
import Hls from 'hls.js';

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
let lastLoadTime = 0;
let loadingDanmuku = false;
let loadedTimeRanges = [];
// 创建一个临时的弹幕ID集合，用于去重
let loadedDanmuIds = new Set();

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
                    // 检查弹幕ID是否已经加载过，如果加载过则跳过
                    if (loadedDanmuIds.has(item.id)) {
                        return null;
                    }
                    
                    let contentObj;
                    try {
                        // 尝试解析JSON内容
                        contentObj = JSON.parse(item.content);
                    } catch (parseError) {
                        // JSON解析失败，使用默认值
                        console.warn('弹幕内容JSON解析失败:', parseError);
                        contentObj = { content: item.content, color: 4294967295 }; // 默认白色
                    }

                    // 将弹幕ID添加到已加载列表
                    if (item.id) {
                        loadedDanmuIds.add(item.id);
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
            }).filter(item => item !== null); // 过滤掉处理失败的项和已加载的项
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

// 播放m3u8
function playM3u8(video, url, art) {
    if (Hls.isSupported()) {
        if (art.hls) art.hls.destroy();
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        art.hls = hls;
        art.on('destroy', () => hls.destroy());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
    } else {
        art.notice.show = 'Unsupported playback format: m3u8';
    }
}

// 加载弹幕函数
const loadDanmuku = async (startTime, endTime) => {
    try {
        // 避免小于0的时间
        startTime = Math.max(0, startTime);

        // 将时间转换为毫秒
        const start = Math.floor(startTime * 1000);
        const end = Math.floor(endTime * 1000);

        // 检查此时间段是否已加载过
        const alreadyLoaded = loadedTimeRanges.some(range =>
            (start >= range.start && start <= range.end) &&
            (end >= range.start && end <= range.end)
        );

        // 如果已经在加载或者这个时间段已经加载过，则跳过
        if (loadingDanmuku || alreadyLoaded) return;

        loadingDanmuku = true;

        // 获取弹幕数据
        const danmuList = await getDanmuData(start, end);

        // 添加弹幕到播放器[循环添加]
        if (art && art.plugins.artplayerPluginDanmuku) {
            danmuList.forEach(danmu => {
                art.plugins.artplayerPluginDanmuku.emit(danmu);
            });
        }

        // 记录已加载的时间范围
        loadedTimeRanges.push({ start, end });

        // 只保留最近10个时间范围记录，避免数组过长
        if (loadedTimeRanges.length > 10) {
            loadedTimeRanges.shift();
        }

        loadingDanmuku = false;
    } catch (error) {
        console.error('加载弹幕失败:', error);
        loadingDanmuku = false;
    }
};

// 重置弹幕加载机制
const resetDanmuku = () => {
    if (!art) return;

    // 清空已加载的时间范围记录
    loadedTimeRanges = [];
    
    // 清空已加载的弹幕ID集合
    loadedDanmuIds.clear();

    // 加载初始弹幕
    loadDanmuku(0, 60);

    // 移除旧的事件监听
    art.off('timeupdate');
    art.off('seeked');

    // 重置时间点
    lastLoadTime = 0;

    // 添加新的timeupdate事件
    art.on('timeupdate', () => {
        const currentTime = art.currentTime;
        // 每隔20秒加载一次弹幕
        if (currentTime - lastLoadTime >= 20) {
            loadDanmuku(currentTime, currentTime + 60);
            lastLoadTime = currentTime;
        }
    });

    // 添加seeked事件处理，用户拖动进度条后触发
    art.on('seeked', () => {
        const currentTime = art.currentTime;
        // 判断跳转距离
        const timeDiff = Math.abs(currentTime - lastLoadTime);

        // 如果跳转距离超过60秒，清空已加载记录，以便重新加载
        if (timeDiff > 60) {
            loadedTimeRanges = [];
        }

        // 拖动后立即加载当前位置的弹幕
        loadDanmuku(currentTime, currentTime + 60);
        lastLoadTime = currentTime;
    });
};

// 初始化播放器
const initPlayer = () => {
    // 销毁旧的播放器实例
    if (art) {
        art.destroy();
        art = null;
    }
    
    // 重置弹幕ID集合
    loadedDanmuIds = new Set();

    // 检测是否为移动端设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 获取播放历史时间点
    const startTime = getPlayTime();

    // 初始化弹幕插件
    const danmukuPlugin = artplayerPluginDanmuku({
        // 弹幕配置
        name: 'artplayerPluginDanmuku', // 确保插件名称正确
        danmuku: function () {
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
        synchronousPlayback: true, // 同步播放
        filter: function (danmu) {
            return danmu.text.length < 50; // 过滤超长弹幕
        }
    });

    // 播放器配置
    const options = {
        container: artPlayerRef.value,
        url: props.url,
        volume: 0.7,
        autoSize: true,
        autoplay: false,
        pip: !isMobile,
        autoMini: !isMobile,
        fastForward: isMobile,
        lock: isMobile,
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
        customType: {
            m3u8: playM3u8,
        },
        plugins: [danmukuPlugin],
        // quality: []   todo 清晰度/质量切换
    };

    // 判断URL中是否包含m3u8
    if (props.url.includes('.m3u8')) {
        options.type = 'm3u8';
    }

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

    // 重置弹幕加载机制
    resetDanmuku();

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

        // 播放时检查当前位置的弹幕是否需要加载
        const currentTime = art.currentTime;
        if (currentTime - lastLoadTime >= 10) {
            loadDanmuku(currentTime, currentTime + 60);
            lastLoadTime = currentTime;
        }
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

    // 监听播放速率变化
    art.on('playbackRate', () => {
        const currentTime = art.currentTime;
        loadDanmuku(currentTime, currentTime + 60);
        lastLoadTime = currentTime;
    });

    // 监听视频跳转
    art.on('seek', () => {
        const currentTime = art.currentTime;
        if (Math.abs(currentTime - lastLoadTime) > 5) {
            loadDanmuku(currentTime, currentTime + 60);
            lastLoadTime = currentTime;
        }
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

        // --------------------- 弹幕自动续拉核心逻辑 ----------------------
        // 检查当前播放时间与已加载弹幕区间的最大end的距离
        if (loadedTimeRanges.length > 0) {
            // 找到已加载弹幕区间的最大end
            const maxEnd = Math.max(...loadedTimeRanges.map(r => r.end));
            // 当前播放时间（毫秒）与最大end的距离
            const remain = maxEnd / 1000 - currentTime;
            // 如果距离小于10秒，则自动加载后续60秒弹幕
            if (remain < 10 && !loadingDanmuku) {
                // 加载后续弹幕
                loadDanmuku(maxEnd / 1000, maxEnd / 1000 + 60);
                lastLoadTime = maxEnd / 1000;
            }
        }
        // -----------------------------------------------------------------
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

        // 重置弹幕加载机制
        resetDanmuku();
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
