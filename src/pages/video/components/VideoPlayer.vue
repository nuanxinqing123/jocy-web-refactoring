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
    
    <!-- H265不支持提示 -->
    <div v-if="!supportH265 && isH265Video" class="h265-unsupported-tip">
      <a-alert type="warning" show-icon>
        <template #message>当前浏览器不支持播放H265视频，请更换其他浏览器或播放设备。</template>
      </a-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
import { getVideoPlayAPI, getVideoPlayParamsAPI, getVideoPlayAPI2 } from "@/api/video";
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
const supportH265 = ref(false);
const isH265Video = ref(false);

// 检测浏览器是否支持H265
const checkH265Support = () => {
  let mseSupport = false;
  let elementSupport = false;
  
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

    // 此处判断是否登录, 需要强制登录
    const commonStore = useCommonStore();
    if (!commonStore.isLogin) {
      commonStore.setIsShowLoginModal(true);
      return;
    }

    // 获取播放地址
    // https://v3.douyinvod.com/7436333fa505bb3b481a21f9dc2547c6/67fc9ec7/video/tos/cn/tos-cn-v-6643b4/oUEBUDnM9iOFXlwzDAEM58FzL4SBsgffE12KOS/
    // const res = await getVideoPlayAPI({
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

    // AES解密数据
    const key = CryptoJS.enc.Utf8.parse(res_params.data["aes_key"])
    const iv = CryptoJS.enc.Utf8.parse(res_params.data["aes_iv"])
    // 假设返回数据在 res.data
    const decrypted = CryptoJS.AES.decrypt(res_result.data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
    // decryptedStr 就是解密后的明文数据
    console.log("decryptedStr:", decryptedStr)
    let res = JSON.parse(decryptedStr);

    console.log('获取到的播放地址:', res);

    // 处理播放类型
    let url;
    // if (res.data.type === "multi") {
    //   url = res.data.url.multi[0].url;
    // } else {
    //   url = res.data.url.single;
    // }
    url = res.url;
    
    playerUrl.value = url;
    
    // 判断是否为H265视频
    // 这里假设视频编码信息可以从响应中获取，如果不能，可能需要根据实际情况调整
    // 例如：根据URL特征或响应中的其他信息来判断
    isH265Video.value = res.data.codec === 'h265' || 
                        (res.data.info && res.data.info.indexOf('hevc') > -1) ||
                        (res.data.info && res.data.info.indexOf('h265') > -1);

    // // 处理m3u8格式
    // if (url.toString().includes(".m3u8")) {
    //   // 判断URL地址是否为HTTPS
    //   if (url.toString().includes("https://")) {
    //     playerUrl.value = url;
    //   } else {
    //     // 需要转换非https的m3u8
    //     const m3u8Res = await postPlayResourcesAPI(url);
    //     // string转换为m3u8文件
    //     const blob = new Blob([m3u8Res.data]);
    //     // 创建虚拟URL
    //     playerUrl.value = URL.createObjectURL(blob);
    //   }
    // } else {
    //   // 直接使用非m3u8地址
    //   playerUrl.value = url;
    // }
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
  // if (props.videoId && props.part && props.playType) {
  //   getVideoUrl();
  // }
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
