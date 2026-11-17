// Small in-memory space used by the unit tests. The fixtures only fill the
// fields the rules read, so they are cast to the client's full types.
import type { Asset, Component, Story } from "@storyblok/management-api-client";

export const NOW = new Date("2026-11-11T00:00:00Z");

// Story UUIDs. Real Storyblok UUIDs have this shape, which the walker relies
// on.
export const uuids = {
  home: "00000000-0000-4000-8000-000000000001",
  missing: "00000000-0000-4000-8000-000000000002",
  linked: "00000000-0000-4000-8000-000000000003",
  draft: "00000000-0000-4000-8000-000000000004",
  orphan: "00000000-0000-4000-8000-000000000005",
  incomplete: "00000000-0000-4000-8000-000000000006",
  old: "00000000-0000-4000-8000-000000000007",
  ancient: "00000000-0000-4000-8000-000000000008",
  pending: "00000000-0000-4000-8000-000000000009",
  folder: "00000000-0000-4000-8000-000000000010",
  docsStart: "00000000-0000-4000-8000-000000000011",
  docsChild: "00000000-0000-4000-8000-000000000012",
  missingDe: "00000000-0000-4000-8000-000000000013",
};

export const components = [
  { name: "page" },
  { name: "teaser" },
  { name: "unused_block" },
] as Component[];

const base = {
  parent_id: null,
  is_folder: false,
  is_startpage: false,
  published: true,
  unpublished_changes: false,
  updated_at: "2026-11-01T00:00:00Z",
};

const page = (body: unknown[]) => ({ component: "page", body });

export function stories(): Story[] {
  return [
    {
      ...base,
      id: 1,
      uuid: uuids.home,
      name: "Home",
      full_slug: "home",
      content: page([
        {
          component: "teaser",
          headline: "Hi",
          image: {
            fieldtype: "asset",
            filename: "https://a.storyblok.com/f/1/used.png",
          },
          link: {
            fieldtype: "multilink",
            linktype: "story",
            id: uuids.missing,
          },
          related: [uuids.linked, uuids.draft, uuids.docsStart],
          text: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "x",
                    marks: [
                      {
                        type: "link",
                        attrs: {
                          linktype: "url",
                          href: "https://dead.invalid/",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ]),
    },
    {
      ...base,
      id: 2,
      uuid: uuids.linked,
      name: "Linked",
      full_slug: "linked",
      content: page([]),
    },
    {
      ...base,
      id: 3,
      uuid: uuids.draft,
      name: "Draft",
      full_slug: "draft",
      published: false,
      content: page([]),
    },
    {
      ...base,
      id: 4,
      uuid: uuids.orphan,
      name: "Orphan",
      full_slug: "orphan",
      content: page([]),
    },
    {
      ...base,
      id: 5,
      uuid: uuids.incomplete,
      name: "Incomplete",
      full_slug: "linked-too",
      content: page([{ component: "teaser", headline: "" }]),
    },
    {
      ...base,
      id: 6,
      uuid: uuids.old,
      name: "Old",
      full_slug: "old",
      updated_at: "2025-06-01T00:00:00Z",
      content: page([]),
    },
    {
      ...base,
      id: 7,
      uuid: uuids.ancient,
      name: "Ancient",
      full_slug: "ancient",
      updated_at: "2023-01-01T00:00:00Z",
      content: page([]),
    },
    {
      ...base,
      id: 8,
      uuid: uuids.pending,
      name: "Pending",
      full_slug: "pending",
      unpublished_changes: true,
      content: page([]),
    },
    // Folder "docs": a start page and a child nothing links to. Neither is
    // abandoned property: start pages never are, and a folder's start page is
    // taken to list the stories in it.
    {
      ...base,
      id: 10,
      uuid: uuids.folder,
      name: "Docs",
      full_slug: "docs",
      is_folder: true,
    },
    {
      ...base,
      id: 11,
      uuid: uuids.docsStart,
      name: "Docs",
      full_slug: "docs/",
      parent_id: 10,
      is_startpage: true,
      content: page([]),
    },
    {
      ...base,
      id: 12,
      uuid: uuids.docsChild,
      name: "Child",
      full_slug: "docs/child",
      parent_id: 10,
      content: page([]),
    },
  ] as Story[];
}

export const assets = [
  { id: 100, filename: "https://a.storyblok.com/f/1/used.png" },
  { id: 101, filename: "https://a.storyblok.com/f/1/unused.png" },
  {
    id: 102,
    filename: "https://a.storyblok.com/f/1/deleted.png",
    deleted_at: "2026-01-01T00:00:00Z",
  },
] as Asset[];

export const urlStatus = new Map([["https://dead.invalid/", false]]);
