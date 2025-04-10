<template>
    <footer class="footer-bottom">
        <div class="footer-content container">
            <div class="footer-links">
                <a href="https://t.me/jocyweb" target="_blank" class="footer-link">
                    <i class="footer-icon telegram-icon"></i>Telegram群组
                </a>
                <span class="divider">|</span>
                <a href="#" class="footer-link">关于我们</a>
                <span class="divider">|</span>
                <a href="#" class="footer-link">使用条款</a>
                <span class="divider">|</span>
                <a href="#" class="footer-link">隐私政策</a>
            </div>
            <div class="footer-copyright">
                本站只提供WEB页面服务，本站不存储、不制作任何视频，不承担任何由于内容的合法性及健康性所引起的争议和法律责任。若本站收录内容侵犯了您的权益，请附说明，
                并通过网站反馈联系处理。
            </div>
            <div class="footer-icp">
                <span class="copyright-text">&copy; {{ currentYear }} Jocy All rights reserved.</span>
            </div>
        </div>
    </footer>
</template>

<script setup>
// 获取当前年份
const currentYear = new Date().getFullYear();
</script>

<style scoped lang="less">
.footer-bottom {
    background-color: #f8f9fa;
    padding: 30px 0;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);
    margin-top: 40px;
}

.footer-content {
    margin: 0 auto;
    max-width: 1200px;
    padding: 0 15px;
    
    // 响应式设计
    @media (max-width: 768px) {
        padding: 0 20px;
    }
}

.footer-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
    
    @media (max-width: 576px) {
        flex-direction: column;
        align-items: center;
        
        .divider {
            display: none;
        }
        
        .footer-link {
            margin: 5px 0;
        }
    }
}

.footer-link {
    color: #666;
    margin: 0 10px;
    transition: all 0.3s ease;
    font-size: 14px;
    text-decoration: none;
    display: flex;
    align-items: center;
    
    &:hover {
        color: #f596aa;
        transform: translateY(-2px);
    }
}

.footer-icon {
    margin-right: 5px;
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.telegram-icon {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzY2NiIgZD0iTTkuNzgsMTguNjVMMTAuMDYsMTQuNDJMMTcuNzQsNy41QzE4LjA4LDcuMTkgMTcuNjcsNy4wNCAxNy4yMiw3LjMxTDcuNzQsMTMuM0wzLjY0LDEyQzIuNzYsMTEuNzUgMi43NSwxMS4xNCAzLjg0LDEwLjdMMTkuODEsNC41NEMyMC41NCw0LjIxIDIxLjI0LDQuNzIgMjAuOTYsNS44NEwxOC4yNCwxOC42NUMxOC4wNSwxOS41NiAxNy41LDE5Ljc4IDE2Ljc0LDE5LjM2TDEyLjYsMTYuM0wxMC42MSwxOC4yM0MxMC4zOCwxOC40NiAxMC4xOSwxOC42NSA5Ljc4LDE4LjY1WiIvPjwvc3ZnPg==');
}

.divider {
    color: #ddd;
    margin: 0 5px;
}

.footer-copyright {
    color: #999;
    margin-bottom: 15px;
    font-size: 13px;
    line-height: 1.6;
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 15px;
}

.footer-icp {
    color: #666;
    font-size: 14px;
    text-align: center;
    padding-top: 15px;
    border-top: 1px solid #eee;
    margin-top: 15px;
}

.copyright-text {
    font-size: 13px;
    color: #888;
    position: relative;
    display: inline-block;
    
    &:after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        width: 0;
        height: 1px;
        background-color: #f596aa;
        transition: all 0.3s ease;
        transform: translateX(-50%);
    }
    
    &:hover:after {
        width: 100%;
    }
}
</style> 