<template>
    <div class="not-found-container">
        <h1 class="title">404</h1>
        <p class="subtitle">页面不存在</p>
        <a-button type="primary" class="home-button" @click="goHome">返回首页</a-button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/');
};

// 暴露scrollHandler方法，供布局调用
const scrollHandler = (e) => {
    // 404页面不需要处理滚动逻辑
};

// 将方法暴露给父组件
defineExpose({
    scrollHandler
});
</script>

<style scoped lang="less">
.not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    text-align: center;
    
    .title {
        font-size: 120px;
        font-weight: bold;
        color: var(--color-primary);
        margin: 0;
        line-height: 1;
        
        @media (max-width: 768px) {
            font-size: 80px;
        }
    }
    
    .subtitle {
        font-size: 24px;
        color: var(--color-text-light);
        margin: 20px 0 30px;
        
        @media (max-width: 768px) {
            font-size: 20px;
        }
    }
    
    .home-button {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
        border: none;
        padding: 10px 30px;
        font-size: 16px;
        border-radius: 50px;
        box-shadow: 0 4px 10px rgba(245, 150, 170, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(245, 150, 170, 0.4);
        }
    }
}
</style> 