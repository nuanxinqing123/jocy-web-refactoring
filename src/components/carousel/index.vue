<template>
  <div class="carousel-container">
    <a-carousel
      :auto-play="{
        interval: 4000,
        hoverToPause: true,
      }"
      indicator-type="never"
      show-arrow="hover"
      animation-name="fade"
      class="custom-carousel"
    >
      <a-carousel-item v-for="(item, index) in banner" :key="index">
        <div class="carousel-item">
          <div class="carousel-content">
            <router-link :to="`/detail/${item.vid}`">
              <img :src="handleImage(item.img)" :alt="item.vname" class="carousel-image" />
            </router-link>
            <div class="carousel-info">
              <h2 class="title">{{ item.vname }}</h2>
              <div class="episode" v-if="item.continu">{{ item.continu }}</div>
              <p class="description">{{ item.content }}</p>
            </div>
          </div>
        </div>
      </a-carousel-item>
    </a-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getBannerAPI } from '@/api/video';
import { useCommonStore } from '@/stores/commonStore';
import { handleImage } from '@/utils/image';

const props = defineProps({
  id: {
    type: String,
    default: '0'
  }
});

// 获取横幅数据
const banner = ref([]);
const commonStore = useCommonStore();

// 获取轮播图数据
const getCarousel = async () => {
  try {
    const res = await getBannerAPI(props.id);
    
    // 检查响应是否有效
    if (res && res.data) {
        banner.value = res.data.data;
    }
  } catch (error) {
    console.error('获取轮播图数据失败:', error);
  }
};

onMounted(() => {
  getCarousel();
});
</script>

<style scoped lang="less">
.carousel-container {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  :deep(.custom-carousel) {
    height: 350px;

    @media screen and (max-width: 768px) {
      height: 220px;
    }

    .arco-carousel-arrow {
      width: 36px;
      height: 36px;
      font-size: 18px;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      &:hover {
        background-color: #fff;
      }
    }
  }
}

.carousel-item {
  height: 100%;
  position: relative;

  .carousel-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .carousel-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .carousel-info {
    position: relative;
    padding: 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    color: #fff;

    .title {
      font-size: 24px;
      margin: 0 0 8px;
      font-weight: 600;

      @media screen and (max-width: 768px) {
        font-size: 18px;
      }
    }

    .episode {
      font-size: 14px;
      margin-bottom: 8px;
      opacity: 0.9;
    }

    .description {
      font-size: 14px;
      margin: 0;
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;

      @media screen and (max-width: 768px) {
        -webkit-line-clamp: 1;
        line-clamp: 1;
      }
    }
  }
}

// PC端特殊样式
@media screen and (min-width: 769px) {
  .carousel-container {
    :deep(.custom-carousel) {
      .arco-carousel-card {
        .arco-carousel-slide {
          padding: 12px;
        }

        .arco-carousel-item {
          transform: scale(0.85);
          transition: all 0.3s ease;

          &.arco-carousel-item-active {
            transform: scale(1);
          }
        }
      }
    }
  }
}
</style> 