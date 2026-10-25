/**
 * Practice sets for the utilities track: the permissions calculator and the
 * subnet calculator.
 *
 * Each set follows one lesson. The questions test the arithmetic and the
 * notation that lesson teaches, and each set ends with one output task whose
 * command the learner runs on their own device. The rules describe what a
 * correct answer means rather than its exact characters, because the owner,
 * the timestamp and the interface name differ from phone to phone.
 */

import type { PracticeSet } from './types';

export const utilitiesCSets: PracticeSet[] = [
  {
    slug: 'build-a-permissions-calculator',
    title: 'The permissions calculator',
    topic: 'build-a-permissions-calculator',
    summary: 'Reading a mode two ways, the special bits, and setting a mode with chmod.',
    intro:
      'A permission is a number and a string, and the whole skill is moving between the two. These questions check that you can read the fourth digit, tell a capital letter from a lowercase one, and write a mode with the symbolic form.',
    questions: [
      {
        id: 'permc-1',
        question: 'What does the leading 4 in the mode 4755 mean?',
        options: [
          'The file runs with the permissions of its owner, which is setuid',
          'The file is readable by everyone on the device',
          'The owner may execute the file four times',
          'The mode is invalid, because modes have three digits',
        ],
        answer: 0,
        explanation:
          'A mode may carry a fourth digit in front of the usual three, and that digit holds the special bits. A 4 there is setuid, which makes a program run as its owner rather than as the person who started it. The other answers are not what any of those bits do: readability is the read bit, execution is the execute bit, and a four-digit mode is perfectly valid.',
      },
      {
        id: 'permc-2',
        question: 'A file shows the mode -rwSr--r--. What does the capital S tell you?',
        options: [
          'setuid is set but the owner has no execute bit, so the bit has nothing to act on',
          'setuid is set and the owner can execute the file',
          'The file is a symbolic link',
          'The sticky bit is set on the file',
        ],
        answer: 0,
        explanation:
          'A lowercase s in the owner position means setuid is on and the execute bit is on as well. A capital S means setuid is on but execute is off, so the special bit has nothing to act on. The sticky bit is shown by a t or a T in the others position, and a symbolic link is marked by an l at the very start of the mode string.',
      },
      {
        id: 'permc-3',
        question: 'What does chmod u+rwx,go+rx script.sh do?',
        options: [
          'Gives the owner read, write and execute, and the group and others read and execute',
          'Gives everyone read, write and execute',
          'Adds execute for the owner only',
          'Removes write from the group and others',
        ],
        answer: 0,
        explanation:
          'The comma list applies two changes in turn. u+rwx sets read, write and execute for the owner, and go+rx sets read and execute for the group and for others. The result is mode 755. It gives write to nobody but the owner, which is exactly what the wrong answers would do instead.',
      },
      {
        id: 'permc-4',
        question: 'Why is chmod 777 almost always the wrong answer?',
        options: [
          'It lets every other app on the device write to the file, so anything can replace it',
          'It uses more storage than a tighter mode',
          'It stops you reading the file yourself',
          'It removes the file from its owner',
        ],
        answer: 0,
        explanation:
          'Mode 777 gives write to the others class, and on a phone others means every other app. Anything that can reach a world-writable file can replace its contents, and a replacement sitting on your PATH runs the next time you type that command. The other answers are not true of permissions at all: a mode does not change how much space a file takes, and it never removes an owner.',
      },
    ],
    tasks: [
      {
        id: 'permc-t1',
        title: 'Print one mode two ways',
        prompt:
          'This creates a file, gives it the setuid bit alongside 755, then shows the mode twice: once as the symbolic string from ls, and once as the octal number from stat. The two lines are the same mode written in the two notations the calculator moves between.',
        command:
          'touch ~/calc.sh; chmod 4755 ~/calc.sh; ls -l ~/calc.sh; stat -c "%a %n" ~/calc.sh',
        hint: 'You are looking for the same mode on both lines, with an s where you might have expected an x.',
        expects:
          'The ls line should begin with -rwsr-xr-x, which is setuid plus 755: the owner reads, writes and executes, and the group and others read and execute. The lowercase s is in the owner execute slot, and it means both that execute is set and that setuid is on. The stat line should read 4755, the same mode as one number. If your first line begins -rwxr-xr-x, the setuid digit did not take effect and you set 755 instead.',
        rules: [
          { type: 'matches', pattern: '^\\s*-rwsr-xr-x', label: 'the symbolic mode carries the setuid bit' },
          { type: 'matches', pattern: '^\\s*4755\\s', label: 'the octal mode is 4755' },
          { type: 'contains', value: 'calc.sh', label: 'the listing is for the file you created' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'build-a-subnet-calculator',
    title: 'The subnet calculator',
    topic: 'build-a-subnet-calculator',
    summary: 'Network, mask, broadcast and host count, and splitting a network into smaller ones.',
    intro:
      'A prefix length answers four questions at once: the network, the mask, the broadcast address and the host count. These questions check that you can work out each of them, and that you know what changes when the prefix gets very long.',
    questions: [
      {
        id: 'subc-1',
        question: 'How many usable host addresses does a /26 network hold?',
        options: ['62', '64', '30', '126'],
        answer: 0,
        explanation:
          'A /26 leaves 6 host bits, because 32 minus 26 is 6. The block is two to the power of 6, which is 64 addresses. The first address names the network and the last is the broadcast, so 62 remain for hosts. 64 is the block size rather than the host count, 30 belongs to a /27, and 126 belongs to a /25.',
      },
      {
        id: 'subc-2',
        question: 'What does net.subnets(new_prefix=26) return when net is a /24?',
        options: [
          'Four /26 blocks that together fill the /24',
          'A single /26 block',
          'Twenty-six smaller networks',
          'The same network with its address changed',
        ],
        answer: 0,
        explanation:
          'Moving from /24 to /26 adds two bits to the network part. Two extra bits give four combinations, so you get four /26 blocks of 64 addresses each, and they fill the original /24 exactly. The count comes from the difference in prefix length, not from the new prefix itself, and the original object is left unchanged.',
      },
      {
        id: 'subc-3',
        question: 'Why is a /31 network special?',
        options: [
          'It has two addresses and both may be used on a point-to-point link',
          'It contains no addresses at all',
          'It is only valid for IPv6',
          'It is a broadcast-only network',
        ],
        answer: 0,
        explanation:
          'A /31 has one host bit, so the block is two addresses. The usual rule would subtract the network and broadcast addresses and leave nothing, but RFC 3021 allows both addresses to be used on a point-to-point link, and Python returns both from hosts(). A /31 is valid for IPv4, and a /32 is the single-address case.',
      },
      {
        id: 'subc-4',
        question: 'The mask 255.255.255.192 corresponds to which prefix length?',
        options: ['/26', '/24', '/25', '/27'],
        answer: 0,
        explanation:
          'Each 255 sets eight bits, so the first three octets give 24 bits. The last octet, 192, is 128 plus 64, which is two more bits set. That makes 26 bits in all, so the prefix is /26. A /24 mask ends in 0, a /25 ends in 128, and a /27 ends in 224.',
      },
    ],
    tasks: [
      {
        id: 'subc-t1',
        title: 'Calculate a subnet in Python',
        prompt:
          'This asks Python for the mask, the broadcast address and the usable host count of 10.0.0.0/24, then splits the network into four /26 blocks. It is the calculator in one line, and it needs no network access.',
        command:
          'python3 -c "import ipaddress; n=ipaddress.ip_network(\'10.0.0.0/24\', strict=False); print(n.netmask); print(n.broadcast_address); print(n.num_addresses-2); [print(s) for s in n.subnets(new_prefix=26)]"',
        hint: 'Seven lines should come back: three single values, then four subnet blocks.',
        expects:
          'The first line is the mask, 255.255.255.0, which is the dotted form of /24. The second is the broadcast, 10.0.0.255, the last address in the block. The third is the usable host count, 254, which is 256 addresses less the network and the broadcast. The last four lines are the /26 blocks: 10.0.0.0/26, 10.0.0.64/26, 10.0.0.128/26 and 10.0.0.192/26, each holding 64 addresses. If you see a Traceback instead, the quotes inside the command were altered when you pasted it.',
        rules: [
          { type: 'matches', pattern: '^\\s*255\\.255\\.255\\.0\\s*$', label: 'the netmask is the dotted form of /24' },
          { type: 'matches', pattern: '^\\s*254\\s*$', label: 'the usable host count is 254' },
          { type: 'contains', value: '10.0.0.192/26', label: 'the last of the four /26 subnets is printed' },
          {
            type: 'absent',
            pattern: 'Traceback|command not found|No such file or directory',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },
];
