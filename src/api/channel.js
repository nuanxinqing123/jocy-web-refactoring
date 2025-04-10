import { request } from '@/utils/request';
import qs from 'query-string'

// 获取频道分类数据
export const getChannelAPI = () => {
    return request.get(`channel`);
}

// 获取横幅数据
export const getCarouselAPI = async (id = '0') => {
    return request.get(`banners/${id}`);
}

// 获取追番排期
export const getUpdateListAPI = (date, params) => {
    return request.get(`video_update_list/${date}`, {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    });
}