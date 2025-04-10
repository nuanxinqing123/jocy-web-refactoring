<template>
    <div class="search-container">
        <h1 class="page-title">搜索</h1>
        <div class="content-box">
            <p>搜索页面，正在开发中...</p>
        </div>
    </div>
</template>

<script setup>
// 暴露scrollHandler方法，供布局调用
const scrollHandler = (e) => {
    // 可以在这里处理滚动逻辑
    console.log('Search页面滚动处理');
};

// 将方法暴露给父组件
defineExpose({
    scrollHandler
});
</script>

<style scoped lang="less">
.search-container {
    padding: 20px;
    
    .page-title {
        font-size: 28px;
        margin-bottom: 20px;
        color: var(--color-text);
    }
    
    .content-box {
        background-color: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
}
</style> 