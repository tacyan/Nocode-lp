/**
 * ヘッダーコンポーネント
 * 
 * アプリケーションのヘッダー部分を表示するコンポーネント
 * アプリ名とエクスポートボタンなどのアクションを含む
 * @module Header
 */

import React, { useState } from 'react';
import { useEditorStore, Section } from '../store/editorStore';
import { 
  exportToPowerPoint, 
  exportToHtml, 
  exportToSvg, 
  exportToPng,
  exportToAllFormats
} from '../utils/exportUtils';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  SaveAlt as SaveIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

/**
 * ヘッダーコンポーネントのプロパティ
 * @interface HeaderProps
 * @property {React.RefObject<HTMLDivElement>} previewRef - プレビュー要素への参照
 */
interface HeaderProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * LPエディタのヘッダーコンポーネント
 * 
 * @param {HeaderProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} - ヘッダーコンポーネント
 */
const Header: React.FC<HeaderProps> = ({ previewRef }) => {
  const { sections } = useEditorStore();
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('NoCode LP');
  const [selectedFormats, setSelectedFormats] = useState<{
    pptx: boolean;
    html: boolean;
    svg: boolean;
    png: boolean;
  }>({
    pptx: true,
    html: true,
    svg: false,
    png: false,
  });

  /**
   * エクスポートメニューを開く
   * @param {React.MouseEvent<HTMLButtonElement>} event - クリックイベント
   */
  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  /**
   * エクスポートメニューを閉じる
   */
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  /**
   * エクスポートダイアログを開く
   */
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
    handleExportClose();
  };

  /**
   * エクスポートダイアログを閉じる
   */
  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
  };

  /**
   * フォーマット選択の変更を処理する
   * @param {React.ChangeEvent<HTMLInputElement>} event - チェックボックスの変更イベント
   */
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFormats({
      ...selectedFormats,
      [event.target.name]: event.target.checked,
    });
  };

  /**
   * 選択したフォーマットでエクスポートを実行する
   */
  const handleExport = () => {
    if (!previewRef.current) {
      alert('プレビューが読み込まれていません');
      return;
    }

    const formats = Object.entries(selectedFormats)
      .filter(([_, isSelected]) => isSelected)
      .map(([format]) => format) as Array<'pptx' | 'html' | 'svg' | 'png'>;

    if (formats.length === 0) {
      alert('エクスポート形式を選択してください');
      return;
    }

    exportToAllFormats(previewRef.current, sections, projectTitle, formats);
    handleCloseExportDialog();
  };

  /**
   * 単一のフォーマットでエクスポートを実行する
   * @param {string} format - エクスポート形式
   */
  const handleSingleFormatExport = (format: string) => {
    if (!previewRef.current) {
      alert('プレビューが読み込まれていません');
      return;
    }

    switch (format) {
      case 'pptx':
        exportToPowerPoint(sections, projectTitle);
        break;
      case 'html':
        exportToHtml(previewRef.current, projectTitle);
        break;
      case 'svg':
        exportToSvg(previewRef.current, projectTitle);
        break;
      case 'png':
        exportToPng(previewRef.current, projectTitle);
        break;
    }

    handleExportClose();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NoCode LP Builder
        </Typography>

        <Button
          startIcon={<SaveIcon />}
          onClick={handleExportClick}
          variant="contained"
          color="primary"
        >
          エクスポート
        </Button>

        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleExportClose}
        >
          <MenuItem onClick={() => handleSingleFormatExport('pptx')}>PowerPoint (.pptx)</MenuItem>
          <MenuItem onClick={() => handleSingleFormatExport('html')}>HTML (.zip)</MenuItem>
          <MenuItem onClick={() => handleSingleFormatExport('svg')}>SVG</MenuItem>
          <MenuItem onClick={() => handleSingleFormatExport('png')}>PNG</MenuItem>
          <MenuItem onClick={handleOpenExportDialog}>複数形式を選択...</MenuItem>
        </Menu>

        <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog}>
          <DialogTitle>エクスポート設定</DialogTitle>
          <DialogContent>
            <DialogContentText>
              エクスポートするファイル形式と名前を選択してください
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="プロジェクト名"
              fullWidth
              variant="outlined"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">エクスポート形式</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFormats.pptx}
                      onChange={handleFormatChange}
                      name="pptx"
                    />
                  }
                  label="PowerPoint (.pptx)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFormats.html}
                      onChange={handleFormatChange}
                      name="html"
                    />
                  }
                  label="HTML (.zip)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFormats.svg}
                      onChange={handleFormatChange}
                      name="svg"
                    />
                  }
                  label="SVG"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFormats.png}
                      onChange={handleFormatChange}
                      name="png"
                    />
                  }
                  label="PNG"
                />
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExportDialog}>キャンセル</Button>
            <Button onClick={handleExport} variant="contained" color="primary">
              エクスポート
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
