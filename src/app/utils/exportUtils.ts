/**
 * エクスポートユーティリティ
 * 
 * エディタで作成したLPをさまざまな形式(PowerPoint, HTML, SVG)にエクスポートするためのユーティリティ関数
 * @module exportUtils
 */

import PptxGenJS from 'pptxgenjs';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { Section } from '../store/editorStore';

/**
 * HTMLをPowerPointに変換して保存する
 * @param {Section[]} sections - セクションの配列
 * @param {string} title - プレゼンテーションのタイトル
 * @returns {Promise<void>}
 */
export const exportToPowerPoint = async (sections: Section[], title: string): Promise<void> => {
  // PowerPointインスタンスを作成
  const pptx = new PptxGenJS();
  
  // プレゼンテーションのプロパティを設定
  pptx.title = title;
  pptx.subject = 'LPエクスポート';
  pptx.author = 'NoCode LP Builder';
  
  // 各セクションをスライドに変換
  for (const section of sections) {
    // スライドを追加
    const slide = pptx.addSlide();
    
    // 背景色を設定
    slide.background = { color: section.backgroundColor };
    
    // タイトルを追加
    slide.addText(section.title, {
      x: 1,
      y: 0.5,
      w: '90%',
      fontSize: 24,
      bold: true,
      color: '000000',
    });
    
    // セクション内の要素を処理
    let yPosition = 1.5; // タイトルの下から要素を配置
    
    for (const element of section.elements) {
      switch (element.type) {
        case 'text':
          slide.addText(element.content, {
            x: 1,
            y: yPosition,
            w: '90%',
            fontSize: parseInt(element.fontSize, 10),
            color: element.color.replace('#', ''),
            bold: element.fontWeight === 'bold',
            align: element.textAlign as any,
          });
          yPosition += 0.5;
          break;
          
        case 'image':
          if (element.src) {
            try {
              // 画像URLから画像を取得して追加
              slide.addImage({
                path: element.src,
                x: 1,
                y: yPosition,
                w: parseInt(element.width) / 100, // パーセントから比率に変換
                h: parseInt(element.height) / 100, // パーセントから比率に変換
              });
              yPosition += parseInt(element.height) / 100 + 0.5;
            } catch (error) {
              console.error('画像の追加に失敗しました:', error);
            }
          }
          break;
          
        case 'button':
          slide.addText(element.label, {
            x: 1,
            y: yPosition,
            w: 2,
            h: 0.5,
            fontSize: 12,
            color: element.textColor.replace('#', ''),
            fill: { color: element.backgroundColor.replace('#', '') },
            align: 'center',
            valign: 'middle',
            shape: 'roundRect',
            hyperlink: { url: element.url },
          });
          yPosition += 0.8;
          break;
      }
    }
  }
  
  // ファイルを保存
  pptx.writeFile({ fileName: `${title || 'presentation'}.pptx` });
};

/**
 * HTMLをHTMLファイルにエクスポートしてzip形式でダウンロードする
 * @param {HTMLElement} rootElement - エクスポートするHTML要素
 * @param {string} title - HTMLファイルのタイトル
 * @returns {Promise<void>}
 */
