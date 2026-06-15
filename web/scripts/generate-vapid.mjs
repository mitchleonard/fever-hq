#!/usr/bin/env node
/**
 * One-time VAPID key generator for Fever HQ web push.
 * Run: node scripts/generate-vapid.mjs
 * Copy the output into your .env.local AND your Vercel project env vars.
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("VAPID_CONTACT_EMAIL=mailto:mitch@mitchleonard.com");
console.log("");
console.log("Paste these into web/.env.local for dev and into");
console.log("Vercel Project Settings -> Environment Variables for prod.");
