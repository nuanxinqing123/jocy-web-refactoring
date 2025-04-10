// 导入所有图标组件
import IconHome from './IconHome.vue';
import IconFileVideo from './IconFileVideo.vue';
import IconHeart from './IconHeart.vue';
import IconHistory from './IconHistory.vue';
import IconLink from './IconLink.vue';
import IconSearch from './IconSearch.vue';
import IconArrowRight from './IconArrowRight.vue';
import IconExport from './IconExport.vue';

// 导出所有图标组件
export {
    IconHome,
    IconFileVideo,
    IconHeart,
    IconHistory,
    IconLink,
    IconSearch,
    IconArrowRight,
    IconExport
};

// 注册所有图标组件
export default {
    install(app) {
        app.component('icon-home', IconHome);
        app.component('icon-file-video', IconFileVideo);
        app.component('icon-heart', IconHeart);
        app.component('icon-history', IconHistory);
        app.component('icon-link', IconLink);
        app.component('icon-search', IconSearch);
        app.component('icon-arrow-right', IconArrowRight);
        app.component('icon-export', IconExport);
    }
}; 