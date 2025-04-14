<template>
  <div class="comment-section">
    <div class="comment-navigation">
      <ul class="nav-bar">
        <li class="nav-title">
          <span class="nav-title-text">评论</span>
          <span class="total-comment">{{ total }}</span>
        </li>
      </ul>
    </div>

    <!-- 发表评论 -->
    <!-- <div class="comment-form">
      <div class="comment-input">
        <a-textarea 
          v-model="commentText" 
          placeholder="发表你的看法..." 
          :max-length="200" 
          :auto-size="{ minRows: 2, maxRows: 4 }"
          :show-word-limit="true"
        />
      </div>
      <div class="comment-submit">
        <a-button type="primary" @click="submitComment" :loading="submitting" :disabled="!commentText.trim()">
          发布
        </a-button>
      </div>
    </div> -->

    <!-- 评论列表 -->
    <div class="comment-container" v-for="item in commentList" :key="item.id">
      <div class="comment-avatar">
        <a-avatar :size="40" :image-url="`${baseURL}users/avatar?id=${item.uid}`"
        :style="{ cursor: 'pointer' }" />
      </div>
      <div class="content-warp">
        <div class="user-info">
          <div class="user-name">{{ item.uname }}</div>
          <span class="comment-time">{{ formatRelativeTime(item.created_at) }}</span>
        </div>
        <div class="comment-content">{{ item.comments }}</div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="commentList.length === 0 && !loading" class="empty-comment">
      <a-empty description="暂无评论" />
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-more">
      <a-spin dot />
      <span>加载中...</span>
    </div>

    <!-- 加载更多按钮 -->
    <div v-if="!loading && hasMore && commentList.length > 0" class="load-more-btn">
      <a-button type="text" @click="loadMoreComments">
        加载更多
        <template #icon>
          <icon-down />
        </template>
      </a-button>
    </div>

    <!-- 全部加载完毕提示 -->
    <div v-if="!loading && !hasMore && commentList.length > 0" class="no-more-comment">
      <span>没有更多评论了</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getCommentListAPI } from '@/api/comment';
import { Message } from '@arco-design/web-vue';
import { baseURL } from '@/utils/request';
import { IconDown } from '@arco-design/web-vue/es/icon';

const props = defineProps({
  vid: {
    type: String,
    required: true
  }
});

const commentList = ref([]);
const loading = ref(false);
const submitting = ref(false);
const commentText = ref('');
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const hasMore = ref(true);
const scrollThreshold = 200; // 触发加载的滚动阈值

// 格式化相对时间
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const currentTime = new Date().getTime();
  const commentTime = new Date(timestamp).getTime();
  const timeDiff = Math.floor((currentTime - commentTime) / 1000); // 转为秒
  
  if (timeDiff < 60) {
    return '刚刚';
  } else if (timeDiff < 3600) {
    return `${Math.floor(timeDiff / 60)}分钟前`;
  } else if (timeDiff < 86400) {
    return `${Math.floor(timeDiff / 3600)}小时前`;
  } else if (timeDiff < 2592000) {
    return `${Math.floor(timeDiff / 86400)}天前`;
  } else if (timeDiff < 31536000) {
    return `${Math.floor(timeDiff / 2592000)}个月前`;
  } else {
    return `${Math.floor(timeDiff / 31536000)}年前`;
  }
};

// 生成基于uid的随机头像颜色
const generateAvatarColor = (uid) => {
  if (!uid) return '#FF2F54';
  
  // 根据用户ID生成一个固定颜色
  const colors = [
    '#FF2F54', '#00B42A', '#165DFF', '#FF7D00', '#7B61FF',
    '#00B42A', '#0FC6C2', '#722ED1', '#EB0AA4', '#0E42D2'
  ];
  
  // 使用uid的字符串表示形式的总和作为索引
  const uidStr = uid.toString();
  let sum = 0;
  for (let i = 0; i < uidStr.length; i++) {
    sum += parseInt(uidStr.charAt(i), 10);
  }
  
  return colors[sum % colors.length];
};

// 获取评论列表
const getCommentList = async () => {
  if (loading.value || !hasMore.value || !props.vid) return;
  loading.value = true;
  
  try {
    const res = await getCommentListAPI({
      vid: props.vid,
      page: page.value,
      limit: pageSize
    });

    if (res?.data?.code === 20000) {
      total.value = parseInt(res.data.data.total || 0);
      const newItems = res.data.data.items || [];

      if (page.value === 1) {
        commentList.value = newItems;
      } else {
        commentList.value.push(...newItems);
      }

      // 检查是否还有更多数据
      hasMore.value = commentList.value.length < total.value;
      
      // 如果返回的数据少于请求的数量，也认为没有更多数据了
      if (newItems.length < pageSize) {
        hasMore.value = false;
      }
    } else {
      // 如果接口返回错误，也设置为没有更多数据
      hasMore.value = false;
      console.warn('获取评论列表接口返回错误:', res?.data);
    }
  } catch (error) {
    console.error('获取评论列表失败：', error);
    hasMore.value = false;
    // 避免UI上显示错误
    if (page.value === 1) {
      commentList.value = [];
      total.value = 0;
    }
  } finally {
    loading.value = false;
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim() || submitting.value) return;
  
  submitting.value = true;
  
  try {
    // 检查用户是否登录
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      Message.warning('请先登录后再发表评论');
      submitting.value = false;
      return;
    }
    
    // 实际上应该调用评论API，这里模拟发布成功
    Message.success('评论发表成功');
    
    // 清空评论框
    commentText.value = '';
    
    // 重新加载评论列表 (第一页)
    page.value = 1;
    await getCommentList();
  } catch (error) {
    console.error('发表评论失败：', error);
    Message.error('发表评论失败，请稍后再试');
  } finally {
    submitting.value = false;
  }
};

// 加载更多评论（手动触发）
const loadMoreComments = () => {
  if (!loading.value && hasMore.value) {
    page.value++;
    getCommentList();
  }
};

// 滚动加载更多（自动触发）
const lazyLoading = () => {
  // 防止组件尚未挂载或已卸载时触发
  if (!document || !window) return;
  
  const commentSection = document.querySelector('.comment-section');
  if (!commentSection) return;
  
  try {
    const rect = commentSection.getBoundingClientRect();
    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    
    if (isVisible) {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // 当滚动到接近底部时加载更多
      if (scrollHeight - scrollTop - clientHeight < scrollThreshold && !loading.value && hasMore.value) {
        loadMoreComments();
      }
    }
  } catch (error) {
    console.error('滚动加载处理错误:', error);
  }
};

// 重置并重新加载
const resetAndReload = () => {
  page.value = 1;
  hasMore.value = true;
  commentList.value = [];
  getCommentList();
};

// 监听路由变化，重新加载评论
watch(
  () => props.vid,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      resetAndReload();
    }
  },
  { immediate: false } // 修改为false，避免重复调用
);

onMounted(() => {
  try {
    // 延迟执行初始加载，确保DOM已就绪
    setTimeout(() => {
      getCommentList();
    }, 100);
    
    // 确保浏览器环境
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', lazyLoading, { passive: true });
    }
  } catch (error) {
    console.error('组件挂载错误:', error);
  }
});

onBeforeUnmount(() => {
  try {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', lazyLoading);
    }
  } catch (error) {
    console.error('组件卸载错误:', error);
  }
});
</script>

<style lang="less" scoped>
.comment-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .comment-navigation {
    margin-bottom: 20px;
    
    .nav-bar {
      list-style: none;
      padding: 0;
      margin: 0;
      
      .nav-title {
        font-size: 18px;
        font-weight: bold;

        .nav-title-text {
          color: #666666;
        }
        
        .total-comment {
          margin-left: 8px;
          color: var(--color-text-3);
          font-size: 14px;
        }
      }
    }
  }

  .comment-form {
    margin-bottom: 24px;
    
    .comment-input {
      margin-bottom: 12px;
    }
    
    .comment-submit {
      display: flex;
      justify-content: flex-end;
    }
  }

  .comment-container {
    display: flex;
    padding: 16px 0;
    border-bottom: 1px solid var(--color-border);

    .comment-avatar {
      margin-right: 12px;
      flex-shrink: 0;
    }

    .content-warp {
      flex: 1;
      
      .user-info {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        
        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-1);
          margin-right: 12px;
        }
        
        .comment-time {
          font-size: 12px;
          color: var(--color-text-3);
        }
      }

      .comment-content {
        font-size: 14px;
        color: var(--color-text-2);
        line-height: 1.6;
        margin-bottom: 8px;
        word-break: break-word;
      }
    }
  }

  .empty-comment {
    padding: 40px 0;
    text-align: center;
  }

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    color: var(--color-text-3);
    font-size: 14px;
    
    :deep(.arco-spin) {
      margin-right: 8px;
    }
  }
  
  .load-more-btn {
    display: flex;
    justify-content: center;
    padding: 16px 0 0;
  }
  
  .no-more-comment {
    display: flex;
    justify-content: center;
    padding: 16px 0 0;
    color: var(--color-text-3);
    font-size: 14px;
  }
}

@media screen and (max-width: 768px) {
  .comment-section {
    border-radius: 8px;
    padding: 12px;
    
    .comment-navigation {
      margin-bottom: 12px;
      
      .nav-bar .nav-title {
        font-size: 16px;
      }
    }
    
    .comment-form {
      margin-bottom: 16px;
    }
    
    .comment-container {
      padding: 12px 0;
      
      .comment-avatar :deep(.arco-avatar) {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }
    }
  }
}
</style> 