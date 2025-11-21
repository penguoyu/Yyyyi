export enum TattooStyle {
  REALISM = '寫實風格 (Realism)',
  TRADITIONAL = '美式傳統 (Traditional)',
  NEO_TRADITIONAL = '新傳統 (Neo Traditional)',
  JAPANESE = '日式傳統 (Japanese)',
  MINIMALIST = '極簡線條 (Minimalist)',
  DOTWORK = '點刺幾何 (Dotwork)',
  WATERCOLOR = '水彩渲染 (Watercolor)',
  TRIBAL = '部落圖騰 (Tribal)',
  NEW_SCHOOL = '新美式 (New School)',
  BLACKWORK = '黑工/暗黑 (Blackwork)'
}

export enum BodyPart {
  ARM = '手臂',
  FOREARM = '前臂',
  CHEST = '胸口',
  BACK = '背部',
  LEG = '腿部',
  THIGH = '大腿',
  HAND = '手部',
  NECK = '頸部'
}

export enum ViewMode {
  DESIGN = '純圖稿 (Flash Sheet)',
  PREVIEW = '實穿模擬 (Body Preview)'
}

export interface DesignRequest {
  prompt: string;
  style: TattooStyle;
  bodyPart: BodyPart;
  complexity: '簡單' | '中等' | '複雜';
  color: '黑白灰階' | '彩色';
  viewMode: ViewMode;
}

export interface GeneratedDesign {
  id: string;
  imageUrl: string;
  originalRequest: DesignRequest;
  refinedPrompt: string;
  timestamp: number;
}