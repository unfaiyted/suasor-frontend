import type { LayoutLoad } from './$types';

// This layout load function runs on all settings routes
export const load: LayoutLoad = async ({ url }) => {
  // Extract the settings tab from the URL path
  const pathname = url.pathname;
  
  // Extract the tab name from the URL (e.g., "/settings/integrations" => "integrations")
  let activeTab = 'user'; // Default tab
  
  if (pathname !== '/settings') {
    const pathParts = pathname.split('/');
    if (pathParts.length > 2) {
      activeTab = pathParts[2];
    }
  }
  
  return {
    activeTab
  };
};