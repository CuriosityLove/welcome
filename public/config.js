/* Curiosity.Love onboarding: studio settings and client list.
   This is the only file you normally edit. */

/* ============================================================
   STUDIO SETTINGS
   ============================================================ */
const STUDIO = {
  formEndpoint: "https://formspree.io/f/xnjkkven",  // submissions are emailed from here
  email: "am@curiosity.love",                        // shown to clients; access invites come from here
  turnaround: "two business days",
  domain: "https://onboarding.curiosity.love"
};

/* ============================================================
   CLIENTS  ·  one entry per client
   Make new entries at onboarding.curiosity.love/admin, paste them below, commit and push.
   ------------------------------------------------------------
   name         Client name shown in the portal
   hash         Generated from the client code + password
   lead         Studio lead for the engagement
   engagement   Short description of the work
   uploadLink   Google Drive / Dropbox file request link (optional)
   agreement    { status: "pending" | "signed", link: "DocuSign / PandaDoc link" }
   kickoff      { date: "Nov 4, 2026 · 10am PT", link: "Calendly or Google booking link" }
   ============================================================ */
const CLIENTS = {
  "demo": {
    name: "Your Company", hash: "a962d0a8c4e278c62901c94001924d6a34db609a5d70aba6f032c8012c4c6270",
    lead: "Anthony Morey", engagement: "Brand strategy and website (example)",
    uploadLink: "",
    agreement: { status: "signed", link: "" },
    kickoff: { date: "", link: "" }
  },
     "leovo-group": {
    name: "Leovo Group", hash: "79f37a8d99e9e93cead4fd08e7528a8dbdd26ae379ac59fe464d082d53cabe1c",
    lead: "Anthony Morey", engagement: "Brand Development",
    uploadLink: "https://drive.google.com/drive/folders/1-DyUwvgWcHToSZab-2LN5jMBy1JlaPN5?usp=drive_link",
    agreement: { status: "pending", link: "" },
    kickoff: { date: "", link: "" }
  },
};
