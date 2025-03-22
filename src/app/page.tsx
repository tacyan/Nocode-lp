/**
 * NoCode LPビルダーのメインページ
 * 
 * アプリケーションのメインページコンポーネント
 * ヘッダー、セクションリスト、エディタ、プレビューを配置
 * @module MainPage
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import Header from './components/Header';
import SectionsList from './components/SectionsList';
import SectionEditor from './components/SectionEditor';
import Preview from './components/Preview';
import ThemeRegistry from './components/ThemeRegistry';

/**
 * スタイルの適用を待機するためのラッパーコンポーネント
 * @param {React.PropsWithChildren} props - 子コンポーネント
 * @returns {JSX.Element} - コンポーネント
 */
const ClientOnly: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div id="loading-client-only" suppressHydrationWarning></div>;
  }

  return <>{children}</>;
};

/**
 * メインページコンポーネント
 * 
 * @returns {JSX.Element} - メインページコンポーネント
 */
export default function Home() {
  // プレビュー要素への参照
  const previewRef = useRef<HTMLDivElement>(null);
  
  return (
    <ThemeRegistry>
      <ClientOnly>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header previewRef={previewRef} />
          
          <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* セクションリスト */}
              <Grid item xs={12} md={3} sx={{ height: '100%' }}>
                <SectionsList />
              </Grid>
              
              {/* セクション編集エリア */}
              <Grid item xs={12} md={4} sx={{ height: '100%' }}>
                <SectionEditor />
              </Grid>
              
              {/* プレビューエリア */}
              <Grid item xs={12} md={5} sx={{ height: '100%' }}>
                <Preview ref={previewRef} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </ClientOnly>
    </ThemeRegistry>
  );
}
