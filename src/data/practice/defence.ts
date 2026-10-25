/**
 * Practice sets for the defence track: baselines, file integrity, reading logs
 * as a story, alerting on your own device, and the six steps of incident
 * response.
 *
 * Everything here is defensive and aimed at the learner's own device. The
 * output tasks are graded against rules that describe meaning rather than exact
 * characters, because a digest, a port listing and a permission string all
 * differ from phone to phone. Each rule asks whether the output says the right
 * thing, not whether it says it the same way.
 */

import type { PracticeSet } from './types';

export const defenceSets: PracticeSet[] = [
  {
    slug: "baselines",
    title: "Baselines",
    topic: "baselines",
    summary: "Write down what normal is, so a change later has something to compare against.",
    intro:
      "A baseline is a written record of the ordinary state of your device: the packages installed, the ports listening, and the hashes of the files you care about. This set covers why it has to be written down, why the day you take it matters, and what an open listener really means.",
    questions: [
      {
        id: "base-1",
        question: "What is a baseline?",
        options: [
          "A written record of what your device normally looks like, kept so a later change can be compared against it",
          "A full backup copy of every file on the device",
          "A list of the passwords you have used",
          "A program that blocks attackers automatically",
        ],
        answer: 0,
        explanation:
          "A baseline is a short record of normal: the packages installed, the ports listening and the hashes of the files that matter. It is not a backup and it does not block anything. Its only job is to be a fixed point you can compare against, because you cannot notice a change if you never wrote down what normal was.",
      },
      {
        id: "base-2",
        question: "Why does the lesson say to take the baseline on a quiet day?",
        options: [
          "Because a baseline taken during a busy session records the busy session, not the ordinary state",
          "Because commands run faster when nothing else is happening",
          "Because the date command needs a quiet system to print the time",
          "Because packages can only be listed when nothing is running",
        ],
        answer: 0,
        explanation:
          "The record should describe the ordinary state of the device, so it is taken when you are not installing anything and not running anything unusual. Otherwise the baseline bakes in a temporary situation, and later comparisons will show differences that only reflect the busy day rather than a real change.",
      },
      {
        id: "base-3",
        question: "Why pipe the package list through sort before saving it?",
        options: [
          "So two baselines taken on different days line up and diff shows only the real changes",
          "Because the package list is printed in a random order every time",
          "Because sort removes packages that are no longer installed",
          "Because sort compresses the list to save space",
        ],
        answer: 0,
        explanation:
          "Package listings can come out in different orders, and diff compares line by line. Sorting both snapshots puts the same package on the same line, so a difference in the output means a real change rather than a reordering. sort does not remove or compress anything, it only changes the order of the lines.",
      },
      {
        id: "base-4",
        question: "A listener in your baseline sits on 0.0.0.0 instead of 127.0.0.1. What does that mean?",
        options: [
          "The service is reachable from the network, not only from the phone itself",
          "The service is running as root",
          "The port number has changed",
          "The service is encrypted",
        ],
        answer: 0,
        explanation:
          "127.0.0.1 is the loopback address, reachable only from the device itself. 0.0.0.0 means the service listens on every interface, so anything that can reach the phone on that port can try it. That is a door that opened onto the network, and it is exactly the sort of change a baseline is meant to surface.",
      },
    ],
    tasks: [
      {
        id: "base-t1",
        title: "Build and read a baseline snapshot",
        prompt:
          "This writes a small package list and a settings file, then records the ports, the packages and the hashes of those files into one dated snapshot. Read the three sections it prints.",
        command:
          "mkdir -p ~/baseline; printf 'openssh\\nbash\\ncoreutils\\n' > ~/baseline/packages.txt; printf 'settings\\n' > ~/baseline/notes.txt; { echo \"== ports ==\"; ( ss -tuln 2>/dev/null || netstat -tuln 2>/dev/null || echo none ) | head -n 5; echo \"== packages ==\"; sort ~/baseline/packages.txt; echo \"== hashes ==\"; sha256sum ~/baseline/packages.txt ~/baseline/notes.txt; } > ~/baseline/baseline.txt; cat ~/baseline/baseline.txt",
        hint: "The port section is short on purpose. An empty list, or a single loopback listener, is the normal case you are recording.",
        expects:
          "Three headed sections. Under the ports you get whatever your device is listening on, or nothing at all, and both are fine. Under the packages you get the list in sorted order, which is what makes two snapshots line up later. Under the hashes you get one line per file, a 64-character digest, two spaces, then the path. That digest is the record you will compare against in the next lesson. If the hash section is empty, sha256sum did not run.",
        rules: [
          { type: 'matches', pattern: "^\\s*[0-9a-f]{64}\\s+\\S*packages\\.txt", label: "each watched file has a sha256 line" },
          { type: 'matches', pattern: "^\\s*coreutils\\s*$", label: "the package list is sorted and captured" },
          { type: 'lines', min: 6, label: "the snapshot has the three sections" },
          { type: 'absent', pattern: "command not found|No such file or directory|not installed", label: "the commands actually ran" },
        ],
      },
    ],
  },

  {
    slug: "file-integrity",
    title: "File integrity",
    topic: "file-integrity",
    summary: "Hash the files that matter, check them later, and read a mismatch honestly.",
    intro:
      "A hash turns a whole file into one short line. Hash it when you trust it, hash it again later, and the two lines tell you whether anything changed. This set covers what a digest depends on, how a check works, and what a FAILED line does and does not prove.",
    questions: [
      {
        id: "int-1",
        question: "What does a sha256 digest of a file depend on?",
        options: [
          "Only the contents of the file, so the same file always gives the same digest",
          "The file name and its permissions",
          "The time the file was created",
          "The size of the disk the file sits on",
        ],
        answer: 0,
        explanation:
          "A hash is a function of the bytes in the file and nothing else. The name, the permissions, the timestamps and the location are all ignored. That is what makes it a useful fingerprint: hash the same contents twice and you get the same digest, and change a single byte and you get a completely different one.",
      },
      {
        id: "int-2",
        question: "What does sha256sum -c manifest do?",
        options: [
          "It hashes each file listed and compares the result with the stored digest, printing OK or FAILED",
          "It creates a new manifest from the files on disk",
          "It repairs any file whose digest does not match",
          "It encrypts the files named in the manifest",
        ],
        answer: 0,
        explanation:
          "The -c flag means check. sha256sum reads each line of the manifest, hashes the file it names, and compares that with the digest written there. It prints OK when they match and FAILED when they do not, and it never rewrites or repairs a file. Building a manifest is the job you get without -c.",
      },
      {
        id: "int-3",
        question: "What does a FAILED line prove?",
        options: [
          "That the file is not the same as when it was hashed, which could be your own edit or an upgrade",
          "That the device has been compromised by an attacker",
          "That the manifest file itself is corrupt",
          "That the file has been deleted",
        ],
        answer: 0,
        explanation:
          "A mismatch proves only that the contents changed. Your own edit, a package upgrade that rewrote the file, or a script all produce the same FAILED line. It is a question to investigate rather than a verdict, and the honest next step is to ask what writes to that file instead of assuming the worst.",
      },
      {
        id: "int-4",
        question: "Why keep the manifest somewhere the watched file cannot reach?",
        options: [
          "Because anyone who can write the file could rewrite the manifest to match, hiding the change",
          "Because sha256sum refuses to read a manifest in the same folder",
          "Because the manifest grows too large next to the file",
          "Because diff cannot compare two files in one folder",
        ],
        answer: 0,
        explanation:
          "Integrity checking is only as trustworthy as the record of the good hashes. If something can write the watched file, it can usually write the manifest beside it and make the check pass again. Keeping the manifest read-only, backed up, or off the device removes that weakness.",
      },
    ],
    tasks: [
      {
        id: "int-t1",
        title: "Make a manifest and check it",
        prompt:
          "This makes two small files, builds a manifest of their hashes with find and sha256sum, then checks the manifest straight back. Watch the two halves: the digests first, then the OK lines.",
        command:
          "cd ~; mkdir -p watch; printf 'alpha\\n' > watch/a.txt; printf 'beta\\n' > watch/b.txt; find watch -type f -exec sha256sum {} + | sort -k2 > watch.sha256; cat watch.sha256; sha256sum -c watch.sha256",
        hint: "The manifest is the list of digests. The check reads that list and re-hashes each file, so the OK lines are the second half of the same run.",
        expects:
          "Two halves. The first half is the manifest: one line per file, each a 64-character digest, two spaces, then the path, sorted by path so it stays stable. The second half is the check, one line per file ending in OK, because nothing has changed yet. Change a file and its line would read FAILED instead, which is the whole point of keeping the manifest. If no OK line appears, sha256sum -c could not read the manifest.",
        rules: [
          { type: 'matches', pattern: "^\\s*[0-9a-f]{64}\\s+watch/a\\.txt", label: "the manifest holds a hash for each watched file" },
          { type: 'matches', pattern: "^\\s*watch/[ab]\\.txt:\\s*OK", label: "the check reports every file as OK" },
          { type: 'lines', min: 4, label: "the manifest and the check are both shown" },
          { type: 'absent', pattern: "command not found|No such file or directory|not installed", label: "the commands actually ran" },
        ],
      },
    ],
  },

  {
    slug: "logs-as-a-story",
    title: "Reading logs for a story",
    topic: "logs-as-a-story",
    summary: "Read a log as a whole and build a short timeline of who did what and when.",
    intro:
      "A log is a list of events, and a list of events becomes a story once you put it in order. This set covers picking fields out of a line, counting who was busy, why the sort before uniq matters, and how to read a run of failures without jumping to a conclusion.",
    questions: [
      {
        id: "log-1",
        question: "Why does awk '{print $1, $2, $4}' print the time, the user and the result?",
        options: [
          "awk splits each line on whitespace and numbers the fields from one, so those are the first, second and fourth fields",
          "awk always prints the first, second and fourth lines of the file",
          "awk sorts the fields alphabetically and prints three of them",
          "awk removes the third field from every line in place",
        ],
        answer: 0,
        explanation:
          "By default awk splits each line on runs of whitespace and numbers the pieces starting at one. In a log line the timestamp is field one, the user is field two and the result is field four, so asking for those three prints a clean summary. It reads every line of the file, not just the first few, and it does not change the file.",
      },
      {
        id: "log-2",
        question: "Why must sort come before uniq -c?",
        options: [
          "uniq only counts lines that are next to each other, so repeats have to be grouped first",
          "uniq requires its input in reverse order",
          "sort removes the blank lines that uniq cannot handle",
          "uniq only accepts numbers, which sort produces",
        ],
        answer: 0,
        explanation:
          "uniq compares each line with the one before it, so it counts a run of identical lines and nothing else. If the same value appears in two separate places, uniq reports two runs of one. Sorting first brings the copies together so there is a single run to count, which is why the two commands are almost always used as a pair.",
      },
      {
        id: "log-3",
        question: "Why is ISO 8601 a good timestamp format for a log you write yourself?",
        options: [
          "Because sorting the text also sorts the moments, so a plain sort puts the events in time order",
          "Because it is the shortest way to write a time",
          "Because it hides the time zone from anyone reading the log",
          "Because awk cannot read any other format",
        ],
        answer: 0,
        explanation:
          "In ISO 8601 the largest unit comes first, year then month then day then time, so a line-by-line text sort and a chronological sort give the same order. That is what lets a plain sort build a timeline. It is not shorter than other formats, and it does not hide the zone, because the Z or the offset is part of it.",
      },
      {
        id: "log-4",
        question: "A run of failures ends in a success from the same source. What should you do?",
        options: [
          "Treat it as a question: check whether the account and the login are ones you recognise before deciding",
          "Assume the account was compromised and delete it immediately",
          "Ignore it, because a log does not prove anything",
          "Change every password on the device at once",
        ],
        answer: 0,
        explanation:
          "Many failures and then a success is the shape a guessed password makes, but a broken script or a stale saved password looks the same. The log tells you what happened, not why. Use it to ask a sharp question, then check the account itself, and act once you know rather than guessing in either direction.",
      },
    ],
    tasks: [
      {
        id: "log-t1",
        title: "Turn a log into a timeline",
        prompt:
          "This writes a short auth log and then reads it two ways: as a timeline of time, user and result, and as a ranking of the sources that failed. Read the shape of both, not the exact addresses.",
        command:
          "printf '2026-10-25T09:01:00Z user=mira src=203.0.113.14 result=ok\\n2026-10-25T09:02:10Z user=root src=198.51.100.7 result=fail\\n2026-10-25T09:02:12Z user=root src=198.51.100.7 result=fail\\n2026-10-25T09:03:00Z user=root src=198.51.100.7 result=ok\\n' > ~/auth.log; awk '{print $1, $2, $4}' ~/auth.log; echo \"== failures per source ==\"; grep 'result=fail' ~/auth.log | cut -d' ' -f3 | sort | uniq -c | sort -nr",
        hint: "The timeline drops the source field. The ranking keeps only the source field. Each view answers a different question about the same lines.",
        expects:
          "A timeline of four lines, each a timestamp, a user and a result, in the order the events happened. Then a heading and one ranked row per failing source, each a count then the source, largest count first. The timeline tells you what happened in sequence; the ranking tells you who was noisiest. Together they are the story in a screen, which is the point of the lesson. An empty ranking means the grep found no failures.",
        rules: [
          { type: 'matches', pattern: "^\\s*\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z\\s+user=\\S+\\s+result=\\S+", label: "the timeline shows the time, the user and the result" },
          { type: 'matches', pattern: "^\\s*\\d+\\s+src=\\d{1,3}(\\.\\d{1,3}){3}", label: "each noisy source is ranked with a count" },
          { type: 'lines', min: 5, label: "the timeline and the ranking are both shown" },
          { type: 'absent', pattern: "command not found|No such file or directory|not installed", label: "the commands actually ran" },
        ],
      },
    ],
  },

  {
    slug: "alerting-on-your-own-device",
    title: "Alerting on your own device",
    topic: "alerting-on-your-own-device",
    summary: "Make the phone tell you when something changes, with a check on a timer and a log you read.",
    intro:
      "A check you have to remember to run is a check you will stop running. This set covers keeping a check quiet by default, comparing two states, appending rather than overwriting, and giving cron everything it needs to run your job without you.",
    questions: [
      {
        id: "alert-1",
        question: "Why should a check print nothing when everything is fine?",
        options: [
          "Because a check that reports success every day trains you to ignore it, which is worse than no check",
          "Because printing takes too much time on a phone",
          "Because cron cannot run a command that produces output",
          "Because an empty line breaks the log format",
        ],
        answer: 0,
        explanation:
          "An alert only works if it means something. If the log fills with daily all-clear lines you stop reading it, and a log you do not read has done nothing. Quiet by default means every line in the log is news, so the log stays worth checking.",
      },
      {
        id: "alert-2",
        question: "What does diff -q do when the two files match?",
        options: [
          "It prints nothing and returns a success status, which is what the if ! test relies on",
          "It prints the words Files are identical",
          "It deletes the older of the two files",
          "It exits with a failure status",
        ],
        answer: 0,
        explanation:
          "The -q flag means quiet, so diff only reports whether the files differ and prints nothing when they are the same. The check uses if ! diff -q, which runs its branch only when diff fails, that is when the files differ. Matching files produce silence and a zero status, which is the quiet success the design wants.",
      },
      {
        id: "alert-3",
        question: "Why use >> rather than > when writing the alert log?",
        options: [
          "Because >> appends, so the history of earlier alerts is kept instead of being overwritten each run",
          "Because >> runs the command twice",
          "Because >> writes only errors and ignores normal output",
          "Because >> makes the file readable only by the owner",
        ],
        answer: 0,
        explanation:
          "A single > replaces the file contents with the new output, so every run would wipe the alerts before it and leave only the latest. A double >> adds to the end, so the log accumulates and you can see the order and the frequency of events. The value of the log comes from that history.",
      },
      {
        id: "alert-4",
        question: "Why must a cron job name the full path to the script?",
        options: [
          "Because cron runs with a minimal environment and does not read your shell startup files, so PATH may not include it",
          "Because cron cannot run a script without the execute bit",
          "Because full paths run faster than short ones",
          "Because cron rewrites the command and shortens it",
        ],
        answer: 0,
        explanation:
          "Cron starts the job with a small environment and a short PATH that often leaves out the Termux bin directory, so a bare command name may not be found even though it works when you type it yourself. Naming the script in full, or setting PATH at the top of the script, removes that dependency on the environment.",
      },
    ],
    tasks: [
      {
        id: "alert-t1",
        title: "Fire one alert, quietly",
        prompt:
          "This compares two short lists, finds that one line was added, and appends a single stamped alert to a log. Run it twice if you like: the second run adds nothing, because nothing changed.",
        command:
          "cd ~; printf 'a\\nb\\n' > base.txt; printf 'a\\nb\\nc\\n' > now.txt; if ! diff -q base.txt now.txt >/dev/null; then printf '%s ALERT new line: %s\\n' \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\" \"$(comm -13 base.txt now.txt | tr '\\n' ' ')\" >> alert.log; fi; cat alert.log",
        hint: "The whole thing is one if. When the two files match, the if does not run, and silence is the success case.",
        expects:
          "One line in the alert log, starting with an ISO 8601 timestamp in UTC, then the word ALERT, then the change that was found. The line was appended, not overwritten, so earlier alerts would still be above it. A second run with no change adds nothing at all, which is the quiet-by-default behaviour the lesson builds. If the log is empty, the comparison did not detect the added line.",
        rules: [
          { type: 'matches', pattern: "^\\s*\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z\\s+ALERT", label: "the alert line is stamped with the time it fired" },
          { type: 'contains', value: "new line: c", label: "the alert names the change it found" },
          { type: 'lines', min: 1, label: "the alert log holds the entry" },
          { type: 'absent', pattern: "command not found|No such file or directory|not installed", label: "the commands actually ran" },
        ],
      },
    ],
  },

  {
    slug: "incident-response-steps",
    title: "Incident response, in six steps",
    topic: "incident-response-steps",
    summary: "Preparation, identification, containment, eradication, recovery and lessons learned.",
    intro:
      "When something looks wrong, a calm order of steps beats a rush. This set covers the six phases of incident response applied to a small incident on your own device, and why the last phase, the one most people skip, is the one that makes the next incident easier.",
    questions: [
      {
        id: "ir-1",
        question: "What is the purpose of the preparation phase?",
        options: [
          "To have what you will need ready before an incident, such as a baseline, a manifest and a known-good copy",
          "To identify the attacker before they act",
          "To delete any suspicious files in advance",
          "To write the incident report at the end",
        ],
        answer: 0,
        explanation:
          "Preparation happens before anything goes wrong, which is why it comes first. A baseline, a manifest of hashes and a copy of the files you trust mean the later phases are quick rather than frantic. It does not identify anyone and it does not remove anything, it just makes sure the tools are to hand when you need them.",
      },
      {
        id: "ir-2",
        question: "Why take a snapshot before changing anything?",
        options: [
          "Because once you restart a service or delete a file the evidence is gone, so the record has to be made first",
          "Because snapshots are required by cron",
          "Because a snapshot stops the problem from spreading",
          "Because writing a file locks it against further change",
        ],
        answer: 0,
        explanation:
          "The state of the device at the moment you noticed the problem is the only evidence of how it looked then. Restarting or deleting changes that state, and the record cannot be recreated afterwards. A snapshot costs one command, and it is the difference between knowing what happened and guessing.",
      },
      {
        id: "ir-3",
        question: "How does containment differ from eradication?",
        options: [
          "Containment stops the damage spreading while you investigate, while eradication removes the cause and restores the file",
          "Containment removes the cause, and eradication stops the damage spreading",
          "Containment and eradication are two names for the same step",
          "Containment deletes the log, and eradication writes a new one",
        ],
        answer: 0,
        explanation:
          "Containment is a holding action: close the open door and stop anything you do not recognise so no more damage can occur. Eradication comes after and deals with the cause, usually by putting a known-good copy back and finding what wrote to the bad file. Doing them in the other order risks cleaning up before you understand the problem.",
      },
      {
        id: "ir-4",
        question: "Why is lessons learned the phase most people skip, and why does it matter?",
        options: [
          "Because the incident feels over, yet it is the step that makes the next detection and response faster",
          "Because it is impossible to write down what happened",
          "Because it must be done by an administrator",
          "Because it deletes the incident record",
        ],
        answer: 0,
        explanation:
          "Once the device works again the urgency drops and the note never gets written. But the note is what turns one incident into a better baseline, a wider watch and a fresher good copy. Each lesson points at one concrete change, and that is how the whole loop improves over time.",
      },
    ],
    tasks: [
      {
        id: "ir-t1",
        title: "Take an incident snapshot",
        prompt:
          "This makes an evidence file, locks its permissions down, and writes a dated snapshot of the device state: the time, the listening ports, the file permissions and the file hash. Read it as the record you would keep at the start of an incident.",
        command:
          "cd ~; mkdir -p ir; printf 'report\\n' > ir/evidence.txt; chmod 600 ir/evidence.txt; { echo \"== when ==\"; date -u +%Y-%m-%dT%H:%M:%SZ; echo \"== listeners ==\"; ( ss -tuln 2>/dev/null || netstat -tuln 2>/dev/null || echo none ) | head -n 5; echo \"== file ==\"; ls -l ir/evidence.txt; sha256sum ir/evidence.txt; } > ir/incident.txt; cat ir/incident.txt",
        hint: "The order matters. The snapshot is taken before anything is changed, so it is the record of how things looked when the problem started.",
        expects:
          "Three headed sections. Under when you get the time in UTC. Under listeners you get the ports, or none, which is the door check. Under file you get the long listing, which should show owner-only permissions, and then the sha256 digest of the evidence file. That digest is what you compare with your manifest to confirm a change. If the file line shows -rw-r--r--, the permissions are too loose for evidence you care about.",
        rules: [
          { type: 'matches', pattern: "^\\s*-rw-------", label: "the evidence file keeps owner-only permissions" },
          { type: 'matches', pattern: "^\\s*[0-9a-f]{64}\\s+ir/evidence\\.txt", label: "the evidence file hash is recorded" },
          { type: 'lines', min: 6, label: "the snapshot has every section" },
          { type: 'absent', pattern: "command not found|No such file or directory|not installed", label: "the commands actually ran" },
        ],
      },
    ],
  },

];
