import request from '@/utils/request';
import qs from 'query-string'
import axios from "axios";


// 获取频道数据
export const getVideoListAPI = async (params) => {
    return request.get("video/list", {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    });
}

// 获取轮播图数据
export const getBannerAPI = async (id) => {
    try {
        return request.get(`banners/${id}`);
    } catch (error) {
        console.error('Banner API error:', error);
        throw error;
    }
}

// 获取视频详情
export const getVideoDetailAPI = (params) => {
    return request.get("video/detail", {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    });
}

// 获取视频播放线路
export function getVideoPlayAPI(params) {
    return request.get(`video/play`, {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    })
}

// 获取视频播放线路-参数获取
export function getVideoPlayParamsAPI(params) {
    return request.get(`video/play/params`, {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    })
}

// 二次获取播放数据
export function getVideoPlayAPI2(url, params) {
    return axios.get(url, {
        headers: params
    })
}

// 获取视频弹幕
export function getDanmuAPI(params) {
    return request.get(`danmu`, {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    })
}

// 发送弹幕
export function postDanmuAPI(data) {
    return request.post(`danmu`, data)
}

// 获取播放资源
export function postPlayResourcesAPI(url) {
    return request.post('play/resources', { url })
}


// 我的收藏
export const getCollectList = async (params) => {
    return request.get(`collect`, {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    });
}

// 删除收藏
export function delCollect(data) {
    return request.delete('collect', { data });
}

// 收藏
export function addCollect(params) {
    return request.post('collect', params)
}

// 历史记录
export function getHistoryList(params) {
    return request.get('history', {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    })
}

// 上传播放记录
export function postHistoryAPI(params) {
    return request.post('history', params)
}

// 获取视频预搜索
export function getVideoKey(params) {
    return request({
        url: 'video/key',
        method: 'get',
        params
    });
}

// 获取视频详情
export function getVideoDetail(id) {
    return request({
        url: `/videos/${id}`,
        method: 'get'
    });
}

// 获取视频列表
export function getVideoList(params) {
    return request({
        url: '/videos/list',
        method: 'get',
        params
    });
}

// 获取视频搜索结果
export function getVideoSearch(params) {
    return request({
        url: '/video/search',
        method: 'get',
        params
    });
}

// 获取视频推荐
export function getVideoRecommend(id, params) {
    return request({
        url: `/videos/${id}/recommend`,
        method: 'get',
        params
    });
}

// 添加用户收藏
export function addVideoCollect(videoId) {
    return request({
        url: '/user/collect',
        method: 'post',
        data: {
            video_id: videoId
        }
    });
}

// 删除用户收藏
export function deleteVideoCollect(videoId) {
    return request({
        url: '/user/collect',
        method: 'delete',
        data: {
            video_id: videoId
        }
    });
}

// 获取用户收藏列表
export function getUserCollect(params) {
    return request({
        url: '/user/collect',
        method: 'get',
        params
    });
}

// 获取用户历史记录
export function getUserHistory(params) {
    return request({
        url: '/user/history',
        method: 'get',
        params
    });
}

// 添加历史记录
export function addUserHistory(data) {
    return request({
        url: '/user/history',
        method: 'post',
        data
    });
}