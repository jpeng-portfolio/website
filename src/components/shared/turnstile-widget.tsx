"use client";

import Script from "next/script";
import { useEffect, useRef, useImperativeHandle } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback": () => void;
          "expired-callback": () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export type TurnstileHandle = {
  reset: () => void;
};

type Props = {
  ref?: React.Ref<TurnstileHandle>;
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
};

export function TurnstileWidget({ ref, siteKey, onVerify, onError, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    },
  }));

  function renderWidget() {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current != null) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "error-callback": onError ?? (() => {}),
      "expired-callback": onExpire ?? (() => {}),
    });
  }

  // Handles the case where the script was already loaded (e.g. dev HMR).
  useEffect(() => {
    if (window.turnstile) renderWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div ref={containerRef} />
    </>
  );
}
