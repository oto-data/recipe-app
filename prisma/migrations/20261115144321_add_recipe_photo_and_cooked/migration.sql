-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "servings" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT NOT NULL DEFAULT '',
    "sourceUrl" TEXT NOT NULL DEFAULT '',
    "lastCookedAt" DATETIME,
    "cookedCount" INTEGER NOT NULL DEFAULT 0,
    "ingredients" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Recipe" ("category", "createdAt", "description", "duration", "favorite", "id", "ingredients", "notes", "servings", "steps", "tags", "title", "updatedAt") SELECT "category", "createdAt", "description", "duration", "favorite", "id", "ingredients", "notes", "servings", "steps", "tags", "title", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
