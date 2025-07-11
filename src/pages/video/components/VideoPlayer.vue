<template>
  <div class="video-player">
    <ArtPlayer
      v-if="playerUrl"
      :video-id="videoId"
      :part="part"
      :play-type="playType"
      :url="playerUrl"
      :play-addr-list="playAddrList"
      @next-play="handleNextPlay"
    />
    <div v-else class="loading-container">
      <a-spin :size="40" tip="加载中..." />
    </div>
    
    <!-- H265不支持提示 -->
    <div v-if="!supportH265 && isH265Video" class="h265-unsupported-tip">
      <a-alert type="warning" title="当前浏览器不支持播放H265视频，请更换其他浏览器或播放设备。" show-icon />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
import { getVideoPlayParamsAPI, getVideoPlayAPI2 } from "@/api/video";
import ArtPlayer from '@/components/art-player/index.vue';
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
  }
});

const emit = defineEmits(['next-play']);
const route = useRoute();
const router = useRouter();
const playerUrl = ref('');
const playAddrList = ref([]); // 添加清晰度列表
const supportH265 = ref(false);
const isH265Video = ref(false);

// 检测浏览器是否支持H265
const checkH265Support = () => {
  let mseSupport = false;
  let elementSupport;
  
  // 检测MediaSource Extensions对HEVC的支持
  if (window.MediaSource) {
    try {
      mseSupport = MediaSource.isTypeSupported('video/mp4; codecs="hev1.1.6.L93.B0"') ||
                   MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L93.B0"');
    } catch (e) {
      mseSupport = false;
    }
  }
  
  // 使用视频元素检测
  const video = document.createElement('video');
  elementSupport = video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"') === 'probably' ||
                   video.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') === 'probably';
  
  // 两种方法都要通过才确认支持H265
  supportH265.value = mseSupport && elementSupport;
  
  console.log('浏览器H265支持状态:', supportH265.value, '(MSE支持:', mseSupport, ', 元素支持:', elementSupport, ')');
};

// 获取视频播放地址
const getVideoUrl = async () => {
  try {
    // 重置播放地址
    playerUrl.value = '';
    playAddrList.value = []; // 重置清晰度列表

    // 此处判断是否登录, 需要强制登录
    const commonStore = useCommonStore();
    if (!commonStore.isLogin) {
      commonStore.setIsShowLoginModal(true);
      return;
    }

    // 获取播放地址参数
    const res_params = await getVideoPlayParamsAPI({
      id: props.videoId,
      play: props.playType,
      part: props.part,
    });

    // 发送二次数据获取请求
    const res_result = await getVideoPlayAPI2(res_params.data.url, {
      "x-form": res_params.data["x-form"],
      "x-sign1": res_params.data["x-sign1"],
      "x-sign2": res_params.data["x-sign2"],
      "x-time": res_params.data["x-time"]
    })

    let res;
    
    // 尝试解密数据，如果解密失败则说明是明文数据
    try {
      const key = CryptoJS.enc.Utf8.parse(res_params.data["aes_key"])
      const iv = CryptoJS.enc.Utf8.parse(res_params.data["aes_iv"])
      
      const decrypted = CryptoJS.AES.decrypt(res_result.data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
      
      // 检查解密后的字符串是否为有效JSON
      if (decryptedStr && decryptedStr.trim().startsWith('{')) {
        console.log("解密后的数据:", decryptedStr)
        res = JSON.parse(decryptedStr);
      } else {
        throw new Error('解密后数据格式无效');
      }
    } catch (decryptError) {
      // 解密失败，说明是明文数据
      console.log("数据解密失败，使用明文数据:", res_result.data)
      res = res_result.data;
    }

    console.log('获取到的播放地址:', res);

    // 处理不同格式的返回数据
    if (res.code === 200 && res.data && res.data.playAddr) {
      // 新格式：包含多个清晰度的数据
      const playAddrData = res.data.playAddr;
      
      // 构建清晰度列表
      playAddrList.value = playAddrData.map(item => ({
        title: item.title || '未知',
        desc: item.desc || item.title || '默认',
        url: item.m3u8FileDomain + item.addr,
        vcodec: item.vcodec,
        format: item.format
      }));
      
      // 默认选择第一个清晰度
      if (playAddrList.value.length > 0) {
        playerUrl.value = playAddrList.value[0].url;
        
        // 判断是否为H265视频
        isH265Video.value = playAddrList.value[0].vcodec === 'H265' || 
                           playAddrList.value[0].vcodec === 'h265';
      }
    } else if (res.url) {
      // 旧格式：单一播放地址
      playerUrl.value = res.url;
      
      // 构建单一清晰度列表
      playAddrList.value = [{
        title: '标清',
        desc: '默认',
        url: res.url,
        vcodec: res.data?.codec || 'H264',
        format: 'MP4'
      }];
      
      // 判断是否为H265视频
      isH265Video.value = res.data?.codec === 'h265' || 
                         (res.data?.info && res.data.info.indexOf('hevc') > -1) ||
                         (res.data?.info && res.data.info.indexOf('h265') > -1);
    } else {
      console.error('无法解析播放地址数据格式');
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
  checkH265Support();
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
  
  .h265-unsupported-tip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10;
  }
}
</style>
