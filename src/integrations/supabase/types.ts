export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          company: string | null
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          company?: string | null
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          order_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          eligible_users: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          minimum_amount: number | null
          starts_at: string | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          user_usage_limit: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          eligible_users?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          starts_at?: string | null
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          user_usage_limit?: number | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          eligible_users?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          starts_at?: string | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          user_usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          auto_scroll_speed: number | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_text: string | null
          link_url: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          auto_scroll_speed?: number | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_text?: string | null
          link_url?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          auto_scroll_speed?: number | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_text?: string | null
          link_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          total: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          total: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          total?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          currency: string | null
          delivered_at: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number | null
          variant_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number | null
          variant_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_variant_images_variant_id"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_price: number | null
          created_at: string
          description: string | null
          id: string
          inventory_quantity: number
          is_active: boolean | null
          name: string
          price: number
          product_id: string
          sku: string | null
          sort_order: number | null
          updated_at: string
          variant_options: Json | null
          weight: number | null
        }
        Insert: {
          compare_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          inventory_quantity?: number
          is_active?: boolean | null
          name: string
          price: number
          product_id: string
          sku?: string | null
          sort_order?: number | null
          updated_at?: string
          variant_options?: Json | null
          weight?: number | null
        }
        Update: {
          compare_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          inventory_quantity?: number
          is_active?: boolean | null
          name?: string
          price?: number
          product_id?: string
          sku?: string | null
          sort_order?: number | null
          updated_at?: string
          variant_options?: Json | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_variants_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          compare_price: number | null
          cost_price: number | null
          created_at: string
          description: string | null
          features: string | null
          id: string
          ingredients: string | null
          inventory_quantity: number | null
          is_active: boolean | null
          is_featured: boolean | null
          is_kits_deals: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          requires_shipping: boolean | null
          short_description: string | null
          sku: string | null
          slug: string
          tags: string[] | null
          track_inventory: boolean | null
          updated_at: string
          usage_instructions: string | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          features?: string | null
          id?: string
          ingredients?: string | null
          inventory_quantity?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_kits_deals?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price: number
          requires_shipping?: boolean | null
          short_description?: string | null
          sku?: string | null
          slug: string
          tags?: string[] | null
          track_inventory?: boolean | null
          updated_at?: string
          usage_instructions?: string | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          features?: string | null
          id?: string
          ingredients?: string | null
          inventory_quantity?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_kits_deals?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          requires_shipping?: boolean | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          tags?: string[] | null
          track_inventory?: boolean | null
          updated_at?: string
          usage_instructions?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_has_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { _email: string }
        Returns: undefined
      }
      remove_admin_role: {
        Args: { _email: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
