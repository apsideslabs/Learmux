/**
 * Practice sets for the two conceptual lessons that open the security track:
 * the security mindset, and thinking in threats.
 *
 * These lessons are mostly prose, so the output tasks ask for something the
 * learner writes rather than something a tool prints. Each task still runs a
 * command on the device: it writes a small file, reads it back, and counts it,
 * so the learner sees their own work on screen. The rules then check the shape
 * of what they pasted rather than the exact characters, because no two phones
 * produce the same inventory.
 */

import type { PracticeSet } from './types';

export const mindsetSets: PracticeSet[] = [
  {
    slug: 'security-mindset',
    title: 'The security mindset',
    topic: 'security-mindset',
    summary: 'What security protects, four words that are not the same, and why blast radius beats zero risk.',
    intro:
      'Security is three properties, four words that people confuse, and a habit of asking who already has access. This set checks that you can tell confidentiality, integrity and availability apart, and that you treat a threat, a vulnerability, a risk and an exploit as four different things.',
    questions: [
      {
        id: 'mind-1',
        question: 'A private note is read by another app because the file was world readable. Which property failed?',
        options: [
          'Confidentiality, because something reached a place it should not',
          'Availability, because the note could not be opened',
          'Integrity, because the note was changed',
          'None of them, because nothing was destroyed',
        ],
        answer: 0,
        explanation:
          'Confidentiality is about who can see a thing. Nothing was destroyed and nothing stopped working, but the secret is out, and that is a confidentiality failure. Availability is having something work when you need it, and integrity is keeping something as it should be. The three are separate, and knowing which one broke usually tells you what to do about it.',
      },
      {
        id: 'mind-2',
        question: 'Which word means a weakness that a threat could use?',
        options: [
          'A vulnerability',
          'A threat',
          'A risk',
          'An exploit',
        ],
        answer: 0,
        explanation:
          'A vulnerability is the gap itself: a file with loose permissions, or a service left running. A threat is anything that could cause harm, a risk is a vulnerability meeting a threat weighed by how likely it is and how much it would cost, and an exploit is the method that turns a weakness into harm. The four words are different, and people use them as if they were one.',
      },
      {
        id: 'mind-3',
        question: 'Why is "perfectly secure" not a state you can reach?',
        options: [
          'Every device is exposed in some way, so the aim is to reduce blast radius',
          'Because antivirus software is never current',
          'Because phones cannot run a firewall',
          'Because security only applies to servers',
        ],
        answer: 0,
        explanation:
          'A device is connected, it runs software written by people, and a person could reach it, so the honest answer to "is this secure" is always "partly". The aim is to reduce blast radius, the damage one failure causes, by limiting what a single broken thing can reach. The other options name things that are not the reason a system is never perfectly secure.',
      },
      {
        id: 'mind-4',
        question: 'The lesson says detection without a response achieves nothing. Why?',
        options: [
          'A record nobody acts on is just text, so detection only matters when it leads to an action',
          'Because logs take up too much space on a phone',
          'Because reading logs is illegal without consent',
          'Because logs are always encrypted and cannot be read',
        ],
        answer: 0,
        explanation:
          'Detection is how you find out that something happened instead of guessing, but a log entry nobody reads and nobody acts on is just text. The value comes when detection leads to a response: stop the service, change the password, remove the file, block the source. Prevention, detection and response go together, and a chain with a missing link is not a chain.',
      },
    ],
    tasks: [
      {
        id: 'mind-t1',
        title: 'Write a first asset register',
        prompt:
          'Security starts with knowing what you hold. This writes a small register of three things on your phone, marks which property of security matters most for each, and then counts the rows. Read which asset is marked for confidentiality and which for integrity.',
        command:
          'mkdir -p ~/assets; printf "photos          confidentiality  high\\nnotes.txt       integrity        medium\\nbash_history    confidentiality  high\\n" > ~/assets/register.txt; cat ~/assets/register.txt; echo "---"; echo "assets: $(wc -l < ~/assets/register.txt)"',
        hint: 'The columns are the asset, the property that matters most for it, and how much it would cost you if it were exposed.',
        expects:
          'Three asset rows, then a divider, then a count. One row is marked confidentiality because it should not be read by others, and one is marked integrity because what matters is that it stays as you left it. The count line reports how many assets you wrote. Your register will differ from anyone else\'s, and that is the point: the habit is listing what you hold before deciding what to protect.',
        rules: [
          { type: 'matches', pattern: '^\\s*\\S+\\s+confidentiality\\s+high', label: 'an asset is recorded with confidentiality as its main concern' },
          { type: 'matches', pattern: '^\\s*\\S+\\s+integrity\\s+medium', label: 'a second asset is recorded for integrity' },
          { type: 'matches', pattern: '^\\s*assets:\\s*\\d+', label: 'the register is counted' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'threat-modelling',
    title: 'Thinking in threats: modelling a system',
    topic: 'threat-modelling',
    summary: 'Four questions, a picture drawn in text, STRIDE, and a decision beside every item.',
    intro:
      'A threat model is four questions you can ask about anything, a simple picture of the system, and a checklist of what can go wrong. This set checks that you know the four questions, the shapes in a data flow diagram, and what STRIDE stands for, and that you finish with a decision rather than a worry.',
    questions: [
      {
        id: 'threat-1',
        question: 'Which of these is the second threat modelling question?',
        options: [
          'What can go wrong',
          'Who is the attacker',
          'How much will this cost',
          'Which tool should I install',
        ],
        answer: 0,
        explanation:
          'The four questions are what am I working on, what can go wrong, what am I going to do about it, and did I do a good job. Naming the attacker is not one of them, because a threat model looks at the system rather than at a particular person, and it works the same whether the trouble comes from an attacker, an insider or an accident.',
      },
      {
        id: 'threat-2',
        question: 'In a text data flow diagram, what does a store represent?',
        options: [
          'Where data sits',
          'Something that acts on data',
          'Data moving between two things',
          'A line across which trust is not automatic',
        ],
        answer: 0,
        explanation:
          'A box is a process, something that acts on data; a store is where data sits; an arrow is data moving; and a dashed border is a trust boundary, a line across which trust is not automatic. Keeping the four shapes straight is what makes the picture useful, because it tells you where to look before you have written a single risk down.',
      },
      {
        id: 'threat-3',
        question: 'What does the R in STRIDE stand for?',
        options: [
          'Repudiation',
          'Risk',
          'Recovery',
          'Ransomware',
        ],
        answer: 0,
        explanation:
          'STRIDE is Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege. Repudiation is denying that something happened with no record to settle it, which is why running a service without logging matters. Risk and recovery are useful words but they are not the letters, and ransomware is one kind of harm rather than a category in this checklist.',
      },
      {
        id: 'threat-4',
        question: 'What is the output of a threat model?',
        options: [
          'A short written list with a decision next to each item',
          'A long document that is filed away and never read',
          'A list of software to buy',
          'A diagram with no notes',
        ],
        answer: 0,
        explanation:
          'The output is a short written list, with a decision next to each item, so the next time you open it you know what you chose and why. The decision is to fix it, accept it, or watch it, and accepting a risk is a real answer as long as you wrote down why. A thorough document nobody reads is worth less than a short list you act on.',
      },
    ],
    tasks: [
      {
        id: 'threat-t1',
        title: 'Write a threat model you can act on',
        prompt:
          'A threat model is four questions with a decision beside each answer. This writes a short model for a Termux install with sshd and a folder of notes, then reads it back and counts the lines. Notice that every item ends in a decision.',
        command:
          'mkdir -p ~/threatmodel; printf "asset: sshd on port 8022\\nthreat: an exposed listener anyone on the network can reach\\nrisk: medium, and only while the listener runs\\ndecision: keep sshd stopped unless I am using it\\n" > ~/threatmodel/sshd.txt; cat ~/threatmodel/sshd.txt; echo "---"; wc -l < ~/threatmodel/sshd.txt',
        hint: 'Each line is one field of the model: the asset, the threat, the risk, and the decision.',
        expects:
          'Four lines naming the asset, the threat, the risk and the decision, then a divider, then a line count. The important part is the decision line: a model with no decisions is only a worry list. Your own model would name different assets, but each one should still end in a decision to fix it, accept it, or watch it.',
        rules: [
          { type: 'matches', pattern: '^\\s*asset:', label: 'the model names an asset' },
          { type: 'matches', pattern: '^\\s*threat:', label: 'it names what could go wrong' },
          { type: 'matches', pattern: '^\\s*decision:', label: 'every item carries a decision' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },
];
