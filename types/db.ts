export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          slug: string;
          name: string;
          status: string;
          primary_color: string | null;
          secondary_color: string | null;
          logo_url: string | null;
          banner_url: string | null;
          hero_image_url: string | null;
          menu_background_url: string | null;
          welcome_title: string | null;
          welcome_subtitle: string | null;
          welcome_button_text: string | null;
          welcome_title_ar: string | null;
          welcome_title_he: string | null;
          welcome_title_en: string | null;
          welcome_subtitle_ar: string | null;
          welcome_subtitle_he: string | null;
          welcome_subtitle_en: string | null;
          welcome_button_text_ar: string | null;
          welcome_button_text_he: string | null;
          welcome_button_text_en: string | null;
          default_content_language: string;
          show_welcome_screen: boolean;
          email: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          status?: string;
          primary_color?: string | null;
          secondary_color?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          hero_image_url?: string | null;
          menu_background_url?: string | null;
          welcome_title?: string | null;
          welcome_subtitle?: string | null;
          welcome_button_text?: string | null;
          welcome_title_ar?: string | null;
          welcome_title_he?: string | null;
          welcome_title_en?: string | null;
          welcome_subtitle_ar?: string | null;
          welcome_subtitle_he?: string | null;
          welcome_subtitle_en?: string | null;
          welcome_button_text_ar?: string | null;
          welcome_button_text_he?: string | null;
          welcome_button_text_en?: string | null;
          default_content_language?: string;
          show_welcome_screen?: boolean;
          email?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stores"]["Insert"]>;
      };
      menu_categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          name_ar: string | null;
          name_he: string | null;
          name_en: string | null;
          slug: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          name_ar?: string | null;
          name_he?: string | null;
          name_en?: string | null;
          slug: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_categories"]["Insert"]>;
      };
      menu_items: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          name: string;
          name_ar: string | null;
          name_he: string | null;
          name_en: string | null;
          slug: string;
          description: string | null;
          description_ar: string | null;
          description_he: string | null;
          description_en: string | null;
          price: number;
          original_price: number | null;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          name: string;
          name_ar?: string | null;
          name_he?: string | null;
          name_en?: string | null;
          slug: string;
          description?: string | null;
          description_ar?: string | null;
          description_he?: string | null;
          description_en?: string | null;
          price: number;
          original_price?: number | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string;
          store_id: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role: string;
          store_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      pending_signups: {
        Row: {
          id: string;
          full_name: string;
          restaurant_name: string;
          email: string;
          whatsapp: string;
          plan: "basic" | "pro" | "premium" | "small" | "medium" | "large";
          notes: string | null;
          estimated_items: string | null;
          status: "pending" | "approved" | "rejected";
          approved_store_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          restaurant_name: string;
          email: string;
          whatsapp: string;
          plan: "basic" | "pro" | "premium" | "small" | "medium" | "large";
          notes?: string | null;
          estimated_items?: string | null;
          status?: "pending" | "approved" | "rejected";
          approved_store_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pending_signups"]["Insert"]>;
      };
    };
  };
};

export type PendingSignupRow = Database["public"]["Tables"]["pending_signups"]["Row"];
