import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCommonStore = defineStore('common', () => {
    // 移动端状态
    const isMobile = ref(false);
    
    // 登录相关状态
    const token = ref(localStorage.getItem('token') || '');
    const isLogin = computed(() => !!token.value);
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
    const isShowLoginModal = ref(false);
    
    // 播放历史记录
    const historyList = ref(JSON.parse(localStorage.getItem('historyList') || '[]'));
    
    // 设置移动端状态
    const setIsMobile = (value) => {
        isMobile.value = value;
    };
    
    // 检测是否是移动端
    const checkIsMobile = () => {
        const width = window.innerWidth;
        setIsMobile(width < 768);
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            setIsMobile(newWidth < 768);
        });
    };
    
    // 设置token
    const setToken = (value) => {
        token.value = value;
        localStorage.setItem('token', value);
    };
    
    // 清除token
    const clearToken = () => {
        token.value = '';
        localStorage.removeItem('token');
    };
    
    // 设置登录状态
    const setLoginState = (value) => {
        if (!value) {
            clearToken();
            setUserInfo({});
        }
    };
    
    // 设置用户信息
    const setUserInfo = (info) => {
        userInfo.value = info;
        localStorage.setItem('userInfo', JSON.stringify(info));
    };
    
    // 设置登录模态框显示状态
    const setIsShowLoginModal = (value) => {
        isShowLoginModal.value = value;
    };
    
    // 更新播放历史记录
    const updateHistoryList = (list) => {
        historyList.value = list;
        localStorage.setItem('historyList', JSON.stringify(list));
    };
    
    return {
        isMobile,
        token,
        isLogin,
        userInfo,
        isShowLoginModal,
        historyList,
        checkIsMobile,
        setIsMobile,
        setToken,
        clearToken,
        setLoginState,
        setUserInfo,
        setIsShowLoginModal,
        updateHistoryList,
    };
}); 