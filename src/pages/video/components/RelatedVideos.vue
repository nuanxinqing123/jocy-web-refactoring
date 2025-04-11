<!-- 相关推荐组件 -->
<template>
  <div class="related-videos">
    <div class="title">相关推荐</div>
    <div class="video-list">
      <div v-for="item in videos" :key="item.id" class="video-item" @click="handleVideoClick(item.id.toString())">
        <div class="video-thumb">
          <img :src="handleImage(item.pic)" :alt="item.name">
        </div>
        <div class="video-info">
          <div class="video-name">{{ item.name }}</div>
          <div class="video-meta">
            <span>{{ item.year }}</span>
            <span>{{ item.area }}</span>
            <span>{{ item.continu }}</span>
          </div>
        </div>
      </div>
      <div v-if="videos.length === 0" class="empty-state">
        <a-empty description="暂无相关推荐" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getVideoListAPI } from '@/api/video';
import { handleImage } from '@/utils/image';

const props = defineProps({
  channel: {
    type: String,
    default: '1'
  },
  sort: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  area: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 12
  },
  page: {
    type: Number,
    default: 1
  },
  enablePagination: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

// 相关视频数据
const videos = ref([]);

// 获取相关视频
const fetchRelatedVideos = async () => {
  try {
    const res = await getVideoListAPI({
      ...props
    });
    
    if (res.data) {
      videos.value = res.data.data?.items || [];
    } else {
      videos.value = [];
    }
  } catch (error) {
    console.error('获取相关视频失败:', error);
    videos.value = [];
  }
};

// 处理视频点击
const handleVideoClick = (id) => {
  router.push(`/video/${id}`);
};

// 监听参数变化
watch(
  () => props.channel,
  (newChannel) => {
    if (newChannel) {
      fetchRelatedVideos();
    }
  }
);

onMounted(() => {
  if (props.channel) {
    fetchRelatedVideos();
  }
});
</script>

<style lang="less" scoped>
.related-videos {
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;

  .title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .video-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .empty-state {
      padding: 20px 0;
    }

    .video-item {
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateX(4px);
      }

      .video-thumb {
        width: 120px;
        height: 68px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        background-color: #f0f0f0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .video-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .video-name {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .video-meta {
          font-size: 12px;
          color: #999;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .related-videos {
    display: none;
  }
}
</style> 