// Module operations
export {
  // Admin operations
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  toggleModulePublished,
  // User operations
  getPublishedModules,
  getPublishedModuleById,
  getAdjacentModules,
} from "./modules";

export type { CreateModuleInput, UpdateModuleInput } from "./modules";

// Lesson operations
export {
  // Admin operations
  getLessonsByModuleId,
  getLessonById,
  createLesson,
  updateLesson,
  updateLessonContent,
  updateLessonVideo,
  deleteLesson,
  reorderLessons,
  toggleLessonPublished,
  toggleLessonFree,
  // User operations
  getPublishedLessonById,
  getAdjacentLessons,
  getFirstLessonOfModule,
  isLessonFree,
} from "./lessons";

export type { CreateLessonInput, UpdateLessonInput } from "./lessons";

// Asset operations
export {
  // Admin operations
  getAssetsByLessonId,
  getAssetById,
  createAsset,
  deleteAsset,
  deleteAssetsByLessonId,
  // User operations
  getPublishedLessonAssets,
  // Utilities
  getFileTypeIcon,
  formatFileSize,
  isAllowedFileType,
} from "./assets";

export type { CreateAssetInput } from "./assets";
