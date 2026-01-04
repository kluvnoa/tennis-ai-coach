# Default Branch Migration: master → main

This document outlines the steps to change the default branch from `master` to `main` for the tennis-ai-coach repository.

## Background

The repository is transitioning from using `master` as the default branch to `main` to align with modern Git conventions and GitHub's current standards.

## Migration Steps

### For Repository Administrators

1. **Create the main branch** (if it doesn't exist):
   ```bash
   git checkout master
   git pull origin master
   git checkout -b main
   git push -u origin main
   ```

2. **Change default branch in GitHub**:
   - Go to repository Settings → Branches
   - Change the default branch from `master` to `main`
   - Click "Update" and confirm the change

3. **Update branch protection rules**:
   - Apply the same protection rules from `master` to `main`
   - Remove protection rules from `master` (if desired)

4. **Optional: Delete master branch**:
   ```bash
   git push origin --delete master
   ```

### For Contributors

After the migration is complete:

1. **Update your local repository**:
   ```bash
   git fetch origin
   git checkout main
   git branch -u origin/main main
   ```

2. **Optional: Remove old master branch**:
   ```bash
   git branch -d master
   ```

3. **Update any remote references**:
   ```bash
   git remote set-head origin main
   ```

## Impact Assessment

### CI/CD Workflows

✅ The CI workflow (`.github/workflows/ci.yml`) triggers on all `push` and `pull_request` events without branch restrictions, so it will work with `main` without modifications.

### Documentation

✅ No project-specific documentation references the `master` branch that needs updating.

### External References

- `backend/README.md` contains references to `master` in NestJS badge URLs (lines 5, 13, 98)
  - These point to external repositories (nestjs/nest) and should **not** be changed
- `THIRD_PARTY_NOTICES.md` contains `master` references in dependency URLs
  - These are external package repository URLs and should **not** be changed

## Post-Migration Verification

After completing the migration:

1. ✅ Verify CI workflows run successfully on the `main` branch
2. ✅ Verify all branch protection rules are in place
3. ✅ Notify all contributors about the change
4. ✅ Update any external documentation or wiki pages that reference the default branch

## Rollback Plan

If issues arise:

1. Change the default branch back to `master` in GitHub settings
2. Keep both branches available until issues are resolved
3. Do not delete `master` until the migration is confirmed successful
