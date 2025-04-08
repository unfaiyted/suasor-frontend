import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  // Get data from the parent layout
  const layoutData = await parent();
  
  return {
    ...layoutData
  };
};