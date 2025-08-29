import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const {
      user_agent,
      page_url,
      page_title,
      referrer_url,
      session_id,
      visit_duration
    } = body;

    // Get client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const visitor_ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

    // Parse user agent for device detection
    const deviceInfo = parseUserAgent(user_agent || '');
    
    // Parse referrer
    const referrerInfo = parseReferrer(referrer_url);

    // Get location data from IP (you can integrate with a geo IP service)
    const locationInfo = await getLocationFromIP(visitor_ip);

    // Check if this is a unique visitor (simplified check)
    const { data: existingVisit } = await supabase
      .from('website_analytics')
      .select('id')
      .eq('visitor_ip', visitor_ip)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    const is_unique_visitor = !existingVisit || existingVisit.length === 0;

    // If this is updating visit duration
    if (visit_duration && session_id) {
      const { error } = await supabase.rpc('update_visit_duration', {
        p_session_id: session_id,
        p_duration: visit_duration
      });

      if (error) {
        console.error('Error updating visit duration:', error);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert analytics data
    const { error } = await supabase
      .from('website_analytics')
      .insert({
        visitor_ip,
        user_agent,
        device_type: deviceInfo.device_type,
        browser_name: deviceInfo.browser_name,
        os_name: deviceInfo.os_name,
        country: locationInfo.country,
        city: locationInfo.city,
        referrer_url,
        referrer_domain: referrerInfo.domain,
        page_url,
        page_title,
        session_id,
        is_unique_visitor,
        visit_duration: null
      });

    if (error) {
      console.error('Error inserting analytics:', error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in track-analytics function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  let device_type = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua)) {
    device_type = 'mobile';
  } else if (/tablet|ipad/.test(ua)) {
    device_type = 'tablet';
  }

  // Browser detection
  let browser_name = 'unknown';
  if (ua.includes('chrome')) browser_name = 'Chrome';
  else if (ua.includes('firefox')) browser_name = 'Firefox';
  else if (ua.includes('safari')) browser_name = 'Safari';
  else if (ua.includes('edge')) browser_name = 'Edge';
  else if (ua.includes('opera')) browser_name = 'Opera';

  // OS detection
  let os_name = 'unknown';
  if (ua.includes('windows')) os_name = 'Windows';
  else if (ua.includes('mac')) os_name = 'macOS';
  else if (ua.includes('linux')) os_name = 'Linux';
  else if (ua.includes('android')) os_name = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os_name = 'iOS';

  return { device_type, browser_name, os_name };
}

function parseReferrer(referrerUrl: string) {
  if (!referrerUrl) return { domain: 'direct' };
  
  try {
    const url = new URL(referrerUrl);
    return { domain: url.hostname };
  } catch {
    return { domain: 'unknown' };
  }
}

async function getLocationFromIP(ip: string) {
  // For demo purposes, return mock data
  // In production, you'd integrate with a service like ip-api.com or ipinfo.io
  try {
    if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
      return { country: 'Unknown', city: 'Unknown' };
    }
    
    // You can integrate with a real geo IP service here
    // const response = await fetch(`http://ip-api.com/json/${ip}`);
    // const data = await response.json();
    // return { country: data.country, city: data.city };
    
    return { country: 'Unknown', city: 'Unknown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}