import { z } from 'zod';

export const platformEnum = z.enum([
  'google_ads',
  'meta_pixel',
  'tiktok_pixel',
]);

export const createPixelSchema = z.object({
  platform: platformEnum,
  pixel_id: z.string().min(1, 'Pixel ID is required'),
  is_enabled: z.boolean().default(true),
});

export const updatePixelSchema = z.object({
  pixel_id: z.string().min(1).optional(),
  is_enabled: z.boolean().optional(),
});

export const pixelEventSchema = z.object({
  pixel_id: z.string().uuid(),
  event_type: z.string().min(1),
  event_value: z.number().optional(),
  currency: z.string().default('USD'),
  product_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  session_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreatePixelInput = z.infer<typeof createPixelSchema>;
export type UpdatePixelInput = z.infer<typeof updatePixelSchema>;
export type PixelEventInput = z.infer<typeof pixelEventSchema>;
