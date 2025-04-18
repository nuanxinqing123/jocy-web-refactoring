<template>
    <footer class="footer-bottom">
        <div class="footer-content container">
            <!-- <div class="footer-links">
                <router-link to="/" class="footer-link flash-view">
                    <span class="footer-link-text">首页</span>
                </router-link>
                <span class="divider">|</span>
                <router-link to="/about" class="footer-link flash-view">
                    <span class="footer-link-text">关于我们</span>
                </router-link>
                <span class="divider">|</span>
                <router-link to="/feedback" class="footer-link flash-view">
                    <span class="footer-link-text">意见反馈</span>
                </router-link>
                <span class="divider">|</span>
                <a href="mailto:contact@jocy.com" class="footer-link flash-view">
                    <i class="footer-icon email-icon"></i>
                    <span class="footer-link-text">联系我们</span>
                </a>
            </div> -->
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
    background-color: var(--color-bg);
    padding: 30px 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
    margin-top: 50px;
    border-top: 1px solid var(--color-border);
}

.footer-content {
    margin: 0 auto;
    max-width: 1200px;
    padding: 0 20px;
    
    // 响应式设计
    @media (max-width: 768px) {
        padding: 0 16px;
    }
}

.footer-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 25px;
    
    @media (max-width: 576px) {
        flex-direction: row;
        justify-content: center;
        gap: 10px;
        
        .divider {
            display: none;
        }
        
        .footer-link {
            margin: 5px 8px;
        }
    }
}

.footer-link {
    color: var(--color-text-light);
    margin: 0 12px;
    transition: all 0.3s ease;
    font-size: 14px;
    text-decoration: none;
    display: flex;
    align-items: center;
    position: relative;
    
    &:hover {
        color: var(--color-primary);
        transform: translateY(-2px);
    }
    
    &:after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--color-primary);
        transition: width 0.3s ease;
    }
    
    &:hover:after {
        width: 100%;
    }
}

.footer-icon {
    margin-right: 6px;
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.email-icon {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzY2NiIgZD0iTTIwLDhMMTIsMTNMNCw4VjZMMTIsMTFMMjAsNk04LDlIMTBWMTNIOFY5TTEwLDE0SDhWMTZIMTBWMTRNMTIsMTNIOE0xNCw5SDEyVjEzSDE0VjlNMTQsMTRIMTJWMTZIMTRWMTRNMTYsOUgxNFY2SDE2VjlMMTYsOVoiLz48L3N2Zz4=');
}

.divider {
    color: var(--color-border);
    margin: 0 5px;
    
    @media (max-width: 576px) {
        display: none;
    }
}

.footer-copyright {
    color: var(--color-text-lighter);
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 1.7;
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 15px;
    
    @media (max-width: 576px) {
        font-size: 12px;
        line-height: 1.6;
        padding: 0 10px;
    }
}

.footer-icp {
    color: var(--color-text-light);
    font-size: 14px;
    text-align: center;
    padding-top: 15px;
    border-top: 1px solid var(--color-border);
    margin-top: 15px;
}

.copyright-text {
    font-size: 13px;
    color: var(--color-text-lighter);
    position: relative;
    display: inline-block;
    transition: all 0.3s ease;
    
    &:hover {
        color: var(--color-primary);
    }
    
    &:after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 50%;
        width: 0;
        height: 1px;
        background-color: var(--color-primary);
        transition: all 0.3s ease;
        transform: translateX(-50%);
    }
    
    &:hover:after {
        width: 100%;
    }
}
</style> 