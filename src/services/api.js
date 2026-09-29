import { mockResponse, responseVariants } from '../data/mockData';

export function generateMockResponse() {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(mockResponse), 900);
  });
}

export function getMockVariant(variant) {
  return responseVariants[variant] || mockResponse;
}
