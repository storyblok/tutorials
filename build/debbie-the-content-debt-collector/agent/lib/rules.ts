// Content debt rules, each being a pure function auditContext -> Finding
// For a new rule, add its kind to KINDS in types.ts and its implementation here

import type { Asset, Component, Story } from "@storyblok/management-api-client";
import { assetPath, walkContent, type Walked } from "./content.ts";
import { KINDS, type DebtKind, type Finding } from "./types.ts";

const DAY = 24 * 60 * 60 * 1000;
const OVERDUE_DAYS = 365;

type AuditInput = {
  stories: Story[];
  components: Component[];
  assets: Asset[];
  urlStatus: Map<string, boolean>; // Result of link checking
  now: Date;
};

type AuditContext = AuditInput & {
  walked: Map<number, Walked>;
  byUuid: Map<string, Story>;
};

const makeFinding = (
  kind: DebtKind,
  fields: Omit<Finding, "kind" | "term" | "points">,
) => ({ kind, ...KINDS[kind], ...fields });

const storyFields = (story: Story) => ({
  slug: story.full_slug,
  storyId: story.id,
});

const ageInDays = (story: Story, now: Date) =>
  Math.floor((now.getTime() - new Date(story.updated_at).getTime()) / DAY);

// References to missing or unpublished stories, plus dead URLs
function bounced({
  stories,
  walked,
  byUuid,
  urlStatus,
}: AuditContext): Finding[] {
  const findings: Finding[] = [];
  for (const story of stories) {
    for (const ref of walked.get(story.id)?.refs ?? []) {
      const add = (detail: string) =>
        findings.push(
          makeFinding("bounced", {
            key: `bounced|${story.id}|${ref.where}|${ref.target}`,
            ...storyFields(story),
            detail,
          }),
        );
      if (ref.kind === "story") {
        const target = byUuid.get(ref.target);
        if (!target) {
          add(
            `${ref.where} points to a story that doesn't exist or was deleted (uuid ${ref.target}).`,
          );
        } else if (!target.published) {
          add(
            `${ref.where} points to the unpublished story \`${target.full_slug}\`.`,
          );
        }
      } else if (urlStatus.get(ref.target) === false) {
        add(`${ref.where} links to the unreachable URL ${ref.target}.`);
      }
    }
  }
  return findings;
}

function overdue({ stories, now }: AuditContext): Finding[] {
  return stories
    .filter((story) => !story.is_folder && ageInDays(story, now) > OVERDUE_DAYS)
    .map((story) =>
      makeFinding("overdue", {
        key: `overdue|${story.id}`,
        ...storyFields(story),
        detail: `Not updated in ${ageInDays(story, now)} days (since ${story.updated_at.slice(0, 10)}).`,
      }),
    );
}

function pendingTransaction({ stories, now }: AuditContext): Finding[] {
  return stories
    .filter(
      (story) =>
        !story.is_folder && story.published && story.unpublished_changes,
    )
    .map((story) =>
      makeFinding("pending_transaction", {
        key: `pending|${story.id}`,
        ...storyFields(story),
        detail: `Has unpublished changes, last saved ${ageInDays(story, now)} day(s) ago (${story.updated_at.slice(0, 10)}).`,
      }),
    );
}

// Published stories no other story links to. Exempt are the entry point
// `home`, folder start pages, and stories in a folder that has a start page
function abandonedProperty({ stories, walked }: AuditContext): Finding[] {
  const linkedTo = new Set<string>();
  for (const story of stories) {
    for (const ref of walked.get(story.id)?.refs ?? []) {
      const linksToOtherStory =
        ref.kind === "story" && ref.target !== story.uuid;
      if (linksToOtherStory) {
        linkedTo.add(ref.target);
      }
    }
  }
  const listedFolders = new Set(
    stories
      .filter((story) => story.is_startpage && !story.is_folder)
      .map((story) => story.parent_id),
  );
  const isExempt = (story: Story) =>
    story.is_folder ||
    !story.published ||
    story.full_slug === "home" ||
    story.is_startpage;
  const isLinkedOrListed = (story: Story) =>
    linkedTo.has(story.uuid) || listedFolders.has(story.parent_id);
  const abandoned = stories.filter(
    (story) => !isExempt(story) && !isLinkedOrListed(story),
  );
  return abandoned.map((story) =>
    makeFinding("abandoned_property", {
      key: `abandoned|${story.id}`,
      ...storyFields(story),
      detail: "No other story links to it, and its folder has no start page.",
    }),
  );
}

// Unused assets
function unclaimedAsset({ stories, assets }: AuditContext): Finding[] {
  const allContent = stories
    .map((story) => JSON.stringify(story.content ?? {}))
    .join("\n");
  const isUsed = (asset: Asset) =>
    allContent.includes(assetPath(asset.filename));
  return assets
    .filter((asset) => !asset.deleted_at && !isUsed(asset))
    .map((asset) =>
      makeFinding("unclaimed_asset", {
        key: `asset|${asset.id}`,
        detail: `Asset ${asset.id} (\`${asset.short_filename ?? asset.filename.split("/").pop()}\`) isn't used by any story.`,
      }),
    );
}

function dormantAccount({ components, walked }: AuditContext): Finding[] {
  const usedComponents = new Set(
    walked.values().flatMap((walkResult) => walkResult.components),
  );
  return components
    .filter((component) => !usedComponents.has(component.name))
    .map((component) =>
      makeFinding("dormant_account", {
        key: `component|${component.name}`,
        detail: `Component \`${component.name}\` isn't used by any story.`,
      }),
    );
}

const RULES = [
  bounced,
  overdue,
  pendingTransaction,
  abandonedProperty,
  unclaimedAsset,
  dormantAccount,
];

export function audit(input: AuditInput): Finding[] {
  // Folders come from the story list, which have no content
  const walked = new Map(
    input.stories
      .filter((story) => story.content)
      .map((story) => [story.id, walkContent(story.content)] as const),
  );
  const byUuid = new Map(input.stories.map((story) => [story.uuid, story]));
  const space = { ...input, walked, byUuid };
  return RULES.flatMap((rule) => rule(space)).sort(
    (a, b) => b.points - a.points,
  );
}
