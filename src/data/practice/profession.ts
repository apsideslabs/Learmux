/**
 * Practice sets for the "Working in security" track: authorisation and the law,
 * writing a finding, responsible disclosure, and how people actually learn and
 * prove security skills.
 *
 * These lessons are about judgement rather than commands, so the questions test
 * the reasoning a reader needs to make a decision safely. Each output task
 * still runs a command on the device: it writes a short document the lesson
 * describes and reads it back, so the learner ends with something on screen.
 * The rules check the shape of the document, not the exact characters.
 */

import type { PracticeSet } from './types';

export const professionSets: PracticeSet[] = [
  {
    slug: 'rules-of-engagement',
    title: 'Rules of engagement and the law',
    topic: 'rules-of-engagement',
    summary: 'Written authorisation, the parts of a scope, and why permission comes before any test.',
    intro:
      'The part of security work above the tools is permission. This set covers what written authorisation contains, why a spoken yes is not enough, the four kinds of system you might face, and why testing anything you do not own is an offence in most countries.',
    questions: [
      {
        id: 'roe-1',
        question: 'Why is verbal permission not enough to test a system?',
        options: [
          'A written scope is the record of what was authorised if something goes wrong',
          'Because verbal agreements are illegal in every country',
          'Because writing it down makes the test run faster',
          'Because only a lawyer can give permission',
        ],
        answer: 0,
        explanation:
          'If a test causes an outage or a page a customer sees, the question asked afterwards is who authorised it, and a memory of a conversation is not an answer. A signed message or an email that names the scope is. Written permission also fixes what you agreed to, so neither side can later claim a wider or narrower mandate than was given.',
      },
      {
        id: 'roe-2',
        question: 'Which of these is authorisation to test a system?',
        options: [
          'A signed scope from the owner naming the systems and the dates',
          'A friend who works there saying it is fine',
          'The site having a public issue tracker',
          'The system being easy to reach',
        ],
        answer: 0,
        explanation:
          'Authorisation comes from someone entitled to give it, in writing, and it names the systems, the activity and the time. A friend who works somewhere usually cannot authorise testing of their employer\'s systems, a public tracker is not permission, and reachability has nothing to do with it. Without a written scope that names the system and the dates, treat the answer as no.',
      },
      {
        id: 'roe-3',
        question: 'What does "out of bounds" mean in a rules of engagement document?',
        options: [
          'Things you may not do even inside the agreed scope',
          'The time window in which you may test',
          'The list of systems you may test',
          'The person to call if something breaks',
        ],
        answer: 0,
        explanation:
          'Out of bounds is everything you may not do even inside scope: taking data out, changing data, testing a connected third-party service, or anything that could damage availability. The scope names the systems you may test, the time window says when, and the contact says who to call if something breaks. All five parts are separate, and all of them belong in the document.',
      },
      {
        id: 'roe-4',
        question: 'Which statement about unauthorised access is accurate?',
        options: [
          'It is an offence in most countries, and the details differ, so check your own jurisdiction',
          'It is legal if you mean no harm and find nothing',
          'Only causing damage is an offence, not the access itself',
          'The rules are the same in every country',
        ],
        answer: 0,
        explanation:
          'Unauthorised access is a criminal offence in most countries, but the names and the details differ: what counts as access, the penalties, and whether intent matters. Meaning no harm is not a defence on its own, nor is finding nothing, stopping, or the door being open. Because it depends on where you are, check your own jurisdiction, and treat this as information rather than legal advice.',
      },
    ],
    tasks: [
      {
        id: 'roe-t1',
        title: 'Write rules of engagement for your own lab',
        prompt:
          'Before you test anything, write down the scope, the window, the limits and the contact. This writes a short rules of engagement document for your own phone and reads it back. Every line is a decision about what you are allowed to touch.',
        command:
          'mkdir -p ~/lab; printf "scope: my own phone and its Termux install\\nwindow: 2026-10-25, 09:00 to 17:00\\nout of bounds: shared storage and every other device\\ncontact: me, on this device\\n" > ~/lab/roe.txt; cat ~/lab/roe.txt; echo "---"; wc -l < ~/lab/roe.txt',
        hint: 'Four lines: scope, window, what is out of bounds, and the contact.',
        expects:
          'Four lines naming the scope, the time window, what is out of bounds, and the contact, then a divider and a line count. On your own lab the contact is you, but the shape is the one you would use for a system that was not yours. Notice that the out-of-bounds line rules out shared storage, the one place on a phone where other apps could be affected.',
        rules: [
          { type: 'matches', pattern: '^\\s*scope:', label: 'the document states what is in scope' },
          { type: 'matches', pattern: '^\\s*out of bounds:', label: 'it states what is out of bounds' },
          { type: 'matches', pattern: '^\\s*contact:', label: 'it names who to call if something breaks' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'writing-a-finding',
    title: 'Writing a finding someone can act on',
    topic: 'writing-a-finding',
    summary: 'The five parts in order, honest severity, and both the problem and the fix.',
    intro:
      'A finding is the thing that comes out of security work, and it has to be readable by someone who was not there. This set covers the five parts and their order, why honest severity matters, what a reproduction needs, and why a reader needs a fix as well as a finding.',
    questions: [
      {
        id: 'find-1',
        question: 'What order do the parts of a finding go in?',
        options: [
          'Title, observation, impact, reproduction, fix',
          'Fix, title, impact, observation, reproduction',
          'Impact, title, fix, reproduction, observation',
          'Title, fix, observation, impact, reproduction',
        ],
        answer: 0,
        explanation:
          'The reader is asking a sequence of questions, so the finding answers them in order: what is wrong, what you saw, why it matters, how to see it, and what to do. A title that says what is wrong is the first thing read and sometimes the only thing read. Putting the fix first leaves the reader without the reason for it.',
      },
      {
        id: 'find-2',
        question: 'Why does calling every finding "critical" make a report worse?',
        options: [
          'Because the word stops meaning anything and the reader learns to discount the reports',
          'Because critical findings are always wrong',
          'Because the word is not allowed in reports',
          'Because it makes the report too long to read',
        ],
        answer: 0,
        explanation:
          'When every finding is critical, the word stops meaning anything, and the reader learns to discount your reports. That is worse than a missed high rating. Rate the problem by how much damage it would cause and how much effort it would take to use, not by your excitement at finding it, so the reader can prioritise.',
      },
      {
        id: 'find-3',
        question: 'What should the reproduction part of a finding contain?',
        options: [
          'The exact command and the exact output',
          'A short summary of the problem',
          'A list of the tools you used',
          'Your opinion of how serious it is',
        ],
        answer: 0,
        explanation:
          'If someone else can follow your steps and see the same thing, the finding is real and closed to argument. Give the exact command and the exact output, not a description or a summary, so the reader can run one line and see it for themselves. A finding nobody reproduces is a finding nobody acts on.',
      },
      {
        id: 'find-4',
        question: 'Why does a reader need a fix as well as a finding?',
        options: [
          'Because the person acting may not know which of several commands to use, so a concrete recommendation helps',
          'Because a finding is not real without a fix attached',
          'Because fixes must be approved by the vendor first',
          'Because a fix makes the reproduction unnecessary',
        ],
        answer: 0,
        explanation:
          'A finding says what is wrong and a fix says what to do about it. The person who acts may be a developer who has never seen the file, or a phone owner who does not know which of two commands is right, and "improve the file permissions" leaves them to guess. A concrete recommendation, such as chmod 600 on the file, tells them exactly what to do.',
      },
    ],
    tasks: [
      {
        id: 'find-t1',
        title: 'Write a finding in the five parts',
        prompt:
          'A finding is a title, what you saw, why it matters, how to reproduce it, and what to do, in that order. This writes a finding about a world readable notes file and reads it back. Notice that the reproduce line names the exact command and the fix line names the exact change.',
        command:
          'mkdir -p ~/findings; printf "title: notes.txt is world readable\\nobserved: notes.txt has mode 644, so other apps can read it\\nimpact: a private note is exposed to anything with storage access\\nreproduce: ls -l ~/findings/notes.txt\\nfix: chmod 600 ~/findings/notes.txt\\n" > ~/findings/notes-permissions.txt; cat ~/findings/notes-permissions.txt',
        hint: 'Five lines, one per part, and the reproduce line holds a real command.',
        expects:
          'Five lines in order: the title, the observation, the impact, the reproduction and the fix. The reproduce line names the exact command, ls, so a reader can run it and see the mode, and the fix line names the exact change, chmod 600. Your own finding would describe a different problem, but the five parts and their order stay the same.',
        rules: [
          { type: 'matches', pattern: '^\\s*title:', label: 'the finding opens with a title' },
          { type: 'matches', pattern: '^\\s*reproduce:.*\\b(ls|chmod|cat|stat)\\b', label: 'the reproduce step names the exact command' },
          { type: 'matches', pattern: '^\\s*fix:', label: 'it ends with what to do about it' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'responsible-disclosure',
    title: 'Responsible disclosure',
    topic: 'responsible-disclosure',
    summary: 'Report privately, give a window, find the contact, and keep a record.',
    intro:
      'You will find a problem in something you do not own, and how you handle it matters more than the problem. This set covers reporting privately, a reasonable window, finding a security contact, and the difference between publishing an exploit and a write-up after a fix.',
    questions: [
      {
        id: 'disc-1',
        question: 'What is the first move when you find a problem in something you do not own?',
        options: [
          'Report it privately to the people who can fix it',
          'Post it on a public forum so others can check it',
          'Publish a working exploit to prove it is real',
          'Do nothing and forget about it',
        ],
        answer: 0,
        explanation:
          'Report privately first, to the people who can fix it and only them. A security contact address, a bug bounty programme, or a direct message to a maintainer are private; a public issue tracker, a social post, or a forum thread are not, because anyone can read them, including people who would use the problem before it is fixed.',
      },
      {
        id: 'disc-2',
        question: 'What is a common starting window before a public write-up?',
        options: [
          '90 days from the report',
          '24 hours from the report',
          '5 years from the report',
          'No window is ever needed',
        ],
        answer: 0,
        explanation:
          'A common starting point is 90 days from the report, though some vendors publish their own timeline and you should follow theirs. Ninety days is not a law; it is a convention that gives a maintainer fair time without leaving a problem open forever. If the maintainer is working with you and asks for more, giving it is usually right.',
      },
      {
        id: 'disc-3',
        question: 'Where might you find a security contact for a project?',
        options: [
          'A security page, a bug bounty programme, a SECURITY.md file, or /.well-known/security.txt',
          'Only in the source code comments',
          'Only by asking on social media',
          'There is never a way to find one',
        ],
        answer: 0,
        explanation:
          'Most projects have a way to be told. Look for a security page, often at a path like /security; a bug bounty programme with its own form; a SECURITY.md file in an open source repository; or a security.txt published at /.well-known/security.txt, which names the contact so a finder does not have to guess an address.',
      },
      {
        id: 'disc-4',
        question: 'How is publishing a working exploit different from a write-up after a fix?',
        options: [
          'An exploit is a tool anyone can use while the door is open, while a write-up after a fix explains and risks no one',
          'They are the same act under a different name',
          'A write-up is illegal and an exploit is not',
          'An exploit is safe because it is technical',
        ],
        answer: 0,
        explanation:
          'A working exploit is a tool: anyone who has it can use the problem, so publishing one before a fix hands it out while the door is still open. A write-up after a fix is a record that explains what was wrong and how it was fixed, so others can learn without risk. Ask what a reader could do with what you are about to publish, and whether that is now safe.',
      },
    ],
    tasks: [
      {
        id: 'disc-t1',
        title: 'Keep a disclosure record',
        prompt:
          'When you report a problem, keep a record of what you did and when. This writes a short disclosure record and reads it back. The contact line names where the security contact was found, and the window line records the time you agreed to give before any write-up.',
        command:
          'mkdir -p ~/disclosure; printf "vendor: example project, example.org\\ncontact: security@example.org, listed in /.well-known/security.txt\\nreported: 2026-10-25, privately by email\\nwindow: 90 days from the report before any write-up\\nstatus: reported and awaiting a reply\\n" > ~/disclosure/record.txt; cat ~/disclosure/record.txt',
        hint: 'Five lines: the vendor, the contact, when you reported, the window, and the status.',
        expects:
          'Five lines recording the vendor, the security contact and where it was found, the date you reported, the disclosure window, and the current status. With these lines you can reconstruct the whole sequence later: when you reported, to whom, how you found them, and where things stand. Keeping the record is how a single report becomes a habit you can point at.',
        rules: [
          { type: 'matches', pattern: '^\\s*contact:', label: 'the record names the security contact' },
          { type: 'matches', pattern: '^\\s*reported:', label: 'it records when the report was made' },
          { type: 'matches', pattern: '^\\s*(window|status):', label: 'it notes the disclosure window or its status' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'certifications-and-labs',
    title: 'Certifications, labs and what they actually prove',
    topic: 'certifications-and-labs',
    summary: 'What a certificate shows, where to practise legally, and how to build a portfolio.',
    intro:
      'Certifications are a signal, not a proof, and hands-on work is what hiring actually reads. This set covers what a certificate does and does not show, the categories of certification, the free and legal places to practise, and how to write up work you actually did.',
    questions: [
      {
        id: 'cert-1',
        question: 'What does a certification prove?',
        options: [
          'That you passed an exam and met a standard on a given day',
          'That you can find and fix any real problem',
          'That you have worked in the field for several years',
          'That you know every tool in the field',
        ],
        answer: 0,
        explanation:
          'A certification is evidence that you passed an exam: you learned a body of material and met a standard on a given day. It is a signal, not a proof, because an exam is a fixed set of questions taken at a moment and cannot see how you behave when a real system surprises you. Hands-on work is what hiring actually looks at.',
      },
      {
        id: 'cert-2',
        question: 'Which kind of certificate is scored on a live system?',
        options: [
          'A practical, hands-on certificate',
          'An entry-level general certificate',
          'A vendor product certificate',
          'A governance, risk and compliance certificate',
        ],
        answer: 0,
        explanation:
          'Practical, hands-on certificates put you in front of a live system and score what you do, not what you remember, so they carry more weight with people who do the work. Entry-level certificates are broad and shallow, vendor certificates prove you know one company\'s tool, and governance certificates are about the rules and paperwork around security.',
      },
      {
        id: 'cert-3',
        question: 'Which of these is a free and legal place to practise?',
        options: [
          'A deliberately vulnerable application run locally on your own device',
          'A website you use but do not own',
          'Your employer\'s production server',
          'A stranger\'s server you happen to be able to reach',
        ],
        answer: 0,
        explanation:
          'A deliberately vulnerable application is written to be broken and meant to be run locally, so you practise against a real target with no legal question. Your own lab, invited platforms with published rules, and capture-the-flag events are the other free places. A system you do not own needs written permission, which is the whole point of the rules of engagement lesson.',
      },
      {
        id: 'cert-4',
        question: 'What makes a portfolio write-up convincing?',
        options: [
          'Your own words, with the reasoning shown',
          'A long list of courses you started',
          'A write-up copied from someone else',
          'A list of the tools you installed',
        ],
        answer: 0,
        explanation:
          'The strongest thing you can show is a record of work you actually did, written up in your own words with the reasoning kept in, because the reasoning shows how you think. Anyone can paste a command; explaining why you chose it is the skill. A list of courses you started shows nothing, and a copied write-up is easy to spot.',
      },
    ],
    tasks: [
      {
        id: 'cert-t1',
        title: 'Write a portfolio entry for a lab you did',
        prompt:
          'A portfolio entry records work you actually did, with the reasoning shown. This writes one for a lab on your own Termux install and reads it back, then counts the words. The reasoning line is the part that shows how you think, so keep it in.',
        command:
          'mkdir -p ~/portfolio; printf "lab: my own Termux install\\ngoal: check which services are listening\\nmethod: ran netstat -tuln, then stopped sshd with pkill\\nresult: no listeners remained\\nreasoning: a listener is a door, so I keep as few as I can\\n" > ~/portfolio/lab-01.txt; cat ~/portfolio/lab-01.txt; echo "words: $(wc -w < ~/portfolio/lab-01.txt)"',
        hint: 'Five lines: the lab, the goal, the method, the result, and the reasoning, then a word count.',
        expects:
          'Five lines naming the lab, the goal, the method, the result and the reasoning, then a line with the word count. The method line names what you actually ran, and the reasoning line says why, which is the part a reader learns from. Your own entry would describe a different lab, but keeping the reasoning visible is what makes it worth reading.',
        rules: [
          { type: 'matches', pattern: '^\\s*(lab|goal|method):', label: 'the write-up names the work and how it was done' },
          { type: 'matches', pattern: '^\\s*reasoning:', label: 'it shows the reasoning, not just the result' },
          { type: 'matches', pattern: '^\\s*words:\\s*\\d+', label: 'the write-up is counted in words' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },
];
