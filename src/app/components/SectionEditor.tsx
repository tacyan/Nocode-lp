/**
 * セクション編集コンポーネント
 * 
 * 選択されたセクションのプロパティを編集するためのコンポーネント
 * セクションのタイトルや背景色などを編集できる
 * @module SectionEditor
 */

import React from 'react';
import { useEditorStore, Section, TextElement, ImageElement, ButtonElement } from '../store/editorStore';
import { v4 as uuidv4 } from 'uuid';
import {
  Paper,
  Typography,
  TextField,
  Box,
  Button,
  Divider,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  SmartButton as ButtonIcon,
} from '@mui/icons-material';

/**
 * セクション編集コンポーネント
 * 
 * @returns {JSX.Element} - セクション編集コンポーネント
 */
const SectionEditor: React.FC = () => {
  const { 
    sections, 
    selectedSectionId,
    updateSection,
    addElement,
    removeElement,
    updateElement,
    selectedElementId,
    selectElement,
  } = useEditorStore();
  
  // 選択されたセクションを取得
  const selectedSection = sections.find((section) => section.id === selectedSectionId);
  
  // 選択された要素を取得
  const selectedElement = selectedSection?.elements.find(
    (element) => element.id === selectedElementId
  );
  
  // アクティブなタブ
  const [activeTab, setActiveTab] = React.useState(0);
  
  /**
   * タブ変更時の処理
   * @param {React.SyntheticEvent} event - タブ変更イベント
   * @param {number} newValue - 新しいタブのインデックス
   */
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  if (!selectedSection) {
    return (
      <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          セクションエディタ
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            編集するセクションを選択してください
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  /**
   * セクションのプロパティを更新する
   * @param {string} property - 更新するプロパティ名
   * @param {any} value - 新しい値
   */
  const handleSectionUpdate = (property: string, value: any) => {
    updateSection(selectedSection.id, { [property]: value });
  };
  
  /**
   * テキスト要素を追加する
   */
  const handleAddTextElement = () => {
    const newElement: TextElement = {
      id: uuidv4(),
      type: 'text',
      content: 'テキストを入力してください',
      fontSize: '16',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'left',
    };
    
    addElement(selectedSection.id, newElement);
    selectElement(newElement.id);
  };
  
  /**
   * 画像要素を追加する
   */
  const handleAddImageElement = () => {
    const newElement: ImageElement = {
      id: uuidv4(),
      type: 'image',
      src: 'https://via.placeholder.com/300x200',
      alt: '画像の説明',
      width: '100',
      height: '50',
    };
    
    addElement(selectedSection.id, newElement);
    selectElement(newElement.id);
  };
  
  /**
   * ボタン要素を追加する
   */
  const handleAddButtonElement = () => {
    const newElement: ButtonElement = {
      id: uuidv4(),
      type: 'button',
      label: 'ボタン',
      url: '#',
      backgroundColor: '#1976d2',
      textColor: '#ffffff',
      borderRadius: '4',
    };
    
    addElement(selectedSection.id, newElement);
    selectElement(newElement.id);
  };
  
  /**
   * 選択された要素を更新する
   * @param {string} property - 更新するプロパティ名
   * @param {any} value - 新しい値
   */
  const handleElementUpdate = (property: string, value: any) => {
    if (selectedElementId && selectedSection) {
      updateElement(selectedSection.id, selectedElementId, { [property]: value });
    }
  };
  
  /**
   * 選択された要素を削除する
   */
  const handleRemoveSelectedElement = () => {
    if (selectedElementId && selectedSection) {
      removeElement(selectedSection.id, selectedElementId);
    }
  };
  
  /**
   * 要素がクリックされたときの処理
   * @param {string} elementId - クリックされた要素のID
   */
  const handleElementClick = (elementId: string) => {
    selectElement(elementId);
  };
  
  return (
    <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        セクションエディタ
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="エディタタブ">
          <Tab label="セクション設定" />
          <Tab label="要素エディタ" />
        </Tabs>
      </Box>
      
      {/* セクション設定タブ */}
      {activeTab === 0 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TextField
            fullWidth
            label="セクションタイトル"
            variant="outlined"
            size="small"
            value={selectedSection.title}
            onChange={(e) => handleSectionUpdate('title', e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="背景色"
            variant="outlined"
            size="small"
            value={selectedSection.backgroundColor}
            onChange={(e) => handleSectionUpdate('backgroundColor', e.target.value)}
            margin="normal"
            type="color"
            InputProps={{
              startAdornment: (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    bgcolor: selectedSection.backgroundColor,
                    border: '1px solid #ccc',
                  }}
                />
              ),
            }}
          />
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="section-type-label">セクションタイプ</InputLabel>
            <Select
              labelId="section-type-label"
              value={selectedSection.type}
              label="セクションタイプ"
              onChange={(e: SelectChangeEvent) => handleSectionUpdate('type', e.target.value)}
            >
              <MenuItem value="hero">ヒーローセクション</MenuItem>
              <MenuItem value="feature">特徴セクション</MenuItem>
              <MenuItem value="pricing">料金セクション</MenuItem>
              <MenuItem value="testimonial">お客様の声セクション</MenuItem>
              <MenuItem value="contact">お問い合わせセクション</MenuItem>
              <MenuItem value="footer">フッターセクション</MenuItem>
              <MenuItem value="custom">カスタムセクション</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* 要素エディタタブ */}
      {activeTab === 1 && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<TextIcon />}
              onClick={handleAddTextElement}
              variant="outlined"
            >
              テキスト追加
            </Button>
            <Button
              size="small"
              startIcon={<ImageIcon />}
              onClick={handleAddImageElement}
              variant="outlined"
            >
              画像追加
            </Button>
            <Button
              size="small"
              startIcon={<ButtonIcon />}
              onClick={handleAddButtonElement}
              variant="outlined"
            >
              ボタン追加
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedSection.elements.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                要素がありません。<br />要素を追加してください。
              </Typography>
            ) : (
              selectedSection.elements.map((element) => (
                <Accordion
                  key={element.id}
                  expanded={selectedElementId === element.id}
                  onChange={() => handleElementClick(element.id)}
                  sx={{
                    border: selectedElementId === element.id
                      ? '1px solid #1976d2'
                      : '1px solid rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`element-${element.id}-content`}
                    id={`element-${element.id}-header`}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {element.type === 'text' && <TextIcon fontSize="small" />}
                      {element.type === 'image' && <ImageIcon fontSize="small" />}
                      {element.type === 'button' && <ButtonIcon fontSize="small" />}
                      <Typography variant="body2">
                        {element.type === 'text' ? (element as TextElement).content.substring(0, 20) + '...' : ''}
                        {element.type === 'image' ? `画像: ${(element as ImageElement).alt}` : ''}
                        {element.type === 'button' ? `ボタン: ${(element as ButtonElement).label}` : ''}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* テキスト要素のエディタ */}
                    {element.type === 'text' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="テキスト内容"
                          variant="outlined"
                          size="small"
                          multiline
                          rows={3}
                          value={(element as TextElement).content}
                          onChange={(e) => handleElementUpdate('content', e.target.value)}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="フォントサイズ"
                              variant="outlined"
                              size="small"
                              type="number"
                              value={(element as TextElement).fontSize}
                              onChange={(e) => handleElementUpdate('fontSize', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel id="font-weight-label">太さ</InputLabel>
                              <Select
                                labelId="font-weight-label"
                                value={(element as TextElement).fontWeight}
                                label="太さ"
                                onChange={(e) => handleElementUpdate('fontWeight', e.target.value)}
                              >
                                <MenuItem value="normal">標準</MenuItem>
                                <MenuItem value="bold">太字</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="テキスト色"
                              variant="outlined"
                              size="small"
                              value={(element as TextElement).color}
                              onChange={(e) => handleElementUpdate('color', e.target.value)}
                              type="color"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel id="text-align-label">配置</InputLabel>
                              <Select
                                labelId="text-align-label"
                                value={(element as TextElement).textAlign}
                                label="配置"
                                onChange={(e) => handleElementUpdate('textAlign', e.target.value)}
                              >
                                <MenuItem value="left">左揃え</MenuItem>
                                <MenuItem value="center">中央揃え</MenuItem>
                                <MenuItem value="right">右揃え</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {/* 画像要素のエディタ */}
                    {element.type === 'image' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="画像URL"
                          variant="outlined"
                          size="small"
                          value={(element as ImageElement).src}
                          onChange={(e) => handleElementUpdate('src', e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="代替テキスト"
                          variant="outlined"
                          size="small"
                          value={(element as ImageElement).alt}
                          onChange={(e) => handleElementUpdate('alt', e.target.value)}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="幅 (%)"
                              variant="outlined"
                              size="small"
                              type="number"
                              value={(element as ImageElement).width}
                              onChange={(e) => handleElementUpdate('width', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="高さ (%)"
                              variant="outlined"
                              size="small"
                              type="number"
                              value={(element as ImageElement).height}
                              onChange={(e) => handleElementUpdate('height', e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {/* ボタン要素のエディタ */}
                    {element.type === 'button' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="ボタンラベル"
                          variant="outlined"
                          size="small"
                          value={(element as ButtonElement).label}
                          onChange={(e) => handleElementUpdate('label', e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="リンク先URL"
                          variant="outlined"
                          size="small"
                          value={(element as ButtonElement).url}
                          onChange={(e) => handleElementUpdate('url', e.target.value)}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="背景色"
                              variant="outlined"
                              size="small"
                              type="color"
                              value={(element as ButtonElement).backgroundColor}
                              onChange={(e) => handleElementUpdate('backgroundColor', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="テキスト色"
                              variant="outlined"
                              size="small"
                              type="color"
                              value={(element as ButtonElement).textColor}
                              onChange={(e) => handleElementUpdate('textColor', e.target.value)}
                            />
                          </Grid>
                        </Grid>
                        <TextField
                          fullWidth
                          label="角丸の半径"
                          variant="outlined"
                          size="small"
                          type="number"
                          value={(element as ButtonElement).borderRadius}
                          onChange={(e) => handleElementUpdate('borderRadius', e.target.value)}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        color="error"
                        onClick={handleRemoveSelectedElement}
                        variant="outlined"
                      >
                        削除
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default SectionEditor; 
