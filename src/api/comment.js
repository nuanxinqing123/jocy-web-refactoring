import request from '@/utils/request';
import qs from 'query-string';

/**
 * 获取评论列表
 * @param {Object} params - 请求参数
 * @param {string} params.vid - 视频ID
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @returns {Promise} - 返回请求结果
 */
export function getCommentListAPI(params) {
  return request({
    url: 'vod_comment/getlist',
    method: 'get',
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params);
    }
  });
}

// /**
//  * 发布评论
//  * @param {Object} data - 请求数据
//  * @param {string} data.vid - 视频ID
//  * @param {string} data.comments - 评论内容
//  * @returns {Promise} - 返回请求结果
//  */
// export function postCommentAPI(data) {
//   return request({
//     url: '/app/comment/post',
//     method: 'post',
//     data
//   });
// }