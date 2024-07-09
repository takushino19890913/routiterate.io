// 基本的なタスクの型定義
export interface Task {
  id: number;
  title: string;
  category: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  recurrence: Recurrence;
  endCondition: EndCondition;
}

// 繰り返しの設定に関する型定義
export interface Recurrence {
  type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  intervalUnit?: 'day' | 'week' | 'month' | 'year';
  days?: number[];
  weeks?: number[];
}

// タスクの終了条件に関する型定義
export interface EndCondition {
  type: 'never' | 'onDate' | 'afterOccurrences';
  date?: Date | null;
  occurrences?: number;
}

// カテゴリーの型定義
export type Category = string;

// アプリケーションの状態に関する型定義
export interface AppState {
  isLoading: boolean;
  view: 'main' | 'settings';
  tasks: Task[];
  categories: Category[];
}

// メインビューのプロップスの型定義
export interface MainViewProps {
  tasks: Task[];
}

// 設定ビューのプロップスの型定義
export interface SettingsViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: Category[];
}

// タスクフォームのプロップスの型定義
export interface TaskFormProps {
  addOrUpdateTask: (task: Task) => void;
  categories: Category[];
  onClose: () => void;
  editingTask: Task | null;
}

// アニメーションローディング画面のプロップスの型定義
export interface AnimatedLoadingScreenProps {
  onLoadComplete: () => void;
}

// パーティクルの型定義（AnimatedLoadingScreen用）
export interface Particle {
  x: number;
  y: number;
  size: number;
  targetX: number;
  targetY: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

// フィルタリングオプションの型定義
export type FilterType = Task['recurrence']['type'] | 'all';

// 月次タスクの種類の型定義
export type MonthlyType = 'dayOfMonth' | 'dayOfWeek';

// イベントハンドラーの型定義
export type ChangeEventHandler<T = Element> = React.ChangeEventHandler<T>;
export type FormEventHandler<T = Element> = React.FormEventHandler<T>;

// DatePickerの onChange ハンドラーの型定義
export type DatePickerChangeHandler = (date: Date | null) => void;

// アニメーションフレームの参照の型定義
export type AnimationFrameRef = React.MutableRefObject<number | null>;