// Does not handle all cases, only the ones we need for this example

const markTypeMap = {
  bold: { type: "bold" },
  italic: { type: "italic" },
  underline: { type: "underline" },
  link: null, // handled differently in hyperlink node
};

const nodeTypeHandlers = {
  document: (node, content) => ({ type: "doc", content }),
  paragraph: (node, content) => ({ type: "paragraph", content }),
  "heading-1": (node, content) => ({
    type: "heading",
    attrs: { level: 1 },
    content,
  }),
  "heading-2": (node, content) => ({
    type: "heading",
    attrs: { level: 2 },
    content,
  }),
  "heading-3": (node, content) => ({
    type: "heading",
    attrs: { level: 3 },
    content,
  }),
  "heading-4": (node, content) => ({
    type: "heading",
    attrs: { level: 4 },
    content,
  }),
  "heading-5": (node, content) => ({
    type: "heading",
    attrs: { level: 5 },
    content,
  }),
  "heading-6": (node, content) => ({
    type: "heading",
    attrs: { level: 6 },
    content,
  }),
  blockquote: (node, content) => ({ type: "blockquote", content }),
  hr: () => ({ type: "horizontal_rule" }),
  "unordered-list": (node, content) => ({ type: "bullet_list", content }),
  "ordered-list": (node, content) => ({ type: "ordered_list", content }),
  "list-item": (node, content) => {
    // Flatten list item if it contains only a single paragraph
    if (content.length === 1 && content[0].type === "paragraph") {
      return { type: "list_item", content: content[0].content };
    }
    return { type: "list_item", content };
  },
  hyperlink: (node) => {
    const href = node.data?.uri;
    return {
      type: "text",
      text: node.content?.map((c) => c.value ?? "").join("") || "",
      marks: [{ type: "link", attrs: { href } }],
    };
  },
  "embedded-asset-block": (node) => {
    const file = node.data?.target?.fields?.file;
    const contentType = file?.contentType || "";
    if (contentType.startsWith("image/")) {
      return {
        type: "image",
        attrs: {
          src: file.url,
          alt: node.data?.target?.fields?.title || "",
          title: node.data?.target?.fields?.description || "",
        },
      };
    }
    return { type: "text", text: "" };
  },
};

export function convertContentfulRT(node) {
  if (node.nodeType === "text") {
    if (!node.value || node.value.trim() === "") return null;

    const marks =
      node.marks
        ?.map((mark) => markTypeMap[mark.type] ?? null)
        .filter(Boolean) ?? [];

    return {
      type: "text",
      text: node.value,
      marks: marks.length > 0 ? marks : undefined,
    };
  }

  if (node.content) {
    const content = node.content.flatMap(convertContentfulRT).filter(Boolean);

    const handler = nodeTypeHandlers[node.nodeType];
    if (handler) {
      return handler(node, content);
    }

    return content.length === 1 ? content[0] : content;
  }

  return { type: "paragraph", content: [] };
}
