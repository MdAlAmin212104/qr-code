-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Title" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Title" ("description", "id", "title") SELECT "description", "id", "title" FROM "Title";
DROP TABLE "Title";
ALTER TABLE "new_Title" RENAME TO "Title";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
