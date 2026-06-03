/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Analytics Integration Utility
 * Supports Google Analytics 4, Mixpanel, or custom analytics
 */

// Analytics event types
export type AnalyticsEvent = 
  | 'page_view'
  | 'scan_started'
  | 'scan_completed'
  | 'campaign_viewed'
  | 'pricing_viewed'
  | 'login_attempt'
  | 'login_success'
  | 'signup_started'
  | 'signup_completed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'lead_generated'
  | 'error_occurred';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private isEnabled: boolean = false;
  private debug: boolean = false;

  constructor() {
    // Check if analytics should be enabled (production only by default)
    this.isEnabled = import.meta.env.PROD || import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.debug = import.meta.env.DEV || import.meta.env.VITE_ANALYTICS_DEBUG === 'true';
    
    if (this.debug) {
      console.log('[Analytics] Initialized (Debug Mode)');
    }
  }

  /**
   * Initialize analytics providers (Google Analytics, Mixpanel, etc.)
   */
  initialize() {
    if (!this.isEnabled) {
      if (this.debug) console.log('[Analytics] Disabled in current environment');
      return;
    }

    // Google Analytics 4
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      this.initializeGoogleAnalytics(gaId);
    }

    // Mixpanel
    const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
    if (mixpanelToken) {
      this.initializeMixpanel(mixpanelToken);
    }

    if (this.debug) {
      console.log('[Analytics] Initialization complete');
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  private initializeGoogleAnalytics(measurementId: string) {
    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // We'll handle page views manually
    });

    if (this.debug) {
      console.log('[Analytics] Google Analytics initialized:', measurementId);
    }
  }

  /**
   * Initialize Mixpanel
   */
  private initializeMixpanel(token: string) {
    // Load Mixpanel script
    (function(f: any, b: any) {
      if (!b.__SV) {
        let a, e, i, g;
        window.mixpanel = b;
        b._i = [];
        b.init = function(a: any, e: any, d: any) {
          function f(b: any, h: any) {
            const a = h.split(".");
            2 == a.length && ((b = b[a[0]]), (h = a[1]));
            b[h] = function() {
              b.push([h].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          let c = b;
          "undefined" !== typeof d ? (c = b[d] = []) : (d = "mixpanel");
          c.people = c.people || [];
          c.toString = function(b: any) {
            let a = "mixpanel";
            "mixpanel" !== d && (a += "." + d);
            b || (a += " (stub)");
            return a;
          };
          c.people.toString = function() {
            return c.toString(1) + ".people (stub)";
          };
          i = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
          for (g = 0; g < i.length; g++) f(c, i[g]);
          const j = "set set_once union unset remove delete".split(" ");
          c.get_group = function() {
            function a(c: any) {
              b[c] = function() {
                call2_args = arguments;
                call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
                b.push([d, call2]);
              };
            }
            for (let b = [], d = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)), c = 0; c < j.length; c++) a(j[c]);
            return b;
          };
          b._i.push([a, e, d]);
        };
        b.__SV = 1.2;
        a = f.createElement("script");
        a.type = "text/javascript";
        a.async = !0;
        a.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === f.location.protocol && "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
        e = f.getElementsByTagName("script")[0];
        e.parentNode.insertBefore(a, e);
      }
    })(document, (window as any).mixpanel || []);

    (window as any).mixpanel.init(token);

    if (this.debug) {
      console.log('[Analytics] Mixpanel initialized:', token);
    }
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (this.debug) {
      console.log('[Analytics] Track:', event, properties);
    }

    if (!this.isEnabled) return;

    // Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', event, properties);
    }

    // Mixpanel
    if (typeof (window as any).mixpanel !== 'undefined') {
      (window as any).mixpanel.track(event, properties);
    }
  }

  /**
   * Track page view
   */
  pageView(pagePath: string, pageTitle?: string) {
    if (this.debug) {
      console.log('[Analytics] Page View:', pagePath, pageTitle);
    }

    if (!this.isEnabled) return;

    // Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }

    // Mixpanel
    if (typeof (window as any).mixpanel !== 'undefined') {
      (window as any).mixpanel.track('page_view', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  }

  /**
   * Identify user for analytics
   */
  identify(userId: string, traits?: AnalyticsProperties) {
    if (this.debug) {
      console.log('[Analytics] Identify:', userId, traits);
    }

    if (!this.isEnabled) return;

    // Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId,
      });
    }

    // Mixpanel
    if (typeof (window as any).mixpanel !== 'undefined') {
      (window as any).mixpanel.identify(userId);
      if (traits) {
        (window as any).mixpanel.people.set(traits);
      }
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset() {
    if (this.debug) {
      console.log('[Analytics] Reset');
    }

    if (!this.isEnabled) return;

    // Mixpanel
    if (typeof (window as any).mixpanel !== 'undefined') {
      (window as any).mixpanel.reset();
    }
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Auto-initialize on import
analytics.initialize();
