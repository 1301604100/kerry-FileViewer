import Request from '../utils/Request';
import type { ListParams, ListModel } from './model/userModel';

export const getList = (params: ListParams) => {
  return Request.get<ListModel>('/list', { params });
};
