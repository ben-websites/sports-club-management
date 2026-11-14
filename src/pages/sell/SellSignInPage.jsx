// `/sell/login` and `/owner/login` are the same screen (Google-only entry point
// for club owners). Kept as its own module so the "sell" route tree can be moved
// into a separate build later without touching the owner login page.
export { default } from "../auth/OwnerLoginPage";