export const exportToHtml = async (rootElement: HTMLElement, title: string): Promise<void> => {
  // スタイルシートを取得
  const stylesheets = Array.from(document.styleSheets);
  let cssText = '';
  
  // スタイルシートのルールを抽出
  stylesheets.forEach((sheet) => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      for (let i = 0; i < rules.length; i++) {
        cssText += rules[i].cssText + '\n';
      }
    } catch (e) {
      console.warn('スタイルシートの読み込みに失敗しました:', e);
    }
  });
  
  // HTMLのクローンを作成
  const clone = rootElement.cloneNode(true) as HTMLElement;
  
  // 不要な属性やイベントハンドラを削除
  const cleanElement = (element: HTMLElement) => {
    element.removeAttribute('data-testid');
    element.removeAttribute('draggable');
    // Next.jsの属性を削除
    element.removeAttribute('data-reactroot');
    
    // 子要素も再帰的に処理
    Array.from(element.children).forEach((child) => {
      cleanElement(child as HTMLElement);
    });
  };
  
  cleanElement(clone);
  
  // HTML文字列を作成
  const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'LP Export'}</title>
  <style>
    ${cssText}
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>
  `;
  
  // ZIPファイルを作成
  const zip = new JSZip();
  zip.file('index.html', htmlContent);
  
  // ZIPをダウンロード
  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, `${title || 'lp-export'}.zip`);
};

/**
 * HTMLをSVGにエクスポートして保存する
 * @param {HTMLElement} rootElement - エクスポートするHTML要素
 * @param {string} fileName - 保存するファイル名
 * @returns {Promise<void>}
 */
export const exportToSvg = async (rootElement: HTMLElement, fileName: string): Promise<void> => {
  try {
    const svgContent = await toSvg(rootElement, {
      quality: 1,
      backgroundColor: 'white',
    });
    
    // SVGをダウンロード
    const link = document.createElement('a');
    link.download = `${fileName || 'lp-export'}.svg`;
    link.href = svgContent;
    link.click();
  } catch (error) {
    console.error('SVGのエクスポートに失敗しました:', error);
    throw error;
  }
};

/**
 * HTMLをPNG画像にエクスポートして保存する
 * @param {HTMLElement} rootElement - エクスポートするHTML要素
 * @param {string} fileName - 保存するファイル名
 * @returns {Promise<void>}
 */
export const exportToPng = async (rootElement: HTMLElement, fileName: string): Promise<void> => {
  try {
    const pngContent = await toPng(rootElement, {
      quality: 0.95,
      backgroundColor: 'white',
    });
    
    // PNGをダウンロード
    saveAs(pngContent, `${fileName || 'lp-export'}.png`);
  } catch (error) {
    console.error('PNGのエクスポートに失敗しました:', error);
    throw error;
  }
};

/**
 * 複数のエクスポート形式をZIPファイルにまとめてダウンロードする
 * @param {HTMLElement} rootElement - エクスポートするHTML要素
 * @param {Section[]} sections - セクションの配列
 * @param {string} title - エクスポートするファイルのタイトル
 * @param {Array<'pptx' | 'html' | 'svg' | 'png'>} formats - エクスポートする形式の配列
 * @returns {Promise<void>}
 */
export const exportToAllFormats = async (
  rootElement: HTMLElement,
  sections: Section[],
  title: string,
  formats: Array<'pptx' | 'html' | 'svg' | 'png'>
): Promise<void> => {
  const zip = new JSZip();
  
  // HTML形式のエクスポート
  if (formats.includes('html')) {
    // スタイルシートを取得
    const stylesheets = Array.from(document.styleSheets);
    let cssText = '';
    
    // スタイルシートのルールを抽出
    stylesheets.forEach((sheet) => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (let i = 0; i < rules.length; i++) {
          cssText += rules[i].cssText + '\n';
        }
      } catch (e) {
        console.warn('スタイルシートの読み込みに失敗しました:', e);
      }
    });
    
    // HTMLのクローンを作成
    const clone = rootElement.cloneNode(true) as HTMLElement;
    
    // 不要な属性を削除
    const cleanElement = (element: HTMLElement) => {
      element.removeAttribute('data-testid');
      element.removeAttribute('draggable');
      element.removeAttribute('data-reactroot');
      
      Array.from(element.children).forEach((child) => {
        cleanElement(child as HTMLElement);
      });
    };
    
    cleanElement(clone);
    
    // HTML文字列を作成
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'LP Export'}</title>
  <style>
    ${cssText}
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>
    `;
    
    zip.file('html/index.html', htmlContent);
  }
  
  // PowerPoint形式のエクスポート
  if (formats.includes('pptx')) {
    const pptx = new PptxGenJS();
    pptx.title = title;
    pptx.subject = 'LPエクスポート';
    pptx.author = 'NoCode LP Builder';
    
    for (const section of sections) {
      const slide = pptx.addSlide();
      slide.background = { color: section.backgroundColor };
      
      slide.addText(section.title, {
        x: 1,
        y: 0.5,
        w: '90%',
        fontSize: 24,
        bold: true,
        color: '000000',
      });
      
      let yPosition = 1.5;
      
      for (const element of section.elements) {
        switch (element.type) {
          case 'text':
            slide.addText(element.content, {
              x: 1,
              y: yPosition,
              w: '90%',
              fontSize: parseInt(element.fontSize, 10),
              color: element.color.replace('#', ''),
              bold: element.fontWeight === 'bold',
              align: element.textAlign as any,
            });
            yPosition += 0.5;
            break;
            
          case 'image':
            if (element.src) {
              try {
                slide.addImage({
                  path: element.src,
                  x: 1,
                  y: yPosition,
                  w: parseInt(element.width) / 100,
                  h: parseInt(element.height) / 100,
                });
                yPosition += parseInt(element.height) / 100 + 0.5;
              } catch (error) {
                console.error('画像の追加に失敗しました:', error);
              }
            }
            break;
            
          case 'button':
            slide.addText(element.label, {
              x: 1,
              y: yPosition,
              w: 2,
              h: 0.5,
              fontSize: 12,
              color: element.textColor.replace('#', ''),
              fill: { color: element.backgroundColor.replace('#', '') },
              align: 'center',
              valign: 'middle',
              shape: 'roundRect',
              hyperlink: { url: element.url },
            });
            yPosition += 0.8;
            break;
        }
      }
    }
    
    // PowerPointファイルをBlobとして取得
    const pptxData = await pptx.write({ outputType: 'blob' });
    zip.file('pptx/presentation.pptx', pptxData);
  }
  
  // SVG形式のエクスポート
  if (formats.includes('svg')) {
    try {
      const svgContent = await toSvg(rootElement, {
        quality: 1,
        backgroundColor: 'white',
      });
      
      // データURLからBlobに変換
      const response = await fetch(svgContent);
      const blob = await response.blob();
      
      zip.file('svg/export.svg', blob);
    } catch (error) {
      console.error('SVGのエクスポートに失敗しました:', error);
    }
  }
  
  // PNG形式のエクスポート
  if (formats.includes('png')) {
    try {
      const pngContent = await toPng(rootElement, {
        quality: 0.95,
        backgroundColor: 'white',
      });
      
      // データURLからBlobに変換
      const response = await fetch(pngContent);
      const blob = await response.blob();
      
      zip.file('png/export.png', blob);
    } catch (error) {
      console.error('PNGのエクスポートに失敗しました:', error);
    }
  }
  
  // ZIPをダウンロード
  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, `${title || 'lp-export'}_all.zip`);
}; 
