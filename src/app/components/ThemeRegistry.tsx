/**
 * テーマレジストリコンポーネント
 * 
 * MUIのテーマをクライアントサイドのみで適用するためのラッパーコンポーネント
 * ハイドレーションエラーを防止する
 * @module ThemeRegistry
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';

// クライアントサイドのキャッシュの作成
const clientSideEmotionCache = createEmotionCache();

// アプリケーションのテーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

/**
 * テーマレジストリコンポーネントのプロパティ
 * @interface ThemeRegistryProps
 * @property {React.ReactNode} children - 子要素
 */
interface ThemeRegistryProps {
  children: React.ReactNode;
}

/**
 * MUIのテーマとスタイルを適用するコンポーネント
 * 
 * @param {ThemeRegistryProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element | null} - テーマが適用された子コンポーネント
 */
export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [mounted, setMounted] = useState(false);

  // hydrationが完了するまでCSSをプリレンダリングしない
  useEffect(() => {
    // キャッシュにMUIのスタイルを登録するためにクライアントサイドでのみ実行
    document.body.classList.add('mui-ready');
    setMounted(true);
  }, []);

  // hydrationが完了するまで最小限のHTMLを返す
  if (!mounted) {
    // SSRとハイドレーションフェーズ中は最小限のコンテンツを表示
    return <div id="theme-registry-loading" suppressHydrationWarning></div>;
  }

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
} 
