import {request} from '@/utils/request';
import qs from 'query-string'

// 获取视频评论
export const getCommentListAPI = (params) => {
    return request.get(`vod_comment/getlist`, {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params)
        },
    });
}