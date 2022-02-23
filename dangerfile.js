const PR_LINK = `([#${danger.github.pr.number}](${danger.github.pr.html_url}))`;

const CHANGELOG_SUMMARY_TITLE = `Instructions and example for changelog`;
const CHANGELOG_BODY = `Please add an entry to \`CHANGELOG.md\` to the "Unreleased" section. Make sure the entry includes this PR's number.
Example:`;

const CHANGELOG_END_BODY = `If none of the above apply, you can opt out of this check by adding \`#skip-changelog\` to the PR description.`;


async function checkDocs() {
  if (danger.github.pr.title.startsWith("feat:")) {
    message(
      'Do not forget to update <a href="https://github.com/getsentry/sentry-docs">Sentry-docs</a> with your feature once the pull request gets approved.'
    );
  }
}

function getCleanTitleWithPrLink() {
  const title = danger.github.pr.title;
  return title.split(": ").slice(-1)[0].trim().replace(/\.+$/, "") + ` ` + PR_LINK;
}

function getChangelogDetailsHtml() {
  return `
### ${CHANGELOG_SUMMARY_TITLE}
${CHANGELOG_BODY}
\`\`\`markdown
## Unreleased

### Fixes/Features

- ${getCleanTitleWithPrLink()}
\`\`\`
${CHANGELOG_END_BODY}
`;
}


async function checkChangelog() {
  const changelogFile = "CHANGELOG.md";

  // Check if skipped
  const skipChangelog =
    danger.github && (danger.github.pr.body + "").toLowerCase().includes("#skip-changelog");

  if (skipChangelog) {
    return;
  }

  // Check if current PR has an entry in changelog
  const changelogContents = await danger.github.utils.fileContents(
    changelogFile
  );

  const hasChangelogEntry = RegExp(`#${danger.github.pr.number}\\b`).test(
    changelogContents
  );

  if (hasChangelogEntry) {
    return;
  }

  // Report missing changelog entry
  fail("Please consider adding a changelog entry for the next release.");
  markdown(getChangelogDetailsHtml());
}

async function checkAll() {
  // See: https://spectrum.chat/danger/javascript/support-for-github-draft-prs~82948576-ce84-40e7-a043-7675e5bf5690
  const isDraft = danger.github.pr.mergeable_state === "draft";

  if (isDraft) {
    return;
  }

  await checkDocs();
  await checkChangelog();
}

schedule(checkAll);
