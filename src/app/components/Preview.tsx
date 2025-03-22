/**
 * プレビューコンポーネント
 * 
 * 現在のLPをリアルタイムでプレビュー表示するコンポーネント
 * エクスポート用の参照を提供する
 * @module Preview
 */

import React, { forwardRef } from 'react';
import { useEditorStore, TextElement, ImageElement, ButtonElement } from '../store/editorStore';
import { Box, Paper, Typography, Button as MuiButton } from '@mui/material';

/**
 * プレビューコンポーネントのプロパティ
 * @interface PreviewProps
 */
interface PreviewProps {}

/**
 * LP要素をレンダリングするコンポーネント
 * 
 * @param {TextElement | ImageElement | ButtonElement} element - レンダリングする要素
 * @returns {JSX.Element} - レンダリングされた要素
 */
const ElementRenderer: React.FC<{
  element: TextElement | ImageElement | ButtonElement;
}> = ({ element }) => {
  switch (element.type) {
    case 'text':
      return (
        <Typography
          style={{
            fontSize: `${element.fontSize}px`,
            color: element.color,
            fontWeight: element.fontWeight,
            textAlign: element.textAlign as any,
            width: '100%',
            marginBottom: '16px',
          }}
        >
          {element.content}
        </Typography>
      );
      
    case 'image':
      return (
        <Box
          component="img"
          src={element.src}
          alt={element.alt}
          sx={{
            width: `${element.width}%`,
            height: 'auto',
            display: 'block',
            marginBottom: '16px',
          }}
        />
      );
      
    case 'button':
      return (
        <MuiButton
          variant="contained"
          href={element.url}
          sx={{
            backgroundColor: element.backgroundColor,
            color: element.textColor,
            borderRadius: `${element.borderRadius}px`,
            marginBottom: '16px',
          }}
        >
          {element.label}
        </MuiButton>
      );
      
    default:
      return null;
  }
};

/**
 * LPのプレビューコンポーネント
 * 
 * forwardRefを使用してエクスポート用の参照を外部に提供
 * @param {PreviewProps} props - コンポーネントのプロパティ
 * @param {React.Ref<HTMLDivElement>} ref - 転送される参照
 * @returns {JSX.Element} - プレビューコンポーネント
 */
const Preview = forwardRef<HTMLDivElement, PreviewProps>((props, ref) => {
  const { sections } = useEditorStore();
  
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" gutterBottom>
        プレビュー
      </Typography>
      
      <Box
        ref={ref}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5',
        }}
      >
        {sections.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              セクションがありません。<br />
              左側のパネルからセクションを追加してください。
            </Typography>
          </Box>
        ) : (
          sections.map((section) => (
            <Box
              key={section.id}
              sx={{
                p: 4,
                backgroundColor: section.backgroundColor,
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ width: '100%', textAlign: 'center', mb: 3 }}
              >
                {section.title}
              </Typography>
              
              <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {section.elements.map((element) => (
                  <ElementRenderer key={element.id} element={element} />
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
});

// 表示名を設定
Preview.displayName = 'Preview';

export default Preview; 
