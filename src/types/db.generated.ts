export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          diff: Json | null;
          id: string;
          ip_address: unknown;
          resource: string;
          resource_id: string | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          diff?: Json | null;
          id?: string;
          ip_address?: unknown;
          resource: string;
          resource_id?: string | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          diff?: Json | null;
          id?: string;
          ip_address?: unknown;
          resource?: string;
          resource_id?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          translations: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          sort_order?: number;
          translations?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          sort_order?: number;
          translations?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          ip_address: unknown;
          message: string;
          name: string;
          phone: string | null;
          status: string;
          subject: string | null;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          ip_address?: unknown;
          message: string;
          name: string;
          phone?: string | null;
          status?: string;
          subject?: string | null;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          ip_address?: unknown;
          message?: string;
          name?: string;
          phone?: string | null;
          status?: string;
          subject?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      email_outbox: {
        Row: {
          attempts: number;
          created_at: string;
          id: string;
          last_error: string | null;
          locale: string;
          payload: Json;
          sent_at: string | null;
          status: string;
          template: string;
          to_email: string;
        };
        Insert: {
          attempts?: number;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          locale?: string;
          payload: Json;
          sent_at?: string | null;
          status?: string;
          template: string;
          to_email: string;
        };
        Update: {
          attempts?: number;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          locale?: string;
          payload?: Json;
          sent_at?: string | null;
          status?: string;
          template?: string;
          to_email?: string;
        };
        Relationships: [];
      };
      feature_flags: {
        Row: {
          enabled: boolean;
          key: string;
          metadata: Json;
          rollout_pct: number;
          updated_at: string;
        };
        Insert: {
          enabled?: boolean;
          key: string;
          metadata?: Json;
          rollout_pct?: number;
          updated_at?: string;
        };
        Update: {
          enabled?: boolean;
          key?: string;
          metadata?: Json;
          rollout_pct?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number;
          order_id: string;
          product_id: string | null;
          product_image: string | null;
          product_name: string;
          product_sku: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total: number;
          order_id: string;
          product_id?: string | null;
          product_image?: string | null;
          product_name: string;
          product_sku?: string | null;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total?: number;
          order_id?: string;
          product_id?: string | null;
          product_image?: string | null;
          product_name?: string;
          product_sku?: string | null;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      order_status_events: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: string | null;
          id: string;
          note: string | null;
          order_id: string;
          to_status: string;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          note?: string | null;
          order_id: string;
          to_status: string;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          note?: string | null;
          order_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_status_events_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_status_events_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_name: string;
          customer_notes: string | null;
          customer_phone: string;
          delivered_at: string | null;
          delivery_address: Json;
          id: string;
          idempotency_key: string | null;
          internal_notes: string | null;
          locale: string;
          order_number: string;
          payment_method: string;
          shipping_fee: number;
          status: string;
          subtotal: number;
          tax: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          currency?: string;
          customer_email: string;
          customer_name: string;
          customer_notes?: string | null;
          customer_phone: string;
          delivered_at?: string | null;
          delivery_address: Json;
          id?: string;
          idempotency_key?: string | null;
          internal_notes?: string | null;
          locale?: string;
          order_number: string;
          payment_method?: string;
          shipping_fee?: number;
          status?: string;
          subtotal: number;
          tax?: number;
          total: number;
          updated_at?: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_name?: string;
          customer_notes?: string | null;
          customer_phone?: string;
          delivered_at?: string | null;
          delivery_address?: Json;
          id?: string;
          idempotency_key?: string | null;
          internal_notes?: string | null;
          locale?: string;
          order_number?: string;
          payment_method?: string;
          shipping_fee?: number;
          status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          category_id: string;
          product_id: string;
        };
        Insert: {
          category_id: string;
          product_id: string;
        };
        Update: {
          category_id?: string;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_categories_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_categories_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_primary: boolean;
          product_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          product_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          product_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          brand: string | null;
          compare_at_price: number | null;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          low_stock_threshold: number;
          name: string;
          price: number;
          seo_description: string | null;
          seo_title: string | null;
          short_description: string | null;
          sku: string | null;
          slug: string;
          specifications: Json;
          status: string;
          stock_quantity: number;
          tags: string[];
          translations: Json;
          updated_at: string;
        };
        Insert: {
          brand?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          low_stock_threshold?: number;
          name: string;
          price: number;
          seo_description?: string | null;
          seo_title?: string | null;
          short_description?: string | null;
          sku?: string | null;
          slug: string;
          specifications?: Json;
          status?: string;
          stock_quantity?: number;
          tags?: string[];
          translations?: Json;
          updated_at?: string;
        };
        Update: {
          brand?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          low_stock_threshold?: number;
          name?: string;
          price?: number;
          seo_description?: string | null;
          seo_title?: string | null;
          short_description?: string | null;
          sku?: string | null;
          slug?: string;
          specifications?: Json;
          status?: string;
          stock_quantity?: number;
          tags?: string[];
          translations?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          is_active: boolean;
          last_login_at: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          last_login_at?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'settings_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      place_order: { Args: { p_input: Json }; Returns: string };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
      unaccent: { Args: { '': string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
