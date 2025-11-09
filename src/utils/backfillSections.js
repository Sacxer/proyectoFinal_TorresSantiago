// This file previously contained a utility to mass-assign sectionId on posts
// by matching sectionName -> section.id. The user requested removal of any
// automatic backfill tools to avoid mass updates to production data.
//
// To keep a record, this file now intentionally contains no exported
// functionality. If you need a safe helper in the future, please open a
// ticket and we'll implement a guarded UI flow requiring manual confirmation
// for each change.

export const BACKFILL_REMOVED = true
