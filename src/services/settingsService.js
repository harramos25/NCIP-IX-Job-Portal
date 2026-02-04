import { supabase } from '../lib/supabase';

export const settingsService = {
    // Get a specific setting by key
    async getSetting(key) {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .single();

            if (error) {
                // If row doesn't exist, generic error usually returned, treat as null
                if (error.code === 'PGRST116') return null;
                console.error(`Error fetching setting ${key}:`, error);
                return null;
            }

            return data?.value || null;
        } catch (error) {
            console.error(`Unexpected error fetching setting ${key}:`, error);
            return null;
        }
    },

    // Update or Insert a setting
    async updateSetting(key, value) {
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({ key, value })
                .select();

            if (error) {
                console.error(`Error updating setting ${key}:`, error);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Unexpected error updating setting ${key}:`, error);
            return false;
        }
    },

    // Specific helper for Admin Avatar
    async getAdminAvatar() {
        return await this.getSetting('admin_avatar');
    },

    async updateAdminAvatar(url) {
        return await this.updateSetting('admin_avatar', url);
    }
};
