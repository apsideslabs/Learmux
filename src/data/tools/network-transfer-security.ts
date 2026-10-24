import type { Tool } from './types';

export const networkTransferSecurityTools: Tool[] = [
  {
    slug: 'nmap',
    name: 'Nmap',
    category: 'network',
    tagline: 'Scan the hosts you own and see what answers',
    about: 'Nmap scans a network for live hosts and the services they expose. Use it only on machines you own or have written permission to test. It handles version detection, OS fingerprinting and scripted checks.',
    developer: 'Gordon Lyon (Fyodor) and the Nmap Project',
    license: 'Nmap Public Source License',
    url: 'https://nmap.org/',
    bin: 'nmap',
    install: 'pkg install nmap',
    glyph: 'radar',
    commands: [
      { args: '-sV -p 22,80,443 192.168.1.10', what: 'Probe the three listed ports. Prints the service and version on each.' },
      { args: '-sn 192.168.1.0/24', what: 'Find which addresses on your subnet are up. No ports get scanned.' },
      { args: '-sS -p- 192.168.1.10', what: 'Sweep all 65535 TCP ports. Catches services on odd numbers.' },
      { args: '-A -T4 192.168.1.10', what: 'Aggressive detection: OS fingerprinting, version probes and default scripts. Run it only on a target you are authorised to test.' },
      { args: '-sU -p 53,123,161 192.168.1.10', what: 'Check common UDP services: DNS, NTP and SNMP. A TCP-only sweep misses these.' },
      { args: '-oN scan.txt -sV 192.168.1.10', what: 'Write a version scan to a readable file. Easy to review or share later.' }
    ],
    example: {
      args: '-sV -p 22,80 192.168.1.10',
      out: 'PORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 9.3p1\n80/tcp open  http    nginx 1.24.0\nService detection performed.',
      note: 'names the software and release behind each open port'
    }
  },
  {
    slug: 'tcpdump',
    name: 'tcpdump',
    category: 'network',
    tagline: 'Watch the packets crossing an interface you control',
    about: 'tcpdump reads traffic passing over a network interface and prints a summary of each packet. Reach for it when you need to see what is really on the wire. Capture rules narrow the output to one host, port or protocol.',
    developer: 'The Tcpdump Group',
    url: 'https://www.tcpdump.org/',
    bin: 'tcpdump',
    install: 'pkg install tcpdump',
    glyph: 'packets',
    commands: [
      { args: '-i wlan0 -c 20', what: 'Capture the next twenty packets on Wi-Fi, then stop. A quick look at the link.' },
      { args: '-i wlan0 port 53', what: 'Show DNS traffic only. The fastest way to watch name resolution.' },
      { args: '-i any host 192.168.1.5', what: 'Filter to a single machine. You watch one device without unrelated chatter.' },
      { args: '-i wlan0 -w capture.pcap', what: 'Write raw traffic to a file instead of the screen. Open it later in a proper analyser.' },
      { args: '-r capture.pcap -nn', what: 'Read a saved capture back with numeric addresses. Faster on a slow resolver.' },
      { args: '-i wlan0 -A port 80', what: 'Print packet payloads as text. You can read an unencrypted HTTP exchange directly.' }
    ],
    example: {
      args: '-i wlan0 -c 5 port 53',
      out: '10:00:01.123456 IP 192.168.1.42.53124 > 1.1.1.1.53: 41234+ A? example.com. (29)\n10:00:01.131002 IP 1.1.1.1.53 > 192.168.1.42.53124: 41234 1/0/0 A 93.184.216.34 (45)\n10:00:02.223344 IP 192.168.1.42.53130 > 1.1.1.1.53: 41235+ AAAA? example.com. (29)\n5 packets captured\n5 packets received by filter'
    }
  },
  {
    slug: 'dig',
    name: 'dig',
    category: 'network',
    tagline: 'Ask any resolver for the DNS records you want',
    about: 'dig sends a DNS query to a name server and prints the full answer, authority and additional sections included. Use it to check a specific record type or trace how a name is delegated. It is part of the BIND suite.',
    developer: 'Internet Systems Consortium',
    url: 'https://www.isc.org/bind/',
    bin: 'dig',
    install: 'pkg install dnsutils',
    glyph: 'dns',
    commands: [
      { args: '@1.1.1.1 example.com A', what: 'Ask a specific public resolver for the address records of a name. Shows what the internet returns, not a local cache.' },
      { args: '+short example.com', what: 'Print only the answer values, no headers. Convenient inside a script.' },
      { args: 'example.com MX', what: 'Look up the mail exchangers for a domain. That is where its email lands.' },
      { args: '-x 93.184.216.34', what: 'Run a reverse lookup on an address. Finds the name attached to it.' },
      { args: '+trace example.com', what: 'Walk the delegation chain from the root down. Pinpoints the broken record.' },
      { args: 'example.com ANY', what: 'Ask for every record type the server will return, in one query.' }
    ],
    example: {
      args: '@1.1.1.1 example.com A',
      out: ';; ANSWER SECTION:\nexample.com.  3600  IN  A  93.184.216.34\nexample.com.  3600  IN  A  93.184.216.35\n;; Query time: 12 msec\n;; SERVER: 1.1.1.1#53(1.1.1.1)'
    }
  },
  {
    slug: 'whois',
    name: 'whois',
    category: 'network',
    tagline: 'Look up who holds a domain or address block',
    about: 'whois queries the public registration databases for domains and network blocks. It prints who holds them and until when. The output comes straight from the registry, unformatted.',
    developer: "Marco d'Itri",
    url: 'https://github.com/rfc1036/whois',
    bin: 'whois',
    install: 'pkg install whois',
    glyph: 'magnifier',
    commands: [
      { args: 'example.com', what: 'Fetch a domain registration record. You see the registrar, key dates and name servers.' },
      { args: '192.0.2.1', what: 'Query an address to find its network block and the organisation responsible.' },
      { args: 'example.co.uk', what: 'Query a name under another registry. Compare how a different country records its holders.' },
      { args: 'example.net', what: 'Check a second domain. Compare registrars and expiry windows side by side.' },
      { args: '-H example.com', what: 'Suppress the long legal disclaimer. Leaves only the record, easier on a small screen.' }
    ]
  },
  {
    slug: 'ip',
    name: 'ip',
    category: 'network',
    tagline: 'Inspect and change addresses, routes and links',
    about: 'ip inspects and configures the network stack: addresses, routes, interfaces and the neighbour cache. Use it to find your own address or see where traffic is being sent. It replaces the older net-tools commands.',
    developer: 'Stephen Hemminger and the iproute2 maintainers',
    url: 'https://wiki.linuxfoundation.org/networking/iproute2',
    bin: 'ip',
    install: 'pkg install iproute2',
    glyph: 'route',
    commands: [
      { args: 'addr show', what: 'Show every interface with its addresses. The quickest way to find your Wi-Fi address.' },
      { args: 'route show', what: 'Print the routing table. You see the gateway your traffic uses.' },
      { args: 'link show', what: 'List the interfaces with their state, hardware addresses and MTU values.' },
      { args: 'neigh show', what: 'Display the neighbour cache, mapping local addresses to hardware addresses.' },
      { args: 'addr add 192.168.1.50/24 dev wlan0', what: 'Assign a static address to an interface for a fixed test setup.' },
      { args: 'route add default via 192.168.1.1', what: 'Set the default gateway by hand for a connection with no route out.' }
    ],
    example: {
      args: 'addr show wlan0',
      out: '2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP>\n    link/ether 02:00:00:00:00:00 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.42/24 brd 192.168.1.255 scope global wlan0\n       valid_lft forever preferred_lft forever'
    }
  },
  {
    slug: 'ping',
    name: 'ping',
    category: 'network',
    tagline: 'Check reachability and round-trip time to a host',
    about: 'ping sends echo requests to a host and reports whether replies come back. Reach for it first when something seems unreachable. It tells you quickly whether the fault is local, further out, or in name resolution.',
    developer: 'The iputils maintainers',
    url: 'https://github.com/iputils/iputils',
    bin: 'ping',
    install: 'pkg install iputils',
    glyph: 'signal',
    commands: [
      { args: '-c 4 example.com', what: 'Send four echo requests and report the round-trip times. The first check for an unreachable host.' },
      { args: '-c 5 -i 0.2 192.168.1.1', what: 'Probe your own router rapidly. Tells you whether packet loss sits on the local link.' },
      { args: '-s 1400 -c 3 example.com', what: 'Test with larger payloads. Exposes an MTU fault on big transfers.' },
      { args: '-6 example.com', what: 'Force an IPv6 lookup. Confirms the host answers over the newer protocol.' },
      { args: '-c 10 -W 1 8.8.8.8', what: 'Measure stability to a public resolver. A short timeout makes dead probes fail fast.' }
    ],
    example: {
      args: '-c 4 example.com',
      out: '4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nrtt min/avg/max/mdev = 11.104/11.452/11.874/0.312 ms\n64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=11.2 ms\n64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=11.4 ms'
    }
  },
  {
    slug: 'traceroute',
    name: 'traceroute',
    category: 'network',
    tagline: 'Map the path packets take to a destination',
    about: 'traceroute shows every router a packet passes through on the way to a destination, with the delay at each hop. Use it when a host answers slowly or not at all. It can probe with UDP, ICMP or TCP.',
    developer: 'Dmitry Butskoy',
    url: 'http://traceroute.sourceforge.net/',
    bin: 'traceroute',
    install: 'pkg install traceroute',
    glyph: 'network',
    commands: [
      { args: '-n example.com', what: 'Trace the path with numeric addresses only. Avoids slow reverse lookups on each hop.' },
      { args: '-m 20 example.com', what: 'Cap the search at twenty hops. Useful for a far or silent destination.' },
      { args: '-I example.com', what: 'Probe with ICMP instead of UDP. Often gets through networks that block the default probe.' },
      { args: '-T -p 443 example.com', what: 'Probe with TCP on port 443. The trace then resembles ordinary web traffic.' },
      { args: '-w 1 -q 1 example.com', what: 'Shorten the wait and send one probe per hop. Finishes a rough trace quickly.' }
    ],
    example: {
      args: '-n example.com',
      out: ' 1  192.168.1.1  1.204 ms  1.102 ms\n 2  10.20.0.1  8.431 ms  8.502 ms\n 3  * * *\n 4  93.184.216.34  11.702 ms  11.664 ms'
    }
  },
  {
    slug: 'mtr',
    name: 'mtr',
    category: 'network',
    tagline: 'Continuous path and loss report in one view',
    about: 'mtr combines the hop-by-hop view of a trace with repeated sampling. Packet loss and latency per hop update live. A report mode runs a fixed number of cycles and exits.',
    developer: 'Roger Wolff',
    url: 'https://www.bitwizard.nl/mtr/',
    bin: 'mtr',
    install: 'pkg install mtr',
    glyph: 'activity',
    commands: [
      { args: '-rwc 10 example.com', what: 'Run ten cycles and print a final report. The form you would paste into a bug report.' },
      { args: '--report example.com', what: 'Produce a single report and exit, without the live display.' },
      { args: '-n example.com', what: 'Keep addresses numeric. The report stays compact and quick.' },
      { args: '-u -c 20 example.com', what: 'Sample over UDP to match how DNS and streaming traffic behaves.' },
      { args: '--tcp -P 443 example.com', what: 'Probe with TCP on port 443 to follow a path that treats web traffic differently.' }
    ],
    example: {
      args: '-rwc 10 example.com',
      out: 'HOST: phone                     Loss%   Snt   Last   Avg  Best  Wrst\n 1.|-- 192.168.1.1                0.0%    10    1.2   1.4   1.1   2.0\n 2.|-- 10.20.0.1                  0.0%    10    8.4   8.9   8.1  12.0\n 3.|-- 93.184.216.34             10.0%    10   11.7  12.0  11.4  18.2'
    }
  },
  {
    slug: 'netcat',
    name: 'netcat',
    category: 'network',
    tagline: 'Read and write raw TCP or UDP connections',
    about: 'netcat opens raw TCP or UDP connections and pipes data through them. It can also listen for an incoming connection. Use it to test a port, talk to a service by hand, or move one file between machines you control.',
    developer: 'The OpenBSD project',
    url: 'https://man.openbsd.org/nc.1',
    bin: 'nc',
    install: 'pkg install netcat-openbsd',
    glyph: 'terminal',
    commands: [
      { args: '-zv example.com 22', what: 'Test whether a single TCP port is open, without sending real data. A lightweight check on a host you manage.' },
      { args: '-lvnp 4444', what: 'Listen on port 4444 for one arriving connection. Handy for moving a file between your own machines.' },
      { args: '-w 3 example.com 80', what: 'Open a raw session to a web port. Type a request by hand and read the reply.' },
      { args: '-u -l 5353', what: 'Listen over UDP instead of TCP. Useful for debugging DNS and other datagram services.' },
      { args: '-zv -w 2 example.com 20-25', what: 'Sweep a small range of ports. A cheap pre-check before a deeper scan.' }
    ],
    example: {
      args: '-zv -w 2 example.com 20-25',
      out: 'Connection to example.com 20 port [tcp/ftp-data] succeeded!\nConnection to example.com 21 port [tcp/ftp] succeeded!\nConnection to example.com 22 port [tcp/ssh] succeeded!\nConnection to example.com 23 port [tcp/telnet] refused'
    }
  },
  {
    slug: 'socat',
    name: 'socat',
    category: 'network',
    tagline: 'Relay data between two addresses or channels',
    about: 'socat joins two data channels of almost any kind and copies bytes between them. A port, socket, file or serial line can all be connected. It is the tool for quick relays and small bridges.',
    developer: 'Gerhard Rieger',
    url: 'http://www.dest-unreach.org/socat/',
    bin: 'socat',
    install: 'pkg install socat',
    glyph: 'split',
    commands: [
      { args: 'TCP-LISTEN:8080,fork TCP:127.0.0.1:80', what: 'Forward every connection on port 8080 to a local web server. A quick way to relay a service.' },
      { args: 'TCP:example.com:80', what: 'Open a plain stream to a remote port and pipe data through it. The building block for many relays.' },
      { args: 'UNIX-LISTEN:/tmp/app.sock,fork UNIX-CONNECT:/tmp/real.sock', what: 'Bridge two Unix sockets to move a program fixed to one path.' },
      { args: 'UDP-RECVFROM:9999,fork -', what: 'Receive UDP datagrams and print them. A simple way to inspect traffic a stream tool would miss.' },
      { args: 'OPEN:notes.txt CREATE:/tmp/out.txt', what: 'Copy a file through the same channel machinery. Occasionally useful for testing a data path.' }
    ]
  },
  {
    slug: 'curl',
    name: 'curl',
    category: 'transfer',
    tagline: 'Transfer data over HTTP, HTTPS, FTP and more',
    about: 'curl is the transfer tool most people script when downloading a file or calling an API. It speaks HTTP, HTTPS, FTP, SFTP and dozens of other protocols. It ships with Termux and nearly every other system.',
    developer: 'Daniel Stenberg and the project contributors',
    url: 'https://curl.se/',
    bin: 'curl',
    install: 'pkg install curl',
    glyph: 'download',
    commands: [
      { args: '-i https://example.com', what: 'Fetch a page and show the headers alongside the body. Reveals status codes and caching directives.' },
      { args: '-O https://example.com/file.zip', what: 'Download a file and save it under the name the server suggests.' },
      { args: '-L -o page.html https://example.com', what: 'Follow redirects and write the result to a chosen filename. The usual way to grab a page for offline reading.' },
      { args: '-X POST -d "a=1&b=2" https://example.com/api', what: 'Send form data to an endpoint with a POST request. The quickest way to exercise an API you are testing.' },
      { args: '-H "Authorization: Bearer TOKEN" https://example.com/api', what: 'Add an authentication header for a protected endpoint.' },
      { args: '-s -o /dev/null -w "%{http_code}" https://example.com', what: 'Print only the HTTP status code. Handy for a script that watches a site.' }
    ],
    example: {
      args: '-i https://example.com',
      out: 'HTTP/1.1 200 OK\ncontent-type: text/html; charset=UTF-8\nserver: nginx/1.24.0\n\n<!doctype html>\n<html lang="en">'
    }
  },
  {
    slug: 'wget',
    name: 'wget',
    category: 'transfer',
    tagline: 'Download without prompts, and mirror a whole site',
    about: 'wget fetches files over HTTP, HTTPS and FTP without any prompts. That makes it a natural fit for scripts and scheduled jobs. Use it to pull one file, resume a broken transfer, or mirror a small site.',
    developer: 'The GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/wget/',
    bin: 'wget',
    install: 'pkg install wget',
    glyph: 'cloud',
    commands: [
      { args: '-O page.html https://example.com', what: 'Download a page and save it under a filename you choose.' },
      { args: '-c https://example.com/big.iso', what: 'Resume an interrupted download from where it stopped. Matters on a flaky mobile connection.' },
      { args: '-r -l 2 https://example.com/docs/', what: 'Mirror a small site to a chosen depth. Read it offline.' },
      { args: '--spider https://example.com', what: 'Check that a URL exists without saving it. Useful for validating links in a script.' },
      { args: '-q -O - https://example.com/status', what: 'Fetch quietly and print to standard output. Another tool can consume the result.' }
    ],
    example: {
      args: '-O file.zip https://example.com/file.zip',
      out: '--2026-10-24 10:00:00--  https://example.com/file.zip\nResolving example.com... 93.184.216.34\nConnecting to example.com|93.184.216.34|:443... connected.\nSaving to: file.zip\nfile.zip  100%[====>]  4.20M  2.10MB/s    in 2.0s'
    }
  },
  {
    slug: 'aria2',
    name: 'aria2',
    category: 'transfer',
    tagline: 'Multi-connection downloader for HTTP, FTP and torrents',
    about: 'aria2 pulls one file over several connections at once and can fetch a batch of URLs in a single run. It also handles BitTorrent and Metalink. Control it from the command line or a small RPC interface.',
    developer: 'Tatsuhiro Tsujikawa',
    license: 'GPL-2.0',
    url: 'https://aria2.github.io/',
    bin: 'aria2c',
    install: 'pkg install aria2',
    glyph: 'gauge',
    commands: [
      { args: '-x 8 -s 8 https://example.com/big.iso', what: 'Download a single file over eight parallel connections. Makes the most of a fast link.' },
      { args: '-d /sdcard/Download -o file.zip https://example.com/file.zip', what: 'Choose the destination directory and filename. Handy on a phone with tight storage paths.' },
      { args: '-Z https://example.com/a https://example.com/b https://example.com/c', what: 'Fetch several URLs in one run, each with its own progress line.' },
      { args: '-c https://example.com/big.iso', what: 'Continue a partial download that was cut off partway through.' },
      { args: '--seed-time=0 file.torrent', what: 'Download a torrent and stop sharing it the moment it finishes. Suits a phone on metered data.' }
    ],
    example: {
      args: '-x 8 https://example.com/big.iso',
      out: '[#1 SIZE:0B/4.2MiB CN:1 SPD:0Bs]\n*** Download Progress Summary ***\nDownload Results:\ngid |stat|avg speed |path\n1   |OK  |2.1MiB/s |/sdcard/Download/file.iso'
    }
  },
  {
    slug: 'axel',
    name: 'axel',
    category: 'transfer',
    tagline: 'Small download accelerator that splits one file',
    about: 'axel opens several connections to one server and splits a file between them. That speeds the transfer up. It also resumes a partial download from a given byte offset.',
    developer: 'Wilmer van der Gaast and contributors',
    url: 'https://github.com/axel-download-accelerator/axel',
    bin: 'axel',
    install: 'pkg install axel',
    glyph: 'activity',
    commands: [
      { args: '-n 8 https://example.com/big.iso', what: 'Download one file using eight connections to speed up a large transfer.' },
      { args: '-o file.zip https://example.com/file.zip', what: 'Save the download under a specific filename instead of the default.' },
      { args: '-a https://example.com/big.iso', what: 'Show a simpler progress bar, easier to read in a narrow phone terminal.' },
      { args: '-n 4 -o data.bin https://example.com/data.bin', what: 'Combine a chosen connection count with an explicit output name in one run.' },
      { args: '-s 1048576 https://example.com/big.iso', what: 'Start the download at a byte offset. Picks a broken transfer up again.' }
    ],
    example: {
      args: '-n 8 https://example.com/big.iso',
      out: 'Initializing download: https://example.com/big.iso\nFile size: 4404019 bytes\nOpening output file big.iso\nStarting download\n[ 45%] .......... .......... .......... [ 2.0MB/s]'
    }
  },
  {
    slug: 'openssh',
    name: 'OpenSSH',
    category: 'transfer',
    tagline: 'Encrypted remote shell and file transfer suite',
    about: 'OpenSSH provides an encrypted remote shell and the file transfer tools beside it. That covers secure copy, an interactive client and a key generator. In Termux your phone can also act as the server.',
    developer: 'The OpenSSH project',
    url: 'https://www.openssh.com/',
    bin: 'ssh',
    install: 'pkg install openssh',
    glyph: 'key',
    commands: [
      { args: '-p 2222 user@192.168.1.10', what: 'Connect to a host over a non-standard port. The usual case for a phone server on a high port.' },
      { args: '-i id_ed25519 user@example.com', what: 'Authenticate with a specific private key instead of the default one.' },
      { args: '-L 8080:localhost:80 user@example.com', what: 'Forward a local port through the connection. Reach a remote service from your device.' },
      { args: '-N -f -D 1080 user@example.com', what: 'Start a background SOCKS proxy over the connection for routing other apps.' },
      { args: '-o StrictHostKeyChecking=accept-new user@example.com', what: 'Connect to a host seen for the first time without the prompt. Useful inside scripts.' },
      { args: '-J jump@example.com user@internal', what: 'Reach an internal host through a jump server in a single step.' }
    ],
    example: {
      args: 'user@example.com',
      out: "Host key fingerprint is SHA256:AbCdEf1234567890.\nWarning: permanently added example.com to the list of known hosts.\nWelcome to Ubuntu 24.04 LTS\nLast login: Fri Oct 23 09:12:44 2026 from 192.168.1.5"
    }
  },
  {
    slug: 'rclone',
    name: 'rclone',
    category: 'transfer',
    tagline: 'Sync files between local storage and cloud remotes',
    about: 'rclone moves and synchronises files between local storage and dozens of cloud services. Each provider is a remote you configure once. Use it to back a folder up, keep two locations in step, or mount a remote.',
    developer: 'Nick Craig-Wood',
    license: 'MIT',
    url: 'https://rclone.org/',
    bin: 'rclone',
    install: 'pkg install rclone',
    glyph: 'sync',
    commands: [
      { args: 'config', what: 'Run the interactive setup to add a cloud remote and its credentials.' },
      { args: 'copy ~/Documents remote:backup', what: 'Upload a local folder to a remote without deleting anything already there.' },
      { args: 'sync ~/Pictures remote:photos', what: 'Make a remote folder match a local one exactly. Files gone locally are removed at the destination.' },
      { args: 'ls remote:backup', what: 'List the files in a remote folder to confirm a backup landed.' },
      { args: 'check ~/Documents remote:backup', what: 'Compare a local folder with a remote one and report differences. A good pre-flight before a large sync.' },
      { args: 'mount remote: /mnt/remote', what: 'Expose a remote as a normal filesystem. Other apps read and write it directly.' }
    ],
    example: {
      args: 'copy ~/Documents remote:backup',
      out: 'Transferred:   3.2 MiB / 3.2 MiB, 100%, 1.1 MiB/s\nChecks:        12 / 12, 100%\nDeleted:        0\nElapsed time:   2.9s'
    }
  },
  {
    slug: 'syncthing',
    name: 'Syncthing',
    category: 'transfer',
    tagline: 'Peer-to-peer folder sync between your own devices',
    about: 'Syncthing keeps folders in step between devices directly, with no central server holding your data. Use it to mirror photos or notes between a phone and a laptop. Devices are paired by exchanging identifiers, and transfers are encrypted end to end.',
    developer: 'The Syncthing Foundation',
    license: 'MPL-2.0',
    url: 'https://syncthing.net/',
    bin: 'syncthing',
    install: 'pkg install syncthing',
    glyph: 'sync',
    commands: [
      { args: 'serve', what: 'Start the background service. It keeps folders in step with your other devices.' },
      { args: 'generate', what: 'Create the initial configuration and device identity on first run.' },
      { args: 'cli show system', what: 'Print the running service status, including its device identifier and version.' },
      { args: 'cli show connections', what: 'List the connected peer devices and each link speed.' },
      { args: 'cli device id', what: 'Show the identifier of this device. Use it to pair with another.' },
      { args: '--gui-address=0.0.0.0:8384 serve', what: 'Expose the web control panel on all interfaces. Manage it from a browser on the same network.' }
    ],
    example: {
      args: 'serve',
      out: '[monitor] 10:00:00 INFO: My ID: ABCD123-EFGH456\n[monitor] 10:00:00 INFO: Ready to synchronise\n[monitor] 10:00:01 INFO: Completed initial scan of folder default\n[monitor] 10:00:02 INFO: Established secure connection to peer'
    }
  },
  {
    slug: 'lftp',
    name: 'lftp',
    category: 'transfer',
    tagline: 'Scriptable file transfer over FTP and SFTP',
    about: 'lftp speaks FTP, SFTP, HTTP and several other protocols, and can mirror whole directory trees in either direction. Use it when a task needs more than one file. It runs commands from a script as easily as from its own prompt.',
    developer: 'Alexander V. Lukyanov',
    license: 'GPL-3.0',
    url: 'https://lftp.yar.ru/',
    bin: 'lftp',
    install: 'pkg install lftp',
    glyph: 'folder',
    commands: [
      { args: '-u user,secret sftp://example.com', what: 'Connect to a secure transfer server with credentials given on the command line.' },
      { args: 'ftp://ftp.example.com', what: 'Open an interactive session to a public FTP server and browse it like a shell.' },
      { args: 'mirror /pub /local/pub', what: 'Download an entire remote directory tree in one go.' },
      { args: 'mirror -R /local/site /public_html', what: 'Upload a local directory tree to a server, refreshing only what changed.' },
      { args: '-e "mirror --only-newer /pub" ftp://ftp.example.com', what: 'Run a mirror and exit straight away. Suits a scheduled job.' },
      { args: '-p 2222 sftp://example.com', what: 'Reach a server listening on a non-standard port.' }
    ]
  },
  {
    slug: 'yt-dlp',
    name: 'yt-dlp',
    category: 'transfer',
    tagline: 'Download video and audio from many sites',
    about: 'yt-dlp fetches video and audio from a long list of streaming sites. It can extract only the soundtrack or pick a particular quality. Respect the terms of service of any site you use it with.',
    developer: 'The yt-dlp project',
    url: 'https://github.com/yt-dlp/yt-dlp',
    bin: 'yt-dlp',
    install: 'pkg install yt-dlp',
    glyph: 'download',
    commands: [
      { args: '-f best https://example.com/video', what: 'Download the best combined video and audio stream available for a link.' },
      { args: '-x --audio-format mp3 https://example.com/video', what: 'Extract the audio track and save it as an MP3 for offline listening.' },
      { args: '-F https://example.com/video', what: 'List every format the site offers with its code. Pick one deliberately.' },
      { args: '-o "%(title)s.%(ext)s" https://example.com/video', what: 'Save the file using the title of the video rather than a generic name.' },
      { args: '-f "bv*+ba" https://example.com/video', what: 'Grab the best video stream and the best audio stream, then merge them.' }
    ],
    example: {
      args: '-F https://example.com/video',
      out: '[info] Available formats for video:\n137  mp4  1920x1080  4000k\n140  m4a  audio      128k\n[download] Destination: video.mp4\n[download] 100% of 42.10MiB'
    }
  },
  {
    slug: 'openssl',
    name: 'OpenSSL',
    category: 'security',
    tagline: 'Cryptography toolkit for keys, hashes and TLS',
    about: 'OpenSSL is a cryptography toolkit: random data, checksums, certificates and file encryption. Use it to make a self-signed certificate, verify a download, or inspect a TLS handshake. The Termux package is openssl-tool.',
    developer: 'The OpenSSL Project',
    license: 'Apache-2.0',
    url: 'https://www.openssl.org/',
    bin: 'openssl',
    install: 'pkg install openssl-tool',
    glyph: 'lock',
    commands: [
      { args: 'rand -base64 32', what: 'Generate 32 bytes of random data and print them in base64. A common way to make a token.' },
      { args: 'dgst -sha256 notes.txt', what: 'Compute a SHA-256 checksum. Confirms a file has not changed.' },
      { args: 'req -new -x509 -key key.pem -out cert.pem -days 365', what: 'Create a self-signed certificate for a service on your own network.' },
      { args: 'enc -aes-256-cbc -salt -in notes.txt -out notes.enc', what: 'Encrypt a file with a passphrase. Store it or send it safely.' },
      { args: 's_client -connect example.com:443', what: 'Inspect the TLS handshake and certificate chain a server presents.' },
      { args: 'x509 -in cert.pem -text -noout', what: 'Decode a certificate and read its subject, issuer and validity dates.' }
    ],
    example: {
      args: 'rand -base64 32',
      out: 'K7gN2vQp8xLm3TzR9wYsB4cD6eF1hJ0k\nQ2wE5rT8yU1iO4pA7sD3fG6hJ9kL0zX\nC5vB8nM2qW4eR7tY1uI3oP6aS9dF0gH'
    }
  },
  {
    slug: 'gnupg',
    name: 'GnuPG',
    category: 'security',
    tagline: 'Encrypt, sign and verify files with public keys',
    about: 'GnuPG implements the OpenPGP standard for encrypting, decrypting, signing and verifying content. Use it for end-to-end encryption of files and email. Keys live in a keyring you can back up and move.',
    developer: 'The GnuPG Project',
    license: 'GPL-3.0',
    url: 'https://gnupg.org/',
    bin: 'gpg',
    install: 'pkg install gnupg',
    glyph: 'key',
    commands: [
      { args: '--gen-key', what: 'Create a new key pair and attach your name and email to it.' },
      { args: '--list-keys', what: 'Show the public keys in your keyring along with their identifiers.' },
      { args: '-e -r user@example.com notes.txt', what: 'Encrypt a file to a public key. Only its holder can read it.' },
      { args: '-d secret.pgp', what: 'Decrypt a file sent to one of your keys.' },
      { args: '--sign --armor notes.txt', what: 'Produce a readable signature proving a file came from you.' },
      { args: '--verify notes.txt.asc', what: 'Check a detached signature against its file and report whether it is valid.' }
    ],
    example: {
      args: '-d notes.txt.gpg',
      out: 'encrypted with 4096-bit RSA key, ID 1A2B3C4D\ndecrypted 2.1 KiB to notes.txt\nPlaintext written to notes.txt'
    }
  },
  {
    slug: 'age',
    name: 'age',
    category: 'security',
    tagline: 'Small, modern file encryption tool',
    about: 'age encrypts files with either a passphrase or a recipient public key. Use it to protect a file quickly without managing a full keyring. It has a tiny set of options and no configuration files.',
    developer: 'Filippo Valsorda and contributors',
    license: 'BSD-3-Clause',
    url: 'https://github.com/FiloSottile/age',
    bin: 'age',
    install: 'pkg install age',
    glyph: 'lock',
    commands: [
      { args: '-p -o notes.enc notes.txt', what: 'Encrypt a file with a passphrase you type, and write the result to a chosen output file.' },
      { args: '-d notes.enc', what: 'Decrypt a file locked with a passphrase.' },
      { args: '-r age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p -o secret.enc secret.txt', what: 'Encrypt to the public key of a recipient. Only they can open it.' },
      { args: '-R recipients.txt -o backup.enc archive.tar', what: 'Encrypt to every key listed in a file. Handy for a small team.' },
      { args: '-a -p -o message.enc message.txt', what: 'Produce armoured text output for pasting into a chat.' }
    ],
    example: {
      args: '-p -o notes.enc notes.txt',
      out: 'Enter passphrase:\nConfirm passphrase:\nEncryption successful\nnotes.enc written (2.1 KiB)'
    }
  },
  {
    slug: 'pass',
    name: 'pass',
    category: 'security',
    tagline: 'Standard Unix credential store backed by GPG',
    about: 'pass keeps credentials in plain files encrypted with GnuPG, one file per entry. Use it when you want a store that is scriptable and version-controllable, with no proprietary app. Entries can be generated, read and removed from the terminal.',
    developer: 'Jason A. Donenfeld',
    license: 'GPL-2.0',
    url: 'https://www.passwordstore.org/',
    bin: 'pass',
    install: 'pkg install pass',
    glyph: 'key',
    commands: [
      { args: 'init user@example.com', what: 'Set up a new encrypted store tied to a GPG key. The first step on a fresh device.' },
      { args: 'insert github.com', what: 'Add a new entry. Your editor opens for the value.' },
      { args: 'show github.com', what: 'Print a stored entry to the terminal after decrypting it.' },
      { args: 'generate amazon.com 24', what: 'Create a random 24-character value and save it under a site name in one step.' },
      { args: 'ls', what: 'List the entries in the store as a tree of site names.' },
      { args: 'rm github.com', what: 'Delete an entry you no longer need from the store.' }
    ],
    example: {
      args: 'ls',
      out: 'Store tree:\ngithub.com\namazon.com\nwork/email\nbank'
    }
  },
  {
    slug: 'pwgen',
    name: 'pwgen',
    category: 'security',
    tagline: 'Generate pronounceable or fully random values',
    about: 'pwgen produces random strings, either pronounceable ones or fully random ones. Use it when you need a batch of candidate values or one strong secret for a script. Options control length, count, symbols and look-alike characters.',
    developer: "Theodore Ts'o",
    url: 'https://github.com/jbernard/pwgen',
    bin: 'pwgen',
    install: 'pkg install pwgen',
    glyph: 'wand',
    commands: [
      { args: '16 5', what: 'Generate five 16-character values, easy to read aloud.' },
      { args: '-s 20 3', what: 'Produce three fully random 20-character strings, with no attempt at memorability.' },
      { args: '-y 14 4', what: 'Include at least one symbol in each 14-character value. Some sites demand one.' },
      { args: '-1 18', what: 'Print a single 18-character value. Convenient inside a script.' },
      { args: '-n 12 5', what: 'Avoid characters that look alike. Helpful for values typed by hand.' },
      { args: '-B 16 3', what: 'Drop look-alike characters, such as the digit one.' }
    ],
    example: {
      args: '16 5',
      out: 'sheiN9ah\nEequai0u\nohZ4eiph\nAiw5ooNg\nWae5Ahvu'
    }
  },
  {
    slug: 'hashcat',
    name: 'hashcat',
    category: 'security',
    tagline: 'Test hashes to audit how strong your secrets are',
    about: 'hashcat tests candidate values against a list of hashes to see which it can recover. That shows how weak the underlying secrets are. Use it only on hashes from systems you own or have written permission to test.',
    developer: 'Jens Steube (atom) and the hashcat project',
    license: 'MIT',
    url: 'https://hashcat.net/hashcat/',
    bin: 'hashcat',
    install: 'pkg install hashcat',
    glyph: 'hash',
    commands: [
      { args: '-m 0 -a 0 hashes.txt wordlist.txt', what: 'Test a list of MD5 digests against a wordlist. Shows how weak the secrets behind them are, on hashes you own or are authorised to audit.' },
      { args: '-m 1000 -a 0 ntlm.txt wordlist.txt', what: 'Run the same check against Windows NTLM hashes taken from a system you are allowed to test.' },
      { args: '-m 0 -a 3 hashes.txt ?a?a?a?a', what: 'Try every four-character combination. Useful for short values a wordlist would miss.' },
      { args: '--show hashes.txt', what: 'Print any digests already recovered in earlier runs alongside their plaintext.' },
      { args: '-m 1800 -a 0 sha512.txt wordlist.txt', what: 'Audit SHA-512 digests with a dictionary attack to gauge the strength of a policy.' },
      { args: '-b', what: 'Benchmark the device. See how many candidates per second to expect.' }
    ],
    example: {
      args: '-m 0 -a 0 hashes.txt wordlist.txt',
      out: 'Hash.Mode........: 0 (MD5)\nRecovered........: 3/10\nProgress.........: 14344385/14344385\nStatus...........: Exhausted\nTime.Started.....: Sat Oct 24 10:00:00 2026'
    }
  },
  {
    slug: 'john',
    name: 'John the Ripper',
    category: 'security',
    tagline: 'Audit password hashes across many formats',
    about: 'John the Ripper tests candidate values against stored hashes to find which it can recover. It ships with many format modules and rules. Use it only on hashes from systems you own or have written permission to test.',
    developer: 'Openwall',
    url: 'https://www.openwall.com/john/',
    bin: 'john',
    install: 'pkg install john',
    glyph: 'hash',
    commands: [
      { args: '--format=raw-md5 hashes.txt', what: 'Audit a set of MD5 digests, on data you own or are authorised to test, to show how quickly weak values fall.' },
      { args: '--wordlist=wordlist.txt hashes.txt', what: 'Run a dictionary attack against a hash file to measure how strong the policy is.' },
      { args: '--show hashes.txt', what: 'List the digests that were already recovered and their plaintext.' },
      { args: '--incremental hashes.txt', what: 'Try progressively longer combinations after a wordlist fails.' },
      { args: '--format=bcrypt shadow.txt', what: 'Audit bcrypt entries taken from a system you are permitted to test.' },
      { args: '--list=formats', what: 'Print every hash format this build supports. Pick the right one.' }
    ],
    example: {
      args: '--wordlist=wordlist.txt hashes.txt',
      out: 'Loaded 5 password hashes\nPress q or Ctrl-C to abort\nWill run 4 OpenMP threads\nproduced 4 passwords\n3g 0:00:00:02 100% 2.1g/s'
    }
  },
  {
    slug: 'hydra',
    name: 'hydra',
    category: 'security',
    tagline: 'Test your own login services against candidates',
    about: 'hydra tries lists of usernames and candidate values against a login service. It covers many protocols and web forms. Use it only against systems you own or have written permission to test.',
    developer: "The Hacker's Choice (THC)",
    url: 'https://github.com/vanhauser-thc/thc-hydra',
    bin: 'hydra',
    install: 'pkg install hydra',
    glyph: 'bug',
    commands: [
      { args: '-l admin -P pass.txt ssh://192.168.1.10', what: 'Test a list of candidates against one account on a server you own, to confirm a lockout policy engages.' },
      { args: '-L users.txt -P pass.txt ftp://192.168.1.10', what: 'Check many accounts at once on a service you are authorised to audit.' },
      { args: '-l admin -P pass.txt -t 4 192.168.1.10 http-post-form', what: 'Exercise a login form on your own test application to see whether it resists guessing.' },
      { args: '-l admin -P pass.txt -f -V ssh://192.168.1.10', what: 'Stop at the first success and show every attempt. Useful for tuning a rule set.' },
      { args: '-L users.txt -P pass.txt -s 2222 ssh://192.168.1.10', what: 'Run the check against a service listening on a non-standard port.' }
    ],
    example: {
      args: '-l admin -P pass.txt ssh://192.168.1.10',
      out: '[DATA] max 4 tasks, 1 server\n[DATA] attacking ssh://192.168.1.10:22/\n[22][ssh] host: 192.168.1.10   login: admin   password: changeme\n1 of 1 target successfully completed\n1 valid password found'
    }
  },
  {
    slug: 'sqlmap',
    name: 'sqlmap',
    category: 'security',
    tagline: 'Detect and exploit SQL injection in your own apps',
    about: 'sqlmap probes request parameters for SQL injection flaws. Once it finds one, it can enumerate the databases behind the endpoint. Use it only on applications you own or have written permission to test.',
    developer: 'Bernardo Damele and Miroslav Stampar',
    url: 'https://sqlmap.org/',
    bin: 'sqlmap',
    install: 'pkg install sqlmap',
    glyph: 'bug',
    commands: [
      { args: '-u "https://example.com/item?id=1" --batch', what: 'Probe a parameter for injection flaws on an application you own or are authorised to test, running unattended.' },
      { args: '-u "https://example.com/item?id=1" --dbs', what: 'List the database names once an injectable parameter is found.' },
      { args: '-r request.txt --batch', what: 'Replay a saved HTTP request. Headers and cookies go out exactly as captured.' },
      { args: '--data="id=1" -u https://example.com/api', what: 'Test a POST body parameter rather than a query string.' },
      { args: '-u "https://example.com/item?id=1" --tables -D appdb', what: 'Enumerate the tables in a specific database during an authorised assessment.' },
      { args: '-u "https://example.com/item?id=1" --risk 3 --level 5', what: 'Raise the number of payloads and tests. Slower, but more thorough.' }
    ],
    example: {
      args: '-u "https://example.com/item?id=1" --batch',
      out: '[INFO] testing connection to the target URL\n[INFO] GET parameter id appears to be injectable\n[INFO] the back-end DBMS is MySQL\navailable databases [2]:\n[*] appdb\n[*] information_schema'
    }
  },
  {
    slug: 'nikto',
    name: 'nikto',
    category: 'security',
    tagline: 'Web server checks for a site you control',
    about: 'nikto runs a series of checks against a web server. It reports missing security headers, default files, outdated banners and other oversights. Use it only on sites you own or have written permission to test.',
    developer: 'Chris Sullo and David Lodge',
    url: 'https://github.com/sullo/nikto',
    bin: 'nikto',
    install: 'pkg install nikto',
    glyph: 'shield',
    commands: [
      { args: '-h https://example.com', what: 'Run a baseline check on a site you own to catch missing headers and default files.' },
      { args: '-h https://example.com -p 8080', what: 'Point the check at a service on a non-standard port.' },
      { args: '-h https://example.com -Tuning 123', what: 'Limit the scan to specific test groups to keep a run short.' },
      { args: '-h https://example.com -ssl', what: 'Force TLS for a server that redirects oddly or serves both schemes.' },
      { args: '-h https://example.com -o report.html -Format html', what: 'Write the findings to a shareable HTML report.' },
      { args: '-h https://example.com -id admin:secret', what: 'Supply credentials. Authenticated areas of your own site get checked too.' }
    ],
    example: {
      args: '-h https://example.com',
      out: '- Server: nginx/1.24.0\n+ The anti-clickjacking X-Frame-Options header is not present.\n+ /admin/: Admin login page found.\n+ 2 host(s) tested'
    }
  },
  {
    slug: 'wireguard',
    name: 'WireGuard',
    category: 'security',
    tagline: 'Modern VPN tunnel with a small attack surface',
    about: 'WireGuard builds an encrypted tunnel between peers using public keys. Its code base is deliberately small and auditable. The Termux tools let you generate keys and manage tunnels.',
    developer: 'Jason A. Donenfeld',
    license: 'GPL-2.0',
    url: 'https://www.wireguard.com/',
    bin: 'wg',
    install: 'pkg install wireguard-tools',
    glyph: 'shield',
    commands: [
      { args: 'genkey', what: 'Create a fresh private key for a new peer.' },
      { args: 'pubkey', what: 'Derive the matching public key from a private one. Share it with peers.' },
      { args: 'show', what: 'List the active tunnels and their interfaces.' },
      { args: 'show wg0', what: 'Print the peers, endpoints and latest handshake for one tunnel.' },
      { args: 'set wg0 peer aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789= allowed-ips 10.0.0.2/32', what: 'Add a peer to a running tunnel and give it a set of addresses.' },
      { args: 'show wg0 transfer', what: 'Show how many bytes have moved through the tunnel since it came up.' }
    ],
    example: {
      args: 'show wg0',
      out: 'interface: wg0\n  public key: aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789=\n  listening port: 51820\npeer: eFgHiJkLmNoPqRsTuVwXyZ0123456789aBc=\n  endpoint: 203.0.113.5:51820\n  latest handshake: 12 seconds ago'
    }
  }
];
