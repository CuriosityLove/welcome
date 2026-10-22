# Curiosity.Love Client Onboarding

Private, password-protected onboarding brief for Curiosity.Love clients, served at **onboarding.curiosity.love**.

Each client gets their own link (`onboarding.curiosity.love/client-name`) and password. Inside, they complete a short brief covering company, team, brand, assets, digital presence, goals, billing details and permissions. Submissions are emailed to the studio through Formspree.

## Files

```
public/
  index.html      Page shell
  config.js       Studio settings and client list  ← the file you edit
  questions.js    The questionnaire (sections and questions)
  app.js          Portal logic
  styles.css      Design
  favicon.svg     Heart mark
  robots.txt      Keeps the portal out of search engines
render.yaml       Render deployment settings
```

There is no build step. It is plain HTML, CSS and JavaScript.

## First deploy on Render

1. Push this folder to a new GitHub repository (private is fine).
2. In Render, choose **New > Blueprint**, connect the repository, and apply. Render reads `render.yaml` and creates a static site called `curiosity-onboarding`.
3. In the new site's **Settings > Custom Domains**, confirm `onboarding.curiosity.love` is listed. Render shows a target like `curiosity-onboarding.onrender.com`.
4. Where the curiosity.love DNS is managed, add a record:
   - Type: `CNAME`
   - Name: `onboarding`
   - Value: the `onrender.com` address Render shows
5. Back in Render, click **Verify**. HTTPS is issued automatically, usually within a few minutes.

Every push to the main branch redeploys the site.

## Adding a client

1. Go to `onboarding.curiosity.love/admin`.
2. Enter the client name, a password (10+ characters), the engagement, and an optional upload folder link.
3. Click **Generate**. Copy the client entry into the `CLIENTS` list in `public/config.js`.
4. Commit and push. Render redeploys in about a minute.
5. Send the client the welcome message the admin page generated. Send the password separately if you prefer.

To remove access, delete the client's entry and push.

## Editing the questions

Open `public/questions.js`. Each section has a title, intro and list of fields. Field types: `text`, `email`, `url`, `tel`, `textarea`, `select`, `chips` (multiple choice), `group` (sub-heading). Add `req: true` to make a question required, or `when: { k: "other_field", v: "Yes" }` to show it only after a specific answer.

## Submissions

Briefs post to the Formspree form set in `config.js` (`formEndpoint`) and arrive by email. In Formspree you can also export all submissions as CSV.

## Security notes

- Passwords are stored only as hashes, never in plain text.
- The password gate keeps the portal private and unlisted. It is not a substitute for real account security, so the portal never asks for passwords, card numbers or bank details.
- Drafts save in the client's own browser until they send the brief.

## Local preview

Open `public/index.html` through any local server, for example:

```
cd public && python3 -m http.server 8000
```

Then visit `http://localhost:8000/?c=demo`. Preview login: client code `demo`, password `curiosity`. Remove the `demo` entry from `config.js` whenever you like.
