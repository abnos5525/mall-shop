'use client';

import { useEffect, useState } from 'react';

export type TelegramBridgeState =
  | { status: 'loading' }
  | { status: 'unsupported'; message: string }
  | { status: 'ready'; initData: string; isTelegram: true }
  | { status: 'browser'; message: string };

export function useTelegramWebApp(): TelegramBridgeState {
  const [state, setState] = useState<TelegramBridgeState>({ status: 'loading' });

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (!telegram) {
      setState({
        status: 'browser',
        message: 'این صفحه در مرورگر باز شده است. برای ورود تلگرام، مینی‌اپ را از داخل تلگرام باز کنید.',
      });
      return;
    }

    telegram.ready();
    const initData = telegram.initData?.trim();
    if (!initData) {
      setState({
        status: 'unsupported',
        message: 'initData از تلگرام دریافت نشد. از initDataUnsafe استفاده نمی‌کنیم.',
      });
      return;
    }

    setState({ status: 'ready', initData, isTelegram: true });
  }, []);

  return state;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        initData?: string;
      };
    };
  }
}