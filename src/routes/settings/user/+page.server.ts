import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect to the main settings page with the tab as a query parameter
  throw redirect(302, '/settings?tab=user');
};