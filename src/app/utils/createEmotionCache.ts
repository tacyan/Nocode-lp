/**
 * Emotionキャッシュ作成ユーティリティ
 * 
 * MUIのSSRとCSRの間のスタイル不一致を防ぐためのEmotionキャッシュを作成する
 * @module createEmotionCache
 */

import createCache from '@emotion/cache';

/**
 * クライアントサイド用のEmotionキャッシュを作成する
 * @returns {ReturnType<typeof createCache>} キャッシュインスタンス
 */
export default function createEmotionCache() {
  return createCache({ key: 'css' });
} 
