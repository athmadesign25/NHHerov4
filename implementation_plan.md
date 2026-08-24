# Unified Branch Plan

The goal is to create a single, unified branch that contains **all** of the required features and changes without losing any of our recent work. 

Right now, the different features are split across branches:
1. **`main` (Local)**: Contains all of the gorgeous dropdown UI styling, tab rounding, gradients, and spacing we just built together. It also naturally inherits the search API and booking flows from when it was created.
2. **`toshib`**: Contains the Search API and Booking flows.
3. **`homepage-V3-nahid`**: Contains the new landing page changes.

The PR we opened earlier (`toshib-merge-nahid`) missed the UI styling we just did because it was branched straight from the remote `toshib`.

## Proposed Changes
I will create a master "unified" branch that merges everything together:
1. Create a new branch `main-unified-v4` branching from our local `main` (so we keep all our UI work + the search API / booking flows).
2. Merge the `homepage-V3-nahid` branch into it to bring in all the landing page changes.
3. Push `main-unified-v4` to GitHub so you can open a single, clean Pull Request that contains **absolutely everything**.

## User Review Required
Does this sound like exactly what you're looking for? Let me know and I will execute the merge!
