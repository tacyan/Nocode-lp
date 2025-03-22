/**
 * エディタの状態管理ストア
 * 
 * LPエディタの全体的な状態を管理するZustandストア
 * @module editorStore
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * セクションの種類
 * @typedef {'hero' | 'feature' | 'pricing' | 'testimonial' | 'contact' | 'footer' | 'custom'} SectionType
 */
export type SectionType = 'hero' | 'feature' | 'pricing' | 'testimonial' | 'contact' | 'footer' | 'custom';

/**
 * 要素の基本インターフェース
 * @interface ElementBase
 * @property {string} id - 要素の一意のID
 * @property {string} type - 要素の種類
 */
interface ElementBase {
  id: string;
  type: string;
}

/**
 * テキスト要素のインターフェース
 * @interface TextElement
 * @extends {ElementBase}
 * @property {'text'} type - 要素の種類
 * @property {string} content - テキストの内容
 * @property {string} fontSize - フォントサイズ
 * @property {string} color - テキストの色
 * @property {string} fontWeight - フォントの太さ
 * @property {string} textAlign - テキストの配置
 */
export interface TextElement extends ElementBase {
  type: 'text';
  content: string;
  fontSize: string;
  color: string;
  fontWeight: string;
  textAlign: string;
}

/**
 * 画像要素のインターフェース
 * @interface ImageElement
 * @extends {ElementBase}
 * @property {'image'} type - 要素の種類
 * @property {string} src - 画像のURL
 * @property {string} alt - 代替テキスト
 * @property {string} width - 画像の幅
 * @property {string} height - 画像の高さ
 */
export interface ImageElement extends ElementBase {
  type: 'image';
  src: string;
  alt: string;
  width: string;
  height: string;
}

/**
 * ボタン要素のインターフェース
 * @interface ButtonElement
 * @extends {ElementBase}
 * @property {'button'} type - 要素の種類
 * @property {string} label - ボタンのラベル
 * @property {string} url - リンク先URL
 * @property {string} backgroundColor - 背景色
 * @property {string} textColor - テキスト色
 * @property {string} borderRadius - 角丸の半径
 */
export interface ButtonElement extends ElementBase {
  type: 'button';
  label: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
}

/**
 * セクション要素の共通インターフェース
 * @interface Section
 * @property {string} id - セクションのID
 * @property {SectionType} type - セクションの種類
 * @property {string} title - セクションのタイトル
 * @property {Array<TextElement | ImageElement | ButtonElement>} elements - セクション内の要素
 * @property {string} backgroundColor - 背景色
 */
export interface Section {
  id: string;
  type: SectionType;
  title: string;
  elements: Array<TextElement | ImageElement | ButtonElement>;
  backgroundColor: string;
}

/**
 * エディタのストア状態インターフェース
 * @interface EditorState
 * @property {Array<Section>} sections - セクションのリスト
 * @property {string | null} selectedSectionId - 選択中のセクションID
 * @property {string | null} selectedElementId - 選択中の要素ID
 */
interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  selectedElementId: string | null;
  
  // アクション
  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  moveSection: (sourceIndex: number, destinationIndex: number) => void;
  selectSection: (id: string) => void;
  
  addElement: (sectionId: string, element: TextElement | ImageElement | ButtonElement) => void;
  removeElement: (sectionId: string, elementId: string) => void;
  updateElement: (
    sectionId: string, 
    elementId: string, 
    updates: Partial<TextElement | ImageElement | ButtonElement>
  ) => void;
  moveElement: (sectionId: string, sourceIndex: number, destinationIndex: number) => void;
  selectElement: (id: string) => void;
  
  resetSelection: () => void;
}

/**
 * LPエディタのZustandストア
 */
export const useEditorStore = create<EditorState>((set) => ({
  sections: [],
  selectedSectionId: null,
  selectedElementId: null,
  
  // セクション関連のアクション
  addSection: (type) => set((state) => {
    const newSection: Section = {
      id: uuidv4(),
      type,
      title: `新しい${type}セクション`,
      elements: [],
      backgroundColor: '#ffffff',
    };
    return { sections: [...state.sections, newSection] };
  }),
  
  removeSection: (id) => set((state) => ({
    sections: state.sections.filter((section) => section.id !== id),
    selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
  })),
  
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map((section) =>
      section.id === id ? { ...section, ...updates } : section
    ),
  })),
  
  moveSection: (sourceIndex, destinationIndex) => set((state) => {
    const newSections = [...state.sections];
    const [removed] = newSections.splice(sourceIndex, 1);
    newSections.splice(destinationIndex, 0, removed);
    return { sections: newSections };
  }),
  
  selectSection: (id) => set({
    selectedSectionId: id,
    selectedElementId: null,
  }),
  
  // 要素関連のアクション
  addElement: (sectionId, element) => set((state) => ({
    sections: state.sections.map((section) =>
      section.id === sectionId
        ? { ...section, elements: [...section.elements, element] }
        : section
    ),
  })),
  
  removeElement: (sectionId, elementId) => set((state) => ({
    sections: state.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            elements: section.elements.filter((el) => el.id !== elementId),
          }
        : section
    ),
    selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
  })),
  
  updateElement: (sectionId, elementId, updates) => set((state) => {
    const newSections = state.sections.map(section => {
      if (section.id !== sectionId) return section;
      
      const newElements = section.elements.map(element => {
        if (element.id !== elementId) return element;
        
        // 型安全な更新のために要素タイプごとに処理を分ける
        switch (element.type) {
          case 'text':
            return { ...element, ...updates } as TextElement;
          case 'image':
            return { ...element, ...updates } as ImageElement;
          case 'button':
            return { ...element, ...updates } as ButtonElement;
          default:
            return element;
        }
      });
      
      return { ...section, elements: newElements };
    });
    
    return { sections: newSections };
  }),
  
  moveElement: (sectionId, sourceIndex, destinationIndex) => set((state) => {
    const newSections = [...state.sections];
    const sectionIndex = newSections.findIndex((section) => section.id === sectionId);
    
    if (sectionIndex !== -1) {
      const newElements = [...newSections[sectionIndex].elements];
      const [removed] = newElements.splice(sourceIndex, 1);
      newElements.splice(destinationIndex, 0, removed);
      
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        elements: newElements,
      };
    }
    
    return { sections: newSections };
  }),
  
  selectElement: (id) => set({
    selectedElementId: id,
  }),
  
  resetSelection: () => set({
    selectedSectionId: null,
    selectedElementId: null,
  }),
})); 
