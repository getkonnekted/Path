import type { PathDefinition } from "./index";

export const davidPath: PathDefinition = {
  id: "path-david-v1",
  slug: "life-of-david",
  title: "The Life of David",
  subtitle: "From shepherd to king",
  description:
    "Follow David's story through Scripture, explore the people and events around him, and build lasting understanding.",
  estimatedMinutes: 90,
  steps: [
    {
      id: "meet-david",
      title: "Meet David",
      summary: "Begin with David's family, setting, and place in Israel's story.",
      kind: "read",
      scriptureReferences: ["1 Samuel 16:1-13"],
      objectives: ["Locate David in the story of Israel", "Describe the setting of his anointing"]
    },
    {
      id: "samuel-anoints-david",
      title: "Samuel Anoints David",
      summary: "Explore the anointing and what the passage says about seeing and choosing.",
      kind: "explore",
      scriptureReferences: ["1 Samuel 16:1-13"],
      objectives: ["Recall who anointed David", "Explain the central contrast in the passage"]
    },
    {
      id: "david-and-goliath",
      title: "David and Goliath",
      summary: "Read the encounter in its narrative and historical context.",
      kind: "understand",
      scriptureReferences: ["1 Samuel 17"],
      objectives: ["Retell the main events", "Identify the people and places in the account"]
    },
    {
      id: "david-and-jonathan",
      title: "David and Jonathan",
      summary: "Trace the relationship between David and Jonathan.",
      kind: "connect",
      scriptureReferences: ["1 Samuel 18:1-4", "1 Samuel 20"],
      objectives: ["Describe the covenant between them", "Connect their relationship to the wider narrative"]
    },
    {
      id: "wilderness-years",
      title: "The Wilderness Years",
      summary: "Follow David's flight from Saul and the choices he faces.",
      kind: "read",
      scriptureReferences: ["1 Samuel 23", "1 Samuel 24"],
      objectives: ["Explain why David was pursued", "Compare David's choices in the narrative"]
    },
    {
      id: "kingdom-and-covenant",
      title: "Kingdom and Covenant",
      summary: "Explore David's kingship and the covenant in 2 Samuel.",
      kind: "understand",
      scriptureReferences: ["2 Samuel 5:1-5", "2 Samuel 7:1-17"],
      objectives: ["Summarize David's rise to kingship", "Explain the role of the Davidic covenant in the biblical narrative"]
    },
    {
      id: "remember-david",
      title: "Remember and Connect",
      summary: "Retrieve key details and connect David's story to Psalms and the wider biblical story.",
      kind: "remember",
      scriptureReferences: ["Psalm 23", "2 Samuel 7:1-17"],
      objectives: ["Recall key people and events", "Connect David to other passages without confusing narrative and tradition"]
    },
    {
      id: "test-your-understanding",
      title: "Test Your Understanding",
      summary: "Check what you can recall, explain, and connect without looking at the text.",
      kind: "test",
      scriptureReferences: ["1 Samuel 16:1-13", "1 Samuel 17", "2 Samuel 7:1-17"],
      objectives: ["Recall key events", "Explain the significance of the covenant", "Identify areas to revisit"]
    }
  ]
};
