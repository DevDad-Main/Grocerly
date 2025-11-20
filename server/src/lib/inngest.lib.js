import { Inngest } from "inngest";

//#region Inngest Setup
export const inngest = new Inngest({
  id: "grocerly-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
//#endregion

export const functions = [];
