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
    // ロード中表示
    const loadingElement = document.createElement('div');
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.padding = '20px';
    loadingElement.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingElement.style.color = 'white';
    loadingElement.style.borderRadius = '5px';
    loadingElement.style.zIndex = '10000';
    loadingElement.textContent = 'SVG生成中...';
    document.body.appendChild(loadingElement);

    // 元の要素のスタイルを保存
    const originalWidth = rootElement.style.width;
    const originalHeight = rootElement.style.height;
    const originalOverflow = rootElement.style.overflow;
    const originalPosition = rootElement.style.position;
    
    // スクロール位置を保存
    const originalScrollTop = window.scrollY;
    
    try {
      console.log('SVG変換を開始します...');
      
      // 要素を一時的に調整
      rootElement.style.width = `${rootElement.scrollWidth}px`;
      rootElement.style.height = `${rootElement.scrollHeight}px`;
      rootElement.style.overflow = 'visible';
      rootElement.style.position = 'relative';
      
      console.log(`要素のサイズ: ${rootElement.scrollWidth}x${rootElement.scrollHeight}`);
      
      // html-to-imageのtoSvgを試行
      let svgContent;
      try {
        console.log('toSvgでの変換を試みます...');
        svgContent = await toSvg(rootElement, {
          quality: 1,
          backgroundColor: 'white',
          width: rootElement.scrollWidth,
          height: rootElement.scrollHeight,
          filter: (node) => {
            // iframeやcanvasなどSVG変換で問題を起こす可能性のある要素を除外
            return !['iframe', 'canvas'].includes(node.tagName?.toLowerCase() || '');
          },
          skipFonts: true, // フォント関連の問題を回避
        });
        console.log('toSvgでの変換に成功しました');
      } catch (svgError) {
        console.warn('toSvgでの変換に失敗しました。代替手段を試行します:', svgError);
        
        // 代替手段として、html2canvasでキャンバスに変換してからSVGに変換
        console.log('html2canvasでキャプチャします...');
        const canvas = await html2canvas(rootElement, {
          backgroundColor: 'white',
          scale: 2, // 高解像度
          logging: true, // デバッグ用
          useCORS: true, // クロスオリジン画像の処理を許可
          allowTaint: true, // セキュリティの制限を緩和
          width: rootElement.scrollWidth,
          height: rootElement.scrollHeight,
          windowWidth: rootElement.scrollWidth,
          windowHeight: rootElement.scrollHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
        });
        
        console.log(`キャンバスサイズ: ${canvas.width}x${canvas.height}`);
        
        // キャンバスからPNG画像として出力して、それをSVGに埋め込む
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        
        svgContent = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <img width="100%" height="100%" src="${pngDataUrl}" />
    </div>
  </foreignObject>
</svg>
        `)}`;
        
        console.log('html2canvasからSVGに変換しました');
      }
      
      if (!svgContent) {
        throw new Error('SVG生成に失敗しました');
      }
      
      console.log('SVGのサイズ:', svgContent.length);
      
      // SVGをダウンロード
      const link = document.createElement('a');
      link.download = `${fileName || 'lp-export'}.svg`;
      link.href = svgContent;
      document.body.appendChild(link); // Firefox対応のため
      link.click();
      document.body.removeChild(link); // 不要になったリンクを削除
      
      console.log('SVG変換が完了しました');
    } finally {
      // 元のスタイルを復元
      rootElement.style.width = originalWidth;
      rootElement.style.height = originalHeight;
      rootElement.style.overflow = originalOverflow;
      rootElement.style.position = originalPosition;
      
      // スクロール位置を復元
      window.scrollTo(0, originalScrollTop);
      
      // ロード表示を削除
      document.body.removeChild(loadingElement);
    }
  } catch (error) {
    console.error('SVGのエクスポートに失敗しました:', error);
    alert('SVGのエクスポートに失敗しました。別の形式でのエクスポートをお試しください。');
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
    // ロード中表示
    const loadingElement = document.createElement('div');
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.padding = '20px';
    loadingElement.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingElement.style.color = 'white';
    loadingElement.style.borderRadius = '5px';
    loadingElement.style.zIndex = '10000';
    loadingElement.textContent = 'PNG生成中...';
    document.body.appendChild(loadingElement);

    // 元の要素のスタイルを保存
    const originalWidth = rootElement.style.width;
    const originalHeight = rootElement.style.height;
    const originalOverflow = rootElement.style.overflow;
    const originalPosition = rootElement.style.position;

    // スクロール位置を保存
    const originalScrollTop = window.scrollY;
    
    try {
      // 要素を一時的に調整
      rootElement.style.width = `${rootElement.scrollWidth}px`;
      rootElement.style.height = `${rootElement.scrollHeight}px`;
      rootElement.style.overflow = 'visible';
      rootElement.style.position = 'relative';
      
      const pngContent = await toPng(rootElement, {
        quality: 0.95,
        backgroundColor: 'white',
        width: rootElement.scrollWidth,
        height: rootElement.scrollHeight,
        pixelRatio: 2, // 高解像度
      });
      
      // PNGをダウンロード
      saveAs(pngContent, `${fileName || 'lp-export'}.png`);
    } finally {
      // 元のスタイルを復元
      rootElement.style.width = originalWidth;
      rootElement.style.height = originalHeight;
      rootElement.style.overflow = originalOverflow;
      rootElement.style.position = originalPosition;
      
      // スクロール位置を復元
      window.scrollTo(0, originalScrollTop);
      
      // ロード表示を削除
      document.body.removeChild(loadingElement);
    }
  } catch (error) {
    console.error('PNGのエクスポートに失敗しました:', error);
    alert('PNGのエクスポートに失敗しました。別の形式でのエクスポートをお試しください。');
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
      console.log('複数形式エクスポート: SVG生成を開始します...');
      
      // 元の要素のスタイルを保存
      const originalWidth = rootElement.style.width;
      const originalHeight = rootElement.style.height;
      const originalOverflow = rootElement.style.overflow;
      const originalPosition = rootElement.style.position;

      // 要素を一時的に調整
      rootElement.style.width = `${rootElement.scrollWidth}px`;
      rootElement.style.height = `${rootElement.scrollHeight}px`;
      rootElement.style.overflow = 'visible';
      rootElement.style.position = 'relative';

      console.log(`要素のサイズ: ${rootElement.scrollWidth}x${rootElement.scrollHeight}`);
      
      // SVG生成を試行
      let svgContent;
      try {
        console.log('toSvgでの変換を試みます...');
        svgContent = await toSvg(rootElement, {
          quality: 1,
          backgroundColor: 'white',
          width: rootElement.scrollWidth,
          height: rootElement.scrollHeight,
          filter: (node) => {
            // iframeやcanvasなどSVG変換で問題を起こす可能性のある要素を除外
            return !['iframe', 'canvas'].includes(node.tagName?.toLowerCase() || '');
          },
          skipFonts: true, // フォント関連の問題を回避
        });
        console.log('toSvgでの変換に成功しました');
      } catch (svgError) {
        console.warn('toSvgでの変換に失敗しました。代替手段を試行します:', svgError);
        
        // 代替手段として、html2canvasでキャンバスに変換してからSVGに変換
        console.log('html2canvasでキャプチャします...');
        const canvas = await html2canvas(rootElement, {
          backgroundColor: 'white',
          scale: 2, // 高解像度
          logging: false,
          useCORS: true, // クロスオリジン画像の処理を許可
          allowTaint: true, // セキュリティの制限を緩和
          width: rootElement.scrollWidth,
          height: rootElement.scrollHeight,
          windowWidth: rootElement.scrollWidth,
          windowHeight: rootElement.scrollHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
        });
        
        console.log(`キャンバスサイズ: ${canvas.width}x${canvas.height}`);
        
        // キャンバスからPNG画像として出力して、それをSVGに埋め込む
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        
        svgContent = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <img width="100%" height="100%" src="${pngDataUrl}" />
    </div>
  </foreignObject>
</svg>
        `)}`;
        
        console.log('html2canvasからSVGに変換しました');
      }
      
      // 元のスタイルを復元
      rootElement.style.width = originalWidth;
      rootElement.style.height = originalHeight;
      rootElement.style.overflow = originalOverflow;
      rootElement.style.position = originalPosition;
      
      // データURLからBlobに変換
      const response = await fetch(svgContent);
      const blob = await response.blob();
      
      console.log('SVGをZIPに追加します...');
      zip.file('svg/export.svg', blob);
    } catch (error) {
      console.error('SVGのエクスポートに失敗しました:', error);
    }
  }
  
  // PNG形式のエクスポート
  if (formats.includes('png')) {
    try {
      // 元の要素のスタイルを保存
      const originalWidth = rootElement.style.width;
      const originalHeight = rootElement.style.height;
      const originalOverflow = rootElement.style.overflow;
      const originalPosition = rootElement.style.position;

      // 要素を一時的に調整
      rootElement.style.width = `${rootElement.scrollWidth}px`;
      rootElement.style.height = `${rootElement.scrollHeight}px`;
      rootElement.style.overflow = 'visible';
      rootElement.style.position = 'relative';
      
      const pngContent = await toPng(rootElement, {
        quality: 0.95,
        backgroundColor: 'white',
        width: rootElement.scrollWidth,
        height: rootElement.scrollHeight,
        pixelRatio: 2, // 高解像度
      });
      
      // 元のスタイルを復元
      rootElement.style.width = originalWidth;
      rootElement.style.height = originalHeight;
      rootElement.style.overflow = originalOverflow;
      rootElement.style.position = originalPosition;
      
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
