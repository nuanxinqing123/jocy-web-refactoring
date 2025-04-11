<!-- 视频右侧信息组件 -->
<template>
  <div class="video-sidebar">
    <!-- 视频信息区域 -->
    <div class="video-info">
      <h2 class="title">{{ title }}</h2>
      <div class="meta">
        <span class="year pill">{{ year }}</span>
        <span class="region pill">{{ region }}</span>
        <span class="type pill">{{ type.replace(/,/g, ' / ') }}</span>
      </div>
    </div>

    <!-- 选集播放区域 -->
    <div class="episode-list">
      <div class="header">
        <div class="play-types">
          <div class="section-title">选集播放</div>
          <div class="scroll-container" ref="scrollContainer">
            <span
              v-for="item in parts"
              :key="item.play"
              :class="{ active: currentPlayType === item.play }"
              @click="handlePlayTypeChange(item)"
            >
              {{ item.play_zh }}
              <sup class="count" v-if="item.part">{{ item.part.length }}</sup>
            </span>
          </div>
        </div>
      </div>
      <div class="list">
        <div
          v-for="(episode, index) in sortedEpisodes"
          :key="index"
          class="episode-item"
          :class="{
            active: currentEpisode === episode,
            'is-playing': currentEpisode === episode
          }"
          @click="$emit('episode-change', episode, currentPlayType)"
        >
          {{ episode }}
          <span class="playing-icon" v-if="currentEpisode === episode">
            <i></i><i></i><i></i>
          </span>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="toolbar">
      <div class="tool-item" @click="toggleSort">
        <icon-menu />
        <span>排序</span>
      </div>
      <div class="tool-item" @click="handleNextEpisode">
        <icon-right />
        <span>下一集</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { IconMenu, IconRight } from '@arco-design/web-vue/es/icon';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  year: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  parts: {
    type: Array,
    default: () => []
  },
  currentEpisode: {
    type: String,
    default: ''
  },
  currentPlayType: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['episode-change']);

const scrollContainer = ref(null);
const scrollLeft = ref(0);
const maxScroll = ref(0);
const showScrollButtons = ref(false);
const isDesc = ref(false);

// 计算当前选中的播放线路
const currentPart = computed(() => {
  return props.parts?.find(item => item.play === props.currentPlayType);
});

// 计算排序后的剧集列表
const sortedEpisodes = computed(() => {
  if (!currentPart.value?.part) return [];

  const episodes = [...currentPart.value.part].sort((a, b) => {
    return Number(a) - Number(b);
  });

  return isDesc.value ? episodes.reverse() : episodes;
});

// 切换播放线路
const handlePlayTypeChange = (item) => {
  if (item.part && item.part.length > 0) {
    emit('episode-change', item.part[0], item.play);
  }
};

// 检查是否需要显示滚动按钮
const checkScrollable = () => {
  if (scrollContainer.value) {
    const { scrollWidth, clientWidth } = scrollContainer.value;
    showScrollButtons.value = scrollWidth > clientWidth;
    maxScroll.value = scrollWidth - clientWidth;
  }
};

// 监听滚动容器的滚动事件
const handleScroll = () => {
  if (scrollContainer.value) {
    scrollLeft.value = scrollContainer.value.scrollLeft;
  }
};

// 切换排序方式
const toggleSort = () => {
  isDesc.value = !isDesc.value;
};

// 切换下一集
const handleNextEpisode = () => {
  if (!currentPart.value?.part) return;

  // 获取当前剧集在排序后列表中的索引
  const currentIndex = sortedEpisodes.value.findIndex(episode => episode === props.currentEpisode);

  // 如果找到当前剧集并且不是最后一集
  if (currentIndex !== -1 && currentIndex < sortedEpisodes.value.length - 1) {
    const nextEpisode = sortedEpisodes.value[currentIndex + 1];
    emit('episode-change', nextEpisode, props.currentPlayType);
  }
};

onMounted(() => {
  checkScrollable();
  window.addEventListener('resize', checkScrollable);
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollable);
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style lang="less" scoped>
.video-sidebar {
  width: 100%;
  height: 100%;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  .video-info {
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    .title {
        position: relative;
        padding-left: 15px;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 70%;
            background-color: #f596aa;
            border-radius: 2px;
        }

        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin-top: 0;
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;

      .pill {
        display: inline-block;
        padding: 3px 10px;
        background: #f6f7f8;
        border-radius: 16px;
        font-size: 12px;
        color: #666;
      }
    }
  }

  .episode-list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .header {
      padding: 0 16px;
      background: #fff;

      .play-types {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-right: 20px;
          white-space: nowrap;
        }

        .scroll-container {
          display: flex;
          gap: 20px;
          padding: 6px 0;
          overflow-x: auto;

          &::-webkit-scrollbar {
            display: none;
          }

          span {
            position: relative;
            display: inline-flex;
            align-items: center;
            font-size: 14px;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;

            .count {
              position: absolute;
              top: -8px;
              right: -10px;
              font-size: 10px;
              color: #999;
            }

            &:hover {
                color: #f596aa;
            }

            &.active {
                color: #f596aa;
                font-weight: 500;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 16px;
                    height: 2px;
                    background: #f596aa;
                    border-radius: 1px;
                }
            }
          }
        }
      }
    }

    .list {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;

            .episode-item {
                position: relative;
                text-align: center;
                padding: 10px;
                background: #fff;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
                color: #666;

                &:hover {
                    background: #fef0f0;
                    color: #f596aa;
                }

                &.active {
                    background: #f596aa;
                    color: #fff;
                }

                &.is-playing {
                    .playing-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 2px;
                        position: absolute;
                        bottom: 2px;
                        left: 50%;
                        transform: translateX(-50%);

                        i {
                            width: 2px;
                            height: 6px;
                            background-color: #fff;
                            border-radius: 1px;
                            animation: playing 0.8s ease infinite;

                            &:nth-child(2) {
                                animation-delay: 0.2s;
                            }

                            &:nth-child(3) {
                                animation-delay: 0.4s;
                            }
                        }
                    }
                }
            }
        }
  }

  .toolbar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    padding: 10px 0;
    background: #fff;
    border-top: 1px solid #f0f0f0;

    .tool-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      padding: 8px 0;

      svg {
        font-size: 16px;
        color: #666;
      }

      span {
        font-size: 14px;
        color: #666;
      }

      &:hover {
        svg, span {
          color: var(--color-primary-6);
        }
      }
    }
  }
}

@keyframes playing {
  0%, 100% {
    height: 6px;
  }
  50% {
    height: 10px;
  }
}

@media screen and (max-width: 768px) {
    .video-sidebar {
        .video-info {
            .title {
                font-size: 20px;
            }
        }

        .episode-list {
            .header {
                .play-types {
                    .scroll-container {
                        gap: 20px;
                        padding: 10px 0;

                        span {
                            font-size: 14px;
                        }
                    }
                }
            }

            .list {
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                padding: 12px;

                .episode-item {
                    font-size: 13px;
                    padding: 8px;
                }
            }
        }
    }
}
</style>
