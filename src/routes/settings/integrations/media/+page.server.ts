import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect to settings with tab and subtab parameters
  throw redirect(302, '/settings?tab=integrations&subtab=media');
};