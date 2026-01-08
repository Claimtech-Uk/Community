# Course Platform — AI Systems Architect

<aside>
🎯

**Mission:** Build a custom content delivery platform to replace Skool for the AI Systems Architect course — demonstrating tech-builder credibility while owning the full stack.

</aside>

## Project Status

| Stage | Status |
| --- | --- |
| Discovery | ✅ Complete |
| Master Spec | ✅ Complete |
| Growth Spec | ✅ Complete |
| Technical Stack | ✅ Complete |
| Schema Design | ✅ Complete |
| Build Roadmap | ✅ Complete |
| Implementation | ⬜ Not Started |

---

## 1. Discovery & Validation

[Project Discovery Brief](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Project%20Discovery%20Brief%209fd9d1b19da14776a8df2ddc5f77990a.md)

---

## 2. Specification

[Master Spec](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Master%20Spec%20aedc25f551b34327a714c17e007e1869.md)

---

## 3. Growth Strategy

[Growth Spec](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Growth%20Spec%20622c50c7f8ec4494ad733c80ac8e91ef.md)

---

## 4. Technical Architecture

[Technical Stack Decisions](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Technical%20Stack%20Decisions%20addd5cce299e43b3a37ecd1833104161.md)

[Schema Design](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Schema%20Design%20ca8cc8d82a884e7083457ef26a980e24.md)

---

## 5. Build Planning

[Build Roadmap](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Build%20Roadmap%20e6053a10157a4f40b0314a3342284d72.md)

[Module Briefs](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Module%20Briefs%203884f45c75844fc3a554f87acf08de57.md)

---

## 6. Implementation

[Build Chunks — Batch 1 (Modules 1-4)](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Build%20Chunks%20%E2%80%94%20Batch%201%20(Modules%201-4)%20457f555696d241b999274407c527b4bd.md)

[Build Chunks — Batch 2 (Modules 5-8)](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Build%20Chunks%20%E2%80%94%20Batch%202%20(Modules%205-8)%208ca452910594414094da0df65268254d.md)

[Cursor Docs](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Cursor%20Docs%204593c2da8bcb433f889eb38015527aae.md)

[Chunks](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/Chunks%20af2f671cd0ab42789f91f45f8b234dd4.md)

[BUILD_STATE](Course%20Platform%20%E2%80%94%20AI%20Systems%20Architect/BUILD_STATE%20ada5dea4657d4aaf939b6fdf628e44b2.md)

---

## Notes & Decisions

*Capture key decisions and context here as the project evolves.*

---

## 🔮 Future Versions

### CHANGE SPEC: Pathway Enrollment System (v2)

<aside>
📋

**Feature:** Users actively enrol onto a learning pathway, and the platform keeps them on track.

</aside>

**Why:**

- Modular content is flexible but can cause choice paralysis
- Beginners need structure, not just open access
- Enrollment creates commitment and accountability
- Progress tracking becomes meaningful ("3 of 11 complete" not "you watched some videos")

**Core Functionality:**

1. **Onboarding quiz** — 3-4 questions to recommend a pathway
2. **Enrolled state** — Dashboard shows *their* pathway, not all content
3. **Progress tracking** — Current section, next up, completion percentage
4. **Nudges** — Email/Discord prompts for inactive users, milestone celebrations
5. **Flexibility** — Can browse all content, switch pathways if goals change

**Data Model Addition:**

```
User
├── enrolled_pathway: "beginner" | "developer" | "founder" | etc.
├── completed_sections: [1, 2, 3]
├── current_section: 4
├── pathway_started_at: timestamp
└── last_active: timestamp
```

**Pathways (from v4 content plan):**

- 🐣 Beginner — Linear journey, foundational skills
- 🛠️ Developer — Skip basics, focus on planning + advanced
- 🌊 Vibe Coder — Structure for existing AI users
- 👥 Team Lead — Planning, handoffs, QA
- 🚀 Founder (MVP) — Idea → shipped product

**Reference:** ‣