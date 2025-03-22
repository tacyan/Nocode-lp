/**
 * @fileoverview ZIPファイル作成スクリプト
 * @description NoCode LPプロジェクトをZIPファイルにパッケージングするためのスクリプト
 */

const fs = require('fs');
const path = require('path');
let archiver;

try {
  archiver = require('archiver');
} catch (e) {
  console.error('archiver パッケージが見つかりません。以下のコマンドでインストールしてください:');
  console.error('npm install archiver');
  process.exit(1);
}

/**
 * ディレクトリをアーカイブに追加する
 * @param {Object} archive - archiverオブジェクト
 * @param {string} directoryPath - 追加するディレクトリのパス
 * @param {string} basePath - ベースディレクトリのパス
 */
function addDirectoryToArchive(archive, directoryPath, basePath) {
  // 除外するディレクトリ
  const excludeDirs = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    '.github',
    'coverage'
  ];

  // 除外するファイル
  const excludeFiles = [
    '.zip',
    '.DS_Store',
    '.gitignore',
    '.npmrc'
  ];

  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    const fullPath = path.join(directoryPath, file);
    const relativePath = path.relative(basePath, fullPath);
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // ディレクトリの場合
      const dirName = path.basename(fullPath);
      if (!excludeDirs.includes(dirName)) {
        addDirectoryToArchive(archive, fullPath, basePath);
      }
    } else {
      // ファイルの場合
      const extname = path.extname(file);
      if (!excludeFiles.includes(extname) && !excludeFiles.includes(file)) {
        archive.file(fullPath, { name: relativePath });
      }
    }
  });
}

/**
 * メイン処理
 */
async function main() {
  try {
    // ルートディレクトリを取得
    const rootDir = path.resolve(__dirname, '..');
    const outputFile = path.join(rootDir, 'nocode-lp.zip');
    
    // 既存のZIPファイルがあれば削除
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
      console.log(`既存の ${outputFile} を削除しました`);
    }
    
    // 出力ストリームを作成
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最大圧縮レベル
    });
    
    // イベントリスナーを設定
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`ZIPファイルの作成が完了しました: ${outputFile} (${sizeInMB} MB)`);
    });
    
    output.on('error', (err) => {
      throw err;
    });
    
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('警告:', err);
      } else {
        throw err;
      }
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    // アーカイブをストリームにパイプ
    archive.pipe(output);
    
    // ディレクトリをアーカイブに追加
    console.log('ファイルをZIPアーカイブに追加しています...');
    addDirectoryToArchive(archive, rootDir, rootDir);
    
    // アーカイブを完了
    await archive.finalize();
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
main(); 
