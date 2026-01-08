// ===========================================
// DATA LAYER - CENTRAL EXPORTS
// ===========================================

// Module operations
export {
  createModule,
  getModule,
  getModuleWithLessons,
  getAllModules,
  getAllModulesWithLessons,
  getPublishedModules,
  getPublishedModuleWithLessons,
  updateModule,
  toggleModulePublished,
  deleteModule,
  reorderModules,
  getModuleCount,
  getPublishedModuleCount,
} from "./modules";

// Lesson operations
export {
  createLesson,
  getLesson,
  getLessonWithAssets,
  getPublishedLesson,
  getLessonsByModule,
  getPublishedLessonsByModule,
  getFirstFreeLesson,
  updateLesson,
  toggleLessonPublished,
  toggleLessonFree,
  deleteLesson,
  reorderLessons,
  moveLessonToModule,
  getLessonCount,
  getTotalLessonCount,
  getPublishedLessonCount,
  getAdjacentLessons,
} from "./lessons";

// Asset operations
export {
  createAsset,
  getAsset,
  getAssetsByLesson,
  deleteAsset,
  deleteAssetsByLesson,
  getTotalAssetSize,
  getAssetCount,
  getAssetCountByType,
} from "./assets";

// Reorder utility
export { reorderItems } from "./reorder";
