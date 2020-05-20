import { request } from 'graphql-request';

const fetcher = async (query, variables) => {
  const res = await request('/api/graphql', query, variables);
  return res;
};

export { fetcher };
