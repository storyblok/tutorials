import assert from "node:assert/strict";
import { test } from "node:test";
import { walkContent } from "../agent/lib/content.ts";
import { uuids } from "./fixtures.ts";

test("walkContent: links, picked stories and blocks, without schemas", () => {
  const blokId = "11111111-2222-4333-8444-555555555555";
  const walked = walkContent({
    component: "page",
    _uid: "99999999-0000-4000-8000-000000000000",
    body: [
      {
        component: "teaser",
        link: {
          fieldtype: "multilink",
          linktype: "story",
          id: uuids.linked,
          cached_url: "linked",
        },
        link__i18n__de: {
          fieldtype: "multilink",
          linktype: "story",
          id: uuids.missingDe,
          cached_url: "x",
        },
        related: [uuids.draft],
        text: {
          type: "doc",
          content: [
            {
              type: "text",
              text: "a",
              marks: [
                {
                  type: "link",
                  attrs: { linktype: "url", href: "https://de.invalid/" },
                },
              ],
            },
            {
              type: "blok",
              attrs: { id: blokId, body: [{ component: "grid", items: [] }] },
            },
          ],
        },
      },
    ],
  });
  assert.deepEqual(
    walked.refs.map((ref) => [ref.kind, ref.where, ref.target]),
    [
      ["story", "teaser.link", uuids.linked],
      ["story", "teaser.link__i18n__de", uuids.missingDe],
      ["story", "teaser.related", uuids.draft],
      ["url", "teaser.text", "https://de.invalid/"],
    ],
  );
  assert.deepEqual(walked.components, ["page", "teaser", "grid"]);
});
