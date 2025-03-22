/**
 * セクションテンプレート
 * 
 * 各セクションタイプに適したデフォルトの要素を含むテンプレートを提供する
 * addSectionアクションで使用される
 * @module sectionTemplates
 */

import { v4 as uuidv4 } from 'uuid';
import { SectionType, TextElement, ImageElement, ButtonElement } from '../store/editorStore';

/**
 * セクションタイプごとのテンプレートデータを生成する
 * @param {SectionType} type - セクションのタイプ
 * @returns {Array<TextElement | ImageElement | ButtonElement>} - デフォルト要素の配列
 */
export const getSectionTemplateElements = (
  type: SectionType
): Array<TextElement | ImageElement | ButtonElement> => {
  // 共通のIDジェネレーター
  const createId = () => uuidv4();
  
  switch (type) {
    case 'hero':
      return [
        {
          id: createId(),
          type: 'text',
          content: 'あなたのビジネスを次のレベルへ',
          fontSize: '48',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '革新的なサービスで課題を解決し、成長をサポートします',
          fontSize: '24',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'image',
          src: 'https://via.placeholder.com/1200x600?text=Hero+Image',
          alt: 'ヒーローイメージ',
          width: '100',
          height: 'auto',
        } as ImageElement,
        {
          id: createId(),
          type: 'button',
          label: '今すぐ始める',
          url: '#contact',
          backgroundColor: '#1976d2',
          textColor: '#ffffff',
          borderRadius: '4',
        } as ButtonElement,
      ];
      
    case 'feature':
      return [
        {
          id: createId(),
          type: 'text',
          content: '主な特徴',
          fontSize: '36',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '当社のサービスが選ばれる理由',
          fontSize: '20',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '✅ 高品質なサービス提供',
          fontSize: '18',
          color: '#333333',
          fontWeight: 'normal',
          textAlign: 'left',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '✅ 迅速なサポート体制',
          fontSize: '18',
          color: '#333333',
          fontWeight: 'normal',
          textAlign: 'left',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '✅ 柔軟なカスタマイズ',
          fontSize: '18',
          color: '#333333',
          fontWeight: 'normal',
          textAlign: 'left',
        } as TextElement,
      ];
      
    case 'pricing':
      return [
        {
          id: createId(),
          type: 'text',
          content: '料金プラン',
          fontSize: '36',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'あなたのニーズに合わせた最適なプランをご用意',
          fontSize: '20',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'スタンダードプラン: 月額¥10,000〜',
          fontSize: '24',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'プレミアムプラン: 月額¥30,000〜',
          fontSize: '24',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'button',
          label: '詳細を見る',
          url: '#contact',
          backgroundColor: '#1976d2',
          textColor: '#ffffff',
          borderRadius: '4',
        } as ButtonElement,
      ];
      
    case 'testimonial':
      return [
        {
          id: createId(),
          type: 'text',
          content: 'お客様の声',
          fontSize: '36',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '「このサービスを使い始めてから、業務効率が大幅に改善しました。本当に感謝しています。」',
          fontSize: '20',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: '〜山田太郎様 / 株式会社〇〇〇〇',
          fontSize: '16',
          color: '#999999',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'image',
          src: 'https://via.placeholder.com/150x150?text=Avatar',
          alt: 'お客様の写真',
          width: '30',
          height: 'auto',
        } as ImageElement,
      ];
      
    case 'contact':
      return [
        {
          id: createId(),
          type: 'text',
          content: 'お問い合わせ',
          fontSize: '36',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'ご質問やご相談がございましたら、お気軽にお問い合わせください',
          fontSize: '20',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'メール: info@example.com\n電話: 03-1234-5678',
          fontSize: '18',
          color: '#333333',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'button',
          label: 'メールを送る',
          url: 'mailto:info@example.com',
          backgroundColor: '#1976d2',
          textColor: '#ffffff',
          borderRadius: '4',
        } as ButtonElement,
      ];
      
    case 'footer':
      return [
        {
          id: createId(),
          type: 'text',
          content: '© 2024 あなたの会社名. All Rights Reserved.',
          fontSize: '14',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'プライバシーポリシー | 利用規約 | 特定商取引法に基づく表記',
          fontSize: '14',
          color: '#1976d2',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
      ];
      
    case 'custom':
    default:
      return [
        {
          id: createId(),
          type: 'text',
          content: 'カスタムセクション',
          fontSize: '36',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'center',
        } as TextElement,
        {
          id: createId(),
          type: 'text',
          content: 'こちらは自由にカスタマイズできるセクションです',
          fontSize: '20',
          color: '#666666',
          fontWeight: 'normal',
          textAlign: 'center',
        } as TextElement,
      ];
  }
};

/**
 * セクションタイプごとの背景色を取得する
 * @param {SectionType} type - セクションのタイプ
 * @returns {string} - 背景色のHEXコード
 */
export const getSectionBackgroundColor = (type: SectionType): string => {
  switch (type) {
    case 'hero':
      return '#f5f9ff';
    case 'feature':
      return '#ffffff';
    case 'pricing':
      return '#f5f5f5';
    case 'testimonial':
      return '#f0f7ff';
    case 'contact':
      return '#ffffff';
    case 'footer':
      return '#333333';
    case 'custom':
    default:
      return '#ffffff';
  }
};

/**
 * セクションタイプの日本語名を取得する
 * @param {SectionType} type - セクションのタイプ
 * @returns {string} - 日本語の表示名
 */
export const getSectionTypeName = (type: SectionType): string => {
  switch (type) {
    case 'hero':
      return 'ヒーロー';
    case 'feature':
      return '特徴';
    case 'pricing':
      return '料金';
    case 'testimonial':
      return 'お客様の声';
    case 'contact':
      return 'お問い合わせ';
    case 'footer':
      return 'フッター';
    case 'custom':
    default:
      return 'カスタム';
  }
}; 
