/**
 * セクションリストコンポーネント
 * 
 * LPのセクションを管理するためのリストコンポーネント
 * ドラッグ&ドロップでセクションの並び替えが可能
 * @module SectionsList
 */

import React from 'react';
import { useEditorStore, SectionType } from '../store/editorStore';
import { getSectionTypeName } from '../utils/sectionTemplates';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Paper,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Box,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Home as HeroIcon,
  Stars as FeatureIcon,
  AttachMoney as PricingIcon,
  FormatQuote as TestimonialIcon,
  ContactMail as ContactIcon,
  MoreHoriz as FooterIcon,
  Edit as CustomIcon
} from '@mui/icons-material';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * セクションタイプの説明を取得する
 * @param {SectionType} type - セクションタイプ
 * @returns {string} - タイプの説明
 */
const getSectionTypeDescription = (type: SectionType): string => {
  switch(type) {
    case 'hero':
      return 'サイトのメインビジュアル部分';
    case 'feature':
      return '特徴やサービスの説明を表示';
    case 'pricing':
      return '料金プランの表示';
    case 'testimonial':
      return 'お客様の声や評価を掲載';
    case 'contact':
      return 'お問い合わせフォームの表示';
    case 'footer':
      return 'サイトのフッター部分';
    case 'custom':
      return 'カスタム要素を自由に配置';
    default:
      return '';
  }
};

/**
 * セクションタイプのアイコンを取得する
 * @param {SectionType} type - セクションタイプ
 * @returns {React.ReactElement} - アイコンコンポーネント
 */
const getSectionTypeIcon = (type: SectionType): React.ReactElement => {
  switch(type) {
    case 'hero':
      return <HeroIcon />;
    case 'feature':
      return <FeatureIcon />;
    case 'pricing':
      return <PricingIcon />;
    case 'testimonial':
      return <TestimonialIcon />;
    case 'contact':
      return <ContactIcon />;
    case 'footer':
      return <FooterIcon />;
    case 'custom':
    default:
      return <CustomIcon />;
  }
};

/**
 * ドラッグ可能なセクションアイテムのプロパティ
 * @interface SortableSectionItemProps
 * @property {string} id - セクションのID
 * @property {string} title - セクションのタイトル
 * @property {SectionType} type - セクションの種類
 * @property {boolean} isSelected - 選択状態
 * @property {function} onDelete - 削除時のコールバック
 */
interface SortableSectionItemProps {
  id: string;
  title: string;
  type: SectionType;
  isSelected: boolean;
  onDelete: (id: string) => void;
}

/**
 * ドラッグ可能なセクションアイテムコンポーネント
 * 
 * @param {SortableSectionItemProps} props - コンポーネントのプロパティ
 * @returns {React.ReactElement} - ドラッグ可能なセクションアイテム
 */
const SortableSectionItem: React.FC<SortableSectionItemProps> = ({ id, title, type, isSelected, onDelete }) => {
  const { selectSection } = useEditorStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
    borderLeft: isSelected ? '4px solid #1976d2' : '4px solid transparent',
  };
  
  /**
   * セクションをクリックしたときの処理
   */
  const handleClick = () => {
    selectSection(id);
  };
  
  /**
   * セクション削除ボタンをクリックしたときの処理
   * @param {React.MouseEvent} e - クリックイベント
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };
  
  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      secondaryAction={
        <IconButton edge="end" aria-label="削除" onClick={handleDeleteClick} size="small">
          <DeleteIcon />
        </IconButton>
      }
      sx={{ cursor: 'pointer', pl: 1 }}
    >
      <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 1 }} size="small">
        <DragIcon />
      </IconButton>
      <ListItemText 
        primary={title} 
        secondary={getSectionTypeName(type)} 
        primaryTypographyProps={{ 
          variant: 'body2',
          fontWeight: isSelected ? 'bold' : 'normal'
        }}
        secondaryTypographyProps={{ 
          variant: 'caption'
        }}
      />
    </ListItem>
  );
};

/**
 * セクションリストコンポーネント
 * 
 * @returns {React.ReactElement} - セクションリストコンポーネント
 */
const SectionsList: React.FC = () => {
  const { sections, addSection, removeSection, moveSection, selectedSectionId } = useEditorStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // DnDのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px動かすとドラッグ開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  /**
   * 新規セクション追加ボタンをクリックしたときの処理
   * @param {React.MouseEvent<HTMLElement>} event - クリックイベント
   */
  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  /**
   * セクション種類選択メニューを閉じる
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  /**
   * セクション種類を選択したときの処理
   * @param {SectionType} type - 選択したセクション種類
   */
  const handleSelectType = (type: SectionType) => {
    addSection(type);
    handleMenuClose();
  };
  
  /**
   * ドラッグ終了時の処理
   * @param {DragEndEvent} event - ドラッグ終了イベント
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);
      
      moveSection(oldIndex, newIndex);
    }
  };
  
  // セクションタイプとそのメニュー項目データの配列
  const sectionTypes: {type: SectionType; icon: React.ReactElement; description: string}[] = [
    { type: 'hero', icon: <HeroIcon />, description: getSectionTypeDescription('hero') },
    { type: 'feature', icon: <FeatureIcon />, description: getSectionTypeDescription('feature') },
    { type: 'pricing', icon: <PricingIcon />, description: getSectionTypeDescription('pricing') },
    { type: 'testimonial', icon: <TestimonialIcon />, description: getSectionTypeDescription('testimonial') },
    { type: 'contact', icon: <ContactIcon />, description: getSectionTypeDescription('contact') },
    { type: 'footer', icon: <FooterIcon />, description: getSectionTypeDescription('footer') },
    { type: 'custom', icon: <CustomIcon />, description: getSectionTypeDescription('custom') }
  ];
  
  return (
    <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">セクション</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          variant="outlined"
        >
          追加
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {sectionTypes.map(({ type, icon, description }) => (
            <Tooltip key={type} title={description} placement="right" arrow>
              <MenuItem onClick={() => handleSelectType(type)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText 
                  primary={getSectionTypeName(type) + 'セクション'} 
                  secondary={description}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </MenuItem>
            </Tooltip>
          ))}
        </Menu>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {sections.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            セクションがありません。<br />「追加」ボタンから新しいセクションを追加してください。
          </Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <List dense disablePadding>
                {sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    type={section.type}
                    isSelected={selectedSectionId === section.id}
                    onDelete={removeSection}
                  />
                ))}
              </List>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    </Paper>
  );
};

export default SectionsList; 
