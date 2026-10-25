/**
 * Practice sets for the system track: processes and networking.
 *
 * The networking set carries the flagship output task, where the learner
 * starts a real server on their own device and scans it. The rules there are
 * written to accept any nmap output that means the right thing, whatever the
 * version string, spacing or ordering happens to be.
 */

import type { PracticeSet } from './types';

export const systemSets: PracticeSet[] = [
  {
    slug: 'processes-and-jobs',
    title: 'Processes and jobs',
    topic: 'processes-and-jobs',
    summary: 'What is running, how to stop it, and why command lines are public.',
    intro:
      'Everything running on your device is a process with an id. Being able to list them and stop the right one is the difference between a stuck terminal and a working one.',
    questions: [
      {
        id: 'proc-1',
        question: 'What is a process?',
        options: [
          'A running instance of a program, with its own id',
          'A file that is currently open',
          'A command you have typed but not yet run',
          'A user account that is logged in',
        ],
        answer: 0,
        explanation:
          'The program on disk is inert. A process is that program loaded into memory and given an id, an owner and a share of the processor. The same program can be several processes at once, each with its own id, which is why killing one does not necessarily stop the others.',
      },
      {
        id: 'proc-2',
        question: 'In the output of ps, what is the PID column for?',
        options: [
          'It is the process id, and it is the number you give to kill',
          'It is the port the process is listening on',
          'It is the priority of the process',
          'It is the amount of memory the process is using',
        ],
        answer: 0,
        explanation:
          'The process id is how you name a process to the system, because names are not unique and change as processes come and go. kill takes one of these numbers. Ports are a different thing entirely, and they come from a network listing rather than a process listing.',
      },
      {
        id: 'proc-3',
        question: 'Why is it a bad idea to put a password on a command line?',
        options: [
          'Anyone who can run ps can read the whole command line, including the password',
          'The shell stores it in your history file forever',
          'It slows the command down',
          'The password would be hashed and become unusable',
        ],
        answer: 0,
        explanation:
          'The command line of a running process is readable by anyone who can list processes on the machine, and it stays visible for as long as the command runs. History is a real concern too, but it is the smaller one and it can be edited. Pass the secret through a prompt, an environment variable that you unset afterwards, or a file that only you can read.',
      },
      {
        id: 'proc-4',
        question: 'What does a trailing & do to a command?',
        options: [
          'Runs it in the background and gives you the prompt back',
          'Runs it twice',
          'Waits for it to finish before continuing',
          'Sends its output to a file',
        ],
        answer: 0,
        explanation:
          'The ampersand puts the job in the background, so you can carry on typing while it runs. You get a job number in square brackets and the process id. That is how you start something long-running without giving up your terminal, and jobs later tells you what is still going.',
      },
    ],
    tasks: [
      {
        id: 'proc-t1',
        title: 'List what is running',
        prompt:
          'This lists the processes your account can see, with the command that started each one.',
        command: 'ps',
        hint: 'The first line is a header naming the columns, not a process.',
        expects:
          'A header line naming the columns, then one row per process. The columns you will see are a process id, the terminal it is attached to, the processor time it has used, and the command. The command column is the one to look at, because it shows exactly what was typed to start each process, arguments and all. That visibility is the reason a password should never be passed on a command line.',
        rules: [
          { type: 'matches', pattern: '\\bPID\\b', label: 'the output has a header naming the columns' },
          { type: 'matches', pattern: '^\\s*\\d+\\s', label: 'at least one process row, starting with its id' },
          { type: 'lines', min: 2, label: 'a header and at least one process' },
        ],
      },
    ],
  },

  {
    slug: 'networking-basics',
    title: 'Networking basics',
    topic: 'networking-basics',
    summary: 'Addresses, reachability, and reading a port scan.',
    intro:
      'This set ends with the most useful task on the site: you start a real server on your own device and scan it, then read the result. Nothing here touches anyone else\'s network.',
    questions: [
      {
        id: 'net-1',
        question: 'What is 127.0.0.1?',
        options: [
          'The loopback address, which always means the device you are on',
          'The address of your router',
          'A public address reserved for testing',
          'The address of the nearest DNS server',
        ],
        answer: 0,
        explanation:
          'The whole 127.0.0.0/8 range is loopback: traffic sent there never leaves the machine, it is handed straight back. That makes it the safe thing to scan while you are learning, because the only host you can possibly affect is your own. Your router is usually 192.168.1.1 or 192.168.0.1 on a home network.',
      },
      {
        id: 'net-2',
        question: 'A port shows as open. What does that mean?',
        options: [
          'A service is listening on it and will accept a connection',
          'The port is blocked by a firewall',
          'Nothing is using the port',
          'The port has been reserved for future use',
        ],
        answer: 0,
        explanation:
          'An open port means something is bound to it and answering. That is not automatically a problem, since your device needs services listening to be useful. It becomes worth attention when a service is listening that you did not intend to run, or one that has not been updated in a long time.',
      },
      {
        id: 'net-3',
        question: 'When is it acceptable to run nmap against a host?',
        options: [
          'When you own it, or have written permission to test it',
          'Whenever it is on your local network',
          'Whenever the scan is not likely to be noticed',
          'Whenever the host is not a government system',
        ],
        answer: 0,
        explanation:
          'Ownership or written authorisation, and nothing else. Being on the same network is not permission, and neither is the scan being quiet. Scanning systems you do not control can breach the terms of service you agreed to and, in many countries, is a criminal offence. Your own devices are always fair game, which is why every task here scans localhost.',
      },
      {
        id: 'net-4',
        question: 'Termux\'s SSH server listens on port 8022 rather than the usual 22. Why?',
        options: [
          'Ports below 1024 are privileged, and an ordinary app cannot bind them',
          'Port 22 is reserved for Windows machines',
          '8022 is faster because it is a less busy port',
          'Termux picks a random port each time it starts',
        ],
        answer: 0,
        explanation:
          'On Unix-like systems, binding a port below 1024 needs root, and Termux runs as an ordinary Android app with no root at all. So openssh is configured to use 8022, which is above the privileged range. That is also why you connect with ssh -p 8022 rather than the default, and why 8022 is the port to expect in a scan of your own device.',
      },
    ],
    tasks: [
      {
        id: 'net-t1',
        title: 'Start a server and scan it',
        prompt:
          'This starts the SSH server that Termux ships, then scans your own device on the port that server listens on. Paste the scan output, not the whole terminal session.',
        command: 'sshd; nmap -sV -p 8022 localhost',
        hint: 'If you are not sure which port it is listening on, netstat -tln lists what is listening on your device right now.',
        expects:
          'You should see nmap\'s usual shape: a banner line naming the version, a scan report naming the host, a blank line, then a table with the columns PORT, STATE and SERVICE, and one row for the port you scanned. The row should read 8022/tcp, then open, then the service it identified. Then a note that service detection was performed, and a summary line at the end. The parts worth reading are the STATE column, which is the answer to your question, and the SERVICE and VERSION columns, which tell you what is actually answering and how old it is. Every open port on a device you own is something to keep patched.',
        rules: [
          { type: 'matches', pattern: 'Nmap', label: 'the output is from nmap' },
          {
            type: 'matches',
            pattern: 'PORT\\s+STATE\\s+SERVICE',
            label: 'it has a port table with PORT, STATE and SERVICE columns',
          },
          {
            type: 'matches',
            pattern: '^\\s*\\d+/(tcp|udp)\\s+open\\b',
            label: 'a port is reported as open',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },
];
