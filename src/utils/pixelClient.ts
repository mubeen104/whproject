/**
 * Client-side API wrapper for pixel tracking system
 * Handles communication with server-side pixel management and event logging
 */

const API_BASE = '/api';

export interface AdvertisingPixel {
  id: string;
  platform: 'google_ads' | 'meta_pixel' | 'tiktok_pixel';
  pixel_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PixelEvent {
  pixel_id: string;
  event_type: string;
  event_value?: number;
  currency?: string;
  product_id?: string;
  order_id?: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Fetch all advertising pixels
 */
export async function fetchPixels(): Promise<AdvertisingPixel[]> {
  try {
    const response = await fetch(`${API_BASE}/pixels`);
    if (!response.ok) throw new Error('Failed to fetch pixels');
    return response.json();
  } catch (error) {
    console.error('Error fetching pixels:', error);
    throw error;
  }
}

/**
 * Fetch enabled advertising pixels only
 */
export async function fetchEnabledPixels(): Promise<AdvertisingPixel[]> {
  try {
    const response = await fetch(`${API_BASE}/pixels/enabled`);
    if (!response.ok) throw new Error('Failed to fetch enabled pixels');
    return response.json();
  } catch (error) {
    console.error('Error fetching enabled pixels:', error);
    throw error;
  }
}

/**
 * Create a new advertising pixel
 */
export async function createPixel(data: {
  platform: string;
  pixel_id: string;
  is_enabled: boolean;
}): Promise<AdvertisingPixel> {
  try {
    const response = await fetch(`${API_BASE}/pixels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create pixel');
    return response.json();
  } catch (error) {
    console.error('Error creating pixel:', error);
    throw error;
  }
}

/**
 * Update an advertising pixel
 */
export async function updatePixel(
  id: string,
  data: { pixel_id?: string; is_enabled?: boolean }
): Promise<AdvertisingPixel> {
  try {
    const response = await fetch(`${API_BASE}/pixels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update pixel');
    return response.json();
  } catch (error) {
    console.error('Error updating pixel:', error);
    throw error;
  }
}

/**
 * Delete an advertising pixel
 */
export async function deletePixel(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/pixels/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete pixel');
  } catch (error) {
    console.error('Error deleting pixel:', error);
    throw error;
  }
}

/**
 * Log pixel events (single or batch)
 */
export async function logPixelEvents(events: PixelEvent | PixelEvent[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/pixel-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events),
    });
    if (!response.ok) throw new Error('Failed to log pixel events');
  } catch (error) {
    console.error('Error logging pixel events:', error);
    // Don't throw - pixel events are non-critical
  }
}

/**
 * Fetch pixel events
 */
export async function fetchPixelEvents(
  filters?: {
    limit?: number;
    offset?: number;
    pixel_id?: string;
    event_type?: string;
  }
): Promise<PixelEvent[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.pixel_id) params.append('pixel_id', filters.pixel_id);
    if (filters?.event_type) params.append('event_type', filters.event_type);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/pixel-events${query}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  } catch (error) {
    console.error('Error fetching pixel events:', error);
    throw error;
  }
}
