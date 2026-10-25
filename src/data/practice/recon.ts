/**
 * Practice sets for the recon track: the phases of an assessment, taking
 * inventory, reading a port scan, reading service versions, and judging a
 * vulnerability.
 *
 * Every task runs on the learner's own device. The scan tasks point at
 * localhost, so the only host they can affect is the phone in the learner's
 * hand. The rules describe the meaning of the output rather than its exact
 * characters, because a hostname, an address and a kernel release differ from
 * device to device.
 */

import type { PracticeSet } from './types';

export const reconSets: PracticeSet[] = [
  {
    slug: 'security-assessment-phases',
    title: 'The phases of a security assessment',
    topic: 'security-assessment-phases',
    summary: 'Scope, baseline, enumeration and judgement, and the order they come in.',
    intro:
      'An assessment is a short sequence of steps, and each one depends on the one before it. This set checks that you know what each phase is for and that you can run the first one on your own device.',
    questions: [
      {
        id: 'phase-1',
        question: 'Why does an assessment begin with scope rather than with a scan?',
        options: [
          'Because you need to know what you own and are allowed to touch before you touch anything',
          'Because a scan is the slowest step and should be left until last',
          'Because scope is the only phase that needs root',
          'Because scanning first would change the device before you record it',
        ],
        answer: 0,
        explanation:
          'Scope decides what you are allowed to assess, and everything after it inherits that answer. Without it you cannot tell whether a scan was legitimate, and you may end up probing a system that is not yours, which can breach a terms of service and in many countries is an offence. A scan is not left until last for speed, and scope needs no root at all.',
      },
      {
        id: 'phase-2',
        question: 'What does the id command tell you that matters for an assessment?',
        options: [
          'Your user id and groups, which show whether you are an ordinary app user rather than root',
          'The id of the last command you ran',
          'The list of services listening on the device',
          'The version of the operating system',
        ],
        answer: 0,
        explanation:
          'id prints your user id, your primary group and any extra groups. On Termux this is a normal app id such as u0_a231, not root, and that single fact decides most of what you can and cannot do later. It does not list services and it does not report the operating system version, which come from ss and uname respectively.',
      },
      {
        id: 'phase-3',
        question: 'Why record a timestamp and the kernel release before you change anything?',
        options: [
          'So the assessment has a starting point you can compare later changes against',
          'So the scan runs faster on the second attempt',
          'Because the kernel release is what you scan',
          'Because the timestamp is required by nmap before it will run',
        ],
        answer: 0,
        explanation:
          'A baseline is what turns later observations into a comparison. With the time and the kernel recorded, you can look back after an update and see what actually differed. It does not speed up a scan, it is not the scan target, and nmap has no such requirement; the value is entirely in having something to compare against.',
      },
      {
        id: 'phase-4',
        question: 'In the enumeration phase, an empty ss -tln listing is:',
        options: [
          'A good result, because it means nothing is listening on the device',
          'A sign that the command failed to run',
          'A sign that root is needed to list ports',
          'An error that means the network is down',
        ],
        answer: 0,
        explanation:
          'ss lists what is listening, so an empty list means there is nothing to reach, which is the state you want by default. It is not a failure and it does not need root: listing your own device sockets works as an ordinary app. A network that is down is a different matter and would not stop ss from reporting local listeners.',
      },
    ],
    tasks: [
      {
        id: 'phase-t1',
        title: 'Record the scope of your assessment',
        prompt:
          'This prints the name of your device, your user id and groups, and the kernel name, release and machine type. It is the scope line of an assessment: what you are looking at, and as whom. Paste the three lines it prints.',
        command: 'hostname; id; uname -srm',
        hint: 'The id line is the one to read first. If it does not say root, you are an ordinary app user, which is what this track assumes.',
        expects:
          'Three lines. The first is your device name, which on a phone is often localhost. The second begins uid= and gives your user id and groups, and the id is a normal app id rather than 0, so you are not root. The third begins with Linux and ends with the machine type, aarch64 on most phones. Together these are the first phase of an assessment: the scope, recorded as a fact rather than assumed. Your own values will differ from anyone else\'s, and that is expected.',
        rules: [
          { type: 'matches', pattern: '^\\s*uid=\\d+', label: 'your user id is printed, and it is a number' },
          { type: 'matches', pattern: '^\\s*Linux\\s', label: 'the kernel name and release are printed' },
          { type: 'lines', min: 3, label: 'the device name, the id and the kernel are all there' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'inventory-your-devices',
    title: 'Taking inventory of your own devices',
    topic: 'inventory-your-devices',
    summary: 'Reading your own addresses, and telling the loopback from the one the network sees.',
    intro:
      'An inventory is a list of what you own, and the first entries are the addresses your own device holds. This set checks that you can read them and tell which one the rest of the network can reach.',
    questions: [
      {
        id: 'inv-1',
        question: 'What does the -o flag do in ip -o addr show?',
        options: [
          'It prints each address on a single line instead of spreading it over several',
          'It shows only addresses that are online',
          'It sorts the interfaces by name',
          'It hides the loopback interface',
        ],
        answer: 0,
        explanation:
          'Without -o, ip spreads each interface over several indented lines, which is fine to read by eye but awkward to pipe. The -o flag puts each address on one line, so a later grep or awk can work on it. It does not filter by state, does not sort, and does not hide the loopback, which is still listed because it is a real interface.',
      },
      {
        id: 'inv-2',
        question: 'Which of these is a private address?',
        options: [
          '192.168.1.42',
          '8.8.8.8',
          '93.184.216.34',
          '1.1.1.1',
        ],
        answer: 0,
        explanation:
          'Private addresses come from ranges set aside for local networks: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. The address 192.168.1.42 falls in the last of those, so it is only reachable inside your own network. The others are public addresses on the internet, which is exactly why you do not see them on your own interface.',
      },
      {
        id: 'inv-3',
        question: 'What does command -v nmap curl openssl print when one of those tools is not installed?',
        options: [
          'It prints nothing for that name and continues with the others',
          'It stops at the missing name with an error',
          'It prints the word missing in place of a path',
          'It installs the missing tool automatically',
        ],
        answer: 0,
        explanation:
          'command -v prints the path of each name that exists and simply produces no line for one that does not, so the output is shorter than the list you typed. It does not stop and it does not substitute a placeholder, which is why the output itself is the answer to which tools you have. It never installs anything; that is pkg install.',
      },
      {
        id: 'inv-4',
        question: 'In df -h ~, which column tells you whether the next write is likely to fail?',
        options: [
          'The Use% column, because a figure near 100 per cent means there is almost no room left',
          'The Filesystem column, because it names the device',
          'The Mounted on column, because it names the directory',
          'The Size column, because it gives the total capacity',
        ],
        answer: 0,
        explanation:
          'Use% is the share of the filesystem already taken, so a figure near 100 per cent is the warning that a package update or a log write may fail. Size is the total capacity and does not change, and the filesystem and mount columns identify the device and the directory rather than reporting how full it is.',
      },
    ],
    tasks: [
      {
        id: 'inv-t1',
        title: 'List your own addresses',
        prompt:
          'This lists every interface on your device with its address, one address per line. Paste the lines it prints.',
        command: 'ip -o addr show',
        hint: 'Look for the line whose interface is not lo. That is the address the rest of your network can reach.',
        expects:
          'One line per address. The lines for the interface lo hold the loopback addresses, 127.0.0.1 and ::1, which only reach the device itself. The lines for your wireless interface, usually wlan0, hold your address on the local network, which is a private address such as 192.168.1.42 with a prefix length after it. The inet lines are IPv4 and the inet6 lines are IPv6. Which interfaces and addresses you see depends on your device, but the loopback is always present and is always the safe one to work against.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*\\d+:\\s+\\S+\\s+inet\\s',
            label: 'an interface with an IPv4 address is listed',
          },
          { type: 'contains', value: '127.0.0.1', label: 'the loopback address is present' },
          { type: 'lines', min: 2, label: 'at least two address lines are printed' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'reading-a-port-scan',
    title: 'Reading a port scan properly',
    topic: 'reading-a-port-scan',
    summary: 'Reading the columns and states of an nmap scan against your own device.',
    intro:
      'A scan answers one narrow question: which ports will accept a connection. This set checks that you can read the answer, tell the states apart, and keep the target on your own device.',
    questions: [
      {
        id: 'scan-1',
        question: 'In an nmap table, which column answers whether a port will accept a connection?',
        options: [
          'The STATE column, which reads open, closed or filtered',
          'The PORT column, which gives the number and protocol',
          'The SERVICE column, which names the usual service',
          'The VERSION column, which gives the software version',
        ],
        answer: 0,
        explanation:
          'STATE is the answer to the question the scan asked: whether the port will accept a connection. PORT only names the number and the protocol, SERVICE is a label taken from a list of well-known ports, and VERSION appears only with service detection. The SERVICE column in particular can mislead, because it names what usually runs on a port even when nothing is listening there.',
      },
      {
        id: 'scan-2',
        question: 'What does it mean when a port shows as closed?',
        options: [
          'The device answered and said nothing is listening on that port',
          'A firewall is dropping the packets',
          'A service is listening but refusing connections',
          'The scan failed to reach the port',
        ],
        answer: 0,
        explanation:
          'A closed port means the host replied to say there is no service there, which is the ordinary healthy state of a phone running no extra services. A firewall dropping packets produces the filtered state, not closed, and a scan that could not reach the port at all would not report a state for it. Closed is an answer, not an error.',
      },
      {
        id: 'scan-3',
        question: 'Why is it acceptable to run nmap against localhost but not against a host you do not own?',
        options: [
          'Because localhost is your own device, so the only host a scan can affect is the one in your hand',
          'Because localhost scans are always faster',
          'Because scanning any host on your local network is allowed',
          'Because nmap refuses to scan other hosts without root',
        ],
        answer: 0,
        explanation:
          'Permission comes from ownership or written authorisation, and localhost is your own device by definition, so a scan there can only affect you. Being on the same network as a host is not permission to scan it, and speed has nothing to do with legitimacy. nmap will happily scan other hosts without root, which is exactly why the rule has to come from you.',
      },
      {
        id: 'scan-4',
        question: 'In a scan of many ports, what does the line Not shown: 99 closed tcp ports mean?',
        options: [
          'nmap summarised the closed ports and printed in full only the ones that are not closed',
          'The scan stopped after ninety-nine ports',
          'Ninety-nine ports could not be reached',
          'The device has ninety-nine services running',
        ],
        answer: 0,
        explanation:
          'When most ports share the same state, nmap collapses them into one summary line and prints full rows only for the interesting ones, which usually means the open ports. It is not a count of services, not a failure, and not a limit on the scan; it is the same information in a shorter form, so that the open ports stand out.',
      },
    ],
    tasks: [
      {
        id: 'scan-t1',
        title: 'Scan a few ports on your own device',
        prompt:
          'This scans four named ports on localhost, which is your own device and nothing else. The -n flag keeps it local by skipping name lookups. Paste the whole scan output.',
        command: 'nmap -n -p 22,80,443,8022 localhost',
        hint: 'If you have started the Termux SSH server with sshd, the 8022 row will read open. Otherwise every row reads closed, which is the ordinary state of a phone.',
        expects:
          'nmap\'s usual shape: a banner line naming the version, a scan report naming localhost and its loopback address, a blank line, then a table with the columns PORT, STATE and SERVICE and one row for each port you named. A row reads the port and protocol, then the state, then the usual service name. Every row reads closed unless you have started a service, in which case its row reads open. Then a closing line counting the host and the time. The STATE column is the answer you were looking for; the SERVICE column is only a label for the port number.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*PORT\\s+STATE\\s+SERVICE',
            label: 'the table has the columns PORT, STATE and SERVICE',
          },
          {
            type: 'matches',
            pattern: '^\\s*\\d+/(tcp|udp)\\s+(open|closed|filtered)',
            label: 'at least one port row reports its state',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'service-versions',
    title: 'Service versions and what they tell you',
    topic: 'service-versions',
    summary: 'Asking a service what it is, and reading the version it answers with.',
    intro:
      'A port says something is there. A version says what it is and how old. This set checks that you can ask a service to identify itself and read the answer, and that you know what the version does and does not tell you.',
    questions: [
      {
        id: 'ver-1',
        question: 'What does the -sV flag add to an nmap scan?',
        options: [
          'It asks nmap to identify the service and its version, adding a VERSION column',
          'It makes the scan run in the background',
          'It scans every port rather than a named list',
          'It hides the closed ports from the output',
        ],
        answer: 0,
        explanation:
          'Without -sV, nmap names the port and labels the service from a list of well-known ports. The -sV flag goes further: it connects and reads the greeting the service sends, then works out the service and its version, which is what adds the VERSION column. It does not change which ports are scanned and it is not what suppresses closed rows.',
      },
      {
        id: 'ver-2',
        question: 'In curl -sI http://127.0.0.1:8010/, what do the flags do?',
        options: [
          '-s silences the progress meter and -I asks for the response headers only',
          '-s asks for a secure connection and -I ignores errors',
          '-s saves the output to a file and -I includes the body',
          '-s sends the request as a POST and -I prints the status only',
        ],
        answer: 0,
        explanation:
          'The -s flag suppresses the progress meter so the output is clean, and -I changes the request to a HEAD, which returns the headers without the body. That is the short form you want when you are reading a banner, because a web server puts its version in the Server header. It is not a security flag, does not write a file, and does not change the request method to POST.',
      },
      {
        id: 'ver-3',
        question: 'Why can the same version string matter a great deal in one place and very little in another?',
        options: [
          'Because a version on the loopback is reachable only from the device, while the same version on the network is reachable from anywhere on it',
          'Because some devices hash the version string and others do not',
          'Because a version is only a version on a device that has root',
          'Because the version string changes each time the service restarts',
        ],
        answer: 0,
        explanation:
          'The version is the same in both cases; what changes is who can reach the service carrying it. Bound to 127.0.0.1 it can be reached only from the device itself, so the ways an issue could be used are few. Bound to 0.0.0.0 it is reachable from your whole network. That is why you read the version and the bound address together rather than the version alone.',
      },
      {
        id: 'ver-4',
        question: 'What should you do when nmap -sV cannot work out a version?',
        options: [
          'Read the banner by hand, for example with curl -I, because the service may still announce itself',
          'Conclude that the port is closed',
          'Assume the service is up to date',
          'Run the scan again until a version appears',
        ],
        answer: 0,
        explanation:
          'Service detection is a best effort, and some services say nothing that nmap can match, so the VERSION column may be blank or hold a question mark. The service may still announce itself in the first lines it sends, which curl -I can show. A blank version does not mean the port is closed, does not mean the service is current, and repeating the scan will not make the service talk.',
      },
    ],
    tasks: [
      {
        id: 'ver-t1',
        title: 'Ask nmap for the service version',
        prompt:
          'This scans port 8022 on localhost with service detection. Start the Termux SSH server first with sshd so there is something to identify. Paste the whole scan output.',
        command: 'nmap -sV -n -p 8022 localhost',
        hint: 'Look for the VERSION column and the line saying service detection was performed. The version shown is whatever OpenSSH that Termux ships.',
        expects:
          'nmap\'s usual shape, but with a VERSION column in the table. The row reads the port and protocol, the state, the service and then a version string, such as OpenSSH followed by a number, when the port is open. Below the table comes the line saying service detection was performed, and then the closing summary. The VERSION column is the point of the command: it is the thing a known issue attaches to. If the port is closed, the table still appears with its VERSION heading, but there is no version to read because nothing answered.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*PORT\\s+STATE\\s+SERVICE\\s+VERSION',
            label: 'the table asks for a version as well as a service',
          },
          {
            type: 'contains',
            value: 'Service detection performed',
            label: 'service detection actually ran',
          },
          {
            type: 'matches',
            pattern: '^\\s*\\d+/tcp\\s+(open|closed|filtered)',
            label: 'the port row reports its state',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'finding-a-vulnerability',
    title: 'Finding and judging a vulnerability',
    topic: 'finding-a-vulnerability',
    summary: 'Reading a version in full, comparing versions correctly, and turning both into a decision.',
    intro:
      'A version is a fact and a vulnerability is a judgement about it. This set checks that you can read a version, compare two of them the way their numbers order, and say what would make a finding worth acting on.',
    questions: [
      {
        id: 'vuln-1',
        question: 'Why does sort -V order 3.0.7 before 3.0.13 when a plain sort does not?',
        options: [
          'Because -V compares each run of digits as a number, while a plain sort compares the whole string as text',
          'Because -V sorts in reverse order',
          'Because -V removes the dots before comparing',
          'Because a plain sort ignores lines that start with a digit',
        ],
        answer: 0,
        explanation:
          'As text, the character 1 comes before 7, so a plain sort puts 3.0.13 ahead of 3.0.7 and leaves the oldest release last. The -V flag reads each run of digits as a number, so 13 is correctly greater than 7. It does not reverse the order, does not strip the dots, and does not skip lines that begin with a digit; a plain sort reads all of them, just as text.',
      },
      {
        id: 'vuln-2',
        question: 'Which question turns a version number into a judgement?',
        options: [
          'Who can reach this service, is it behind the version that carries a fix, and what would the impact be',
          'What port number is the service on',
          'What is the name of the device it runs on',
          'How long has the service been running without a restart',
        ],
        answer: 0,
        explanation:
          'Reachability, currency and impact are the three that change a fact into a decision. The port number tells you where the service is but not who can reach it, the device name is an identifier rather than a risk, and uptime says nothing about whether the software carries a known issue. A version on its own is not a finding until you have asked those three questions.',
      },
      {
        id: 'vuln-3',
        question: 'A service that is out of date is bound to 127.0.0.1. How does that change the judgement?',
        options: [
          'It lowers the priority, because the service can be reached only from the device itself',
          'It raises the priority, because loopback traffic is unencrypted',
          'It makes no difference at all to the judgement',
          'It means the service must be removed immediately',
        ],
        answer: 0,
        explanation:
          'A service bound to the loopback address accepts connections only from the device itself, so the ways an issue could be reached are far fewer than for one bound to the network. That lowers the priority rather than raising it; it does not remove the finding, and it does not make the traffic unencrypted or require immediate removal. The version did not change, only the exposure did.',
      },
      {
        id: 'vuln-4',
        question: 'When a fix needs root and you are an ordinary app user, what is the honest move?',
        options: [
          'Say so plainly and take the non-root option, such as updating the package or binding the service to loopback',
          'Run the command anyway and hope it works',
          'Assume the finding does not matter because root is unavailable',
          'Install a different operating system on the phone',
        ],
        answer: 0,
        explanation:
          'Some fixes, such as binding a port below 1024, need root, and on an ordinary phone that is simply not available. The honest move is to say so and take the option that does not need it: updating a package with pkg upgrade, or binding the service to loopback so it cannot be reached from the network. Pretending a command will work, or dismissing the finding entirely, both leave the record wrong.',
      },
    ],
    tasks: [
      {
        id: 'vuln-t1',
        title: 'Read the version of a component you run',
        prompt:
          'This prints the version and build details of OpenSSL, a component on every device. Paste the output, and read the first line for the version number.',
        command: 'openssl version -a',
        hint: 'The version is the three numbers after the word OpenSSL. The line after it is when this copy was built, which is often later than the release date.',
        expects:
          'A first line beginning OpenSSL and then a version such as 3.0.19, followed by the date the release was cut. Below it come a built on line with the compile date, a platform line naming the target, and further lines about the build options and the directory the library lives in. The version is the three numbers, major, minor and patch, and it is the patch number that moves most often. Your version will differ from anyone else\'s, and the point is to read the one on your own device.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*OpenSSL\\s+\\d+\\.\\d+\\.\\d+',
            label: 'the version number is printed',
          },
          {
            type: 'matches',
            pattern: '^\\s*built on:',
            label: 'the build date is printed',
          },
          { type: 'contains', value: 'platform:', label: 'the platform line is present' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },
];
