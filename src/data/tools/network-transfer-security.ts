import type { Tool } from './types';

export const networkTransferSecurityTools: Tool[] = [
  {
    slug: 'nmap',
    name: 'Nmap',
    category: 'network',
    tagline: 'Port scanner and network mapper for hosts you own',
    about: 'Nmap is a port scanner and network mapper used to discover which hosts are up and which services they expose. You would reach for it when auditing a machine or network you own or have written permission to test, to see the open ports and the software answering on them. It supports version detection, OS fingerprinting and scriptable checks.',
    developer: 'Gordon Lyon (Fyodor) and the Nmap Project',
    license: 'Nmap Public Source License',
    url: 'https://nmap.org/',
    bin: 'nmap',
    install: 'pkg install nmap',
    glyph: 'radar',
    commands: [
      { args: '-sV -p 22,80,443 192.168.1.10', what: 'probe the three listed ports and print the service and version answering on each, the starting point when auditing a host you own' },
      { args: '-sn 192.168.1.0/24', what: 'discover which addresses on a local subnet are up without scanning any ports, useful for a quick inventory of your own home network' },
      { args: '-sS -p- 192.168.1.10', what: 'sweep every one of the 65535 TCP ports to find services listening on non-standard numbers' },
      { args: '-A -T4 192.168.1.10', what: 'run aggressive detection covering OS fingerprinting, version probes and default scripts against a target you are authorised to test' },
      { args: '-sU -p 53,123,161 192.168.1.10', what: 'check common UDP services such as DNS, NTP and SNMP, which a TCP-only sweep would miss entirely' },
      { args: '-oN scan.txt -sV 192.168.1.10', what: 'write a readable report of a version scan to a file so the results can be reviewed or shared later' }
    ],
    example: {
      args: '-sV -p 22,80 192.168.1.10',
      out: 'PORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 9.3p1\n80/tcp open  http    nginx 1.24.0\nService detection performed.',
      note: 'version detection names the software and its release behind each open port'
    }
  },
  {
    slug: 'tcpdump',
    name: 'tcpdump',
    category: 'network',
    tagline: 'Capture and inspect packets on an interface you control',
    about: 'tcpdump is a command-line packet capture tool that reads traffic passing over a network interface and prints a summary of each packet. You would reach for it when you need to see what is actually on the wire, such as checking whether DNS queries leave your device or diagnosing a stalled connection. Capture rules let you narrow the output to one host, port or protocol.',
    developer: 'The Tcpdump Group',
    url: 'https://www.tcpdump.org/',
    bin: 'tcpdump',
    install: 'pkg install tcpdump',
    glyph: 'packets',
    commands: [
      { args: '-i wlan0 -c 20', what: 'capture the next twenty packets on the Wi-Fi interface and stop, a quick look at what is crossing the link' },
      { args: '-i wlan0 port 53', what: 'show only DNS traffic, the fastest way to confirm which names your device is resolving' },
      { args: '-i any host 192.168.1.5', what: 'filter to a single machine so you can watch one device without drowning in unrelated chatter' },
      { args: '-i wlan0 -w capture.pcap', what: 'write the raw traffic to a file instead of the screen, so it can be opened later in a proper analyser' },
      { args: '-r capture.pcap -nn', what: 'read a saved capture back and print it with numeric addresses, which suits a device that resolves names slowly' },
      { args: '-i wlan0 -A port 80', what: 'print packet payloads as text so you can read an unencrypted HTTP exchange directly' }
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
    tagline: 'Query DNS records directly from a chosen resolver',
    about: 'dig is a flexible DNS lookup tool that sends a query to a name server and prints the full answer, including authority and additional sections. You would reach for it when you want to see exactly what a resolver returns, check a specific record type, or trace how a name is delegated. It is part of the BIND suite from the Internet Systems Consortium.',
    developer: 'Internet Systems Consortium',
    url: 'https://www.isc.org/bind/',
    bin: 'dig',
    install: 'pkg install dnsutils',
    glyph: 'dns',
    commands: [
      { args: '@1.1.1.1 example.com A', what: 'ask a specific public resolver for the address records of a name, which shows what the internet returns rather than what a local cache holds' },
      { args: '+short example.com', what: 'print only the answer values with no headers, convenient inside a script that needs the address alone' },
      { args: 'example.com MX', what: 'look up the mail exchangers for a domain to see where its email is delivered' },
      { args: '-x 93.184.216.34', what: 'run a reverse lookup on an address to find the name associated with it' },
      { args: '+trace example.com', what: 'walk the delegation chain from the root down, which pinpoints where a broken record is introduced' },
      { args: 'example.com ANY', what: 'ask for every record type the server is willing to return in a single query' }
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
    tagline: 'Look up domain and address registration records',
    about: 'whois queries the public registration databases for domains and network blocks and prints who holds them and until when. You would reach for it when checking when a domain expires, who its registrar is, or which organisation is responsible for an address range. The output comes straight from the registry and is unformatted.',
    developer: "Marco d'Itri",
    url: 'https://github.com/rfc1036/whois',
    bin: 'whois',
    install: 'pkg install whois',
    glyph: 'magnifier',
    commands: [
      { args: 'example.com', what: 'fetch the registration record for a domain, including the registrar, key dates and the name servers it uses' },
      { args: '192.0.2.1', what: 'query an address to find the network block it belongs to and the organisation responsible for it' },
      { args: 'example.co.uk', what: 'query a name under a different registry so you can compare how another country records its holders' },
      { args: 'example.net', what: 'check a second domain so you can compare registrars and expiry windows side by side' },
      { args: '-H example.com', what: 'suppress the long legal disclaimer and leave only the record itself, easier to read on a small screen' }
    ]
  },
  {
    slug: 'ip',
    name: 'ip',
    category: 'network',
    tagline: 'Show and change addresses, routes and links',
    about: 'ip is the modern tool for inspecting and configuring the network stack, covering addresses, routes, interfaces and the neighbour cache. You would reach for it when you need to know which address your device holds, where traffic is being sent, or to bring an interface up. It replaces the older net-tools commands and ships in the iproute2 package.',
    developer: 'Stephen Hemminger and the iproute2 maintainers',
    url: 'https://wiki.linuxfoundation.org/networking/iproute2',
    bin: 'ip',
    install: 'pkg install iproute2',
    glyph: 'route',
    commands: [
      { args: 'addr show', what: 'show every network interface with its assigned addresses, the quickest way to find the address of your device on a Wi-Fi network' },
      { args: 'route show', what: 'print the routing table so you can see which gateway your traffic leaves through' },
      { args: 'link show', what: 'list the interfaces themselves with their state, hardware addresses and MTU values' },
      { args: 'neigh show', what: 'display the neighbour cache, mapping local addresses to hardware addresses so you can spot a duplicate' },
      { args: 'addr add 192.168.1.50/24 dev wlan0', what: 'assign a static address to an interface while testing a fixed configuration' },
      { args: 'route add default via 192.168.1.1', what: 'set the default gateway by hand when a connection has no route out' }
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
    about: 'ping sends echo requests to a host and reports whether replies come back and how long they take. You would reach for it first whenever something seems unreachable, because it tells you quickly whether the problem is the local link, the wider network, or name resolution. It ships in the iputils package.',
    developer: 'The iputils maintainers',
    url: 'https://github.com/iputils/iputils',
    bin: 'ping',
    install: 'pkg install iputils',
    glyph: 'signal',
    commands: [
      { args: '-c 4 example.com', what: 'send four echo requests and report the round-trip times, the first check when a host seems unreachable' },
      { args: '-c 5 -i 0.2 192.168.1.1', what: 'probe your own router rapidly to see whether packet loss sits on the local link or further out' },
      { args: '-s 1400 -c 3 example.com', what: 'test with larger payloads to expose an MTU problem that drops big transfers while small ones succeed' },
      { args: '-6 example.com', what: 'force an IPv6 lookup to confirm the host answers over the newer protocol' },
      { args: '-c 10 -W 1 8.8.8.8', what: 'measure stability to a public resolver with a short timeout so unreachable probes fail fast' }
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
    about: 'traceroute shows every router a packet passes through on its way to a destination, with the delay at each hop. You would reach for it when a host answers slowly or not at all and you need to see where along the path the trouble begins. It can probe with UDP, ICMP or TCP depending on what the network allows.',
    developer: 'Dmitry Butskoy',
    url: 'http://traceroute.sourceforge.net/',
    bin: 'traceroute',
    install: 'pkg install traceroute',
    glyph: 'network',
    commands: [
      { args: '-n example.com', what: 'trace the path while printing numeric addresses only, which avoids slow reverse lookups on each hop' },
      { args: '-m 20 example.com', what: 'cap the search at twenty hops when the destination is far away or never answers' },
      { args: '-I example.com', what: 'probe using ICMP instead of UDP, which often gets through networks that block the default probe' },
      { args: '-T -p 443 example.com', what: 'probe with TCP on port 443 so the trace resembles ordinary web traffic' },
      { args: '-w 1 -q 1 example.com', what: 'shorten the wait and send one probe per hop to finish a rough trace quickly' }
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
    about: 'mtr combines the hop-by-hop view of a path trace with the repeated sampling of an echo probe, so packet loss and latency per hop update live. You would reach for it when an intermittent problem needs watching over time rather than a single snapshot. A report mode runs a fixed number of cycles and exits, which suits sharing results.',
    developer: 'Roger Wolff',
    url: 'https://www.bitwizard.nl/mtr/',
    bin: 'mtr',
    install: 'pkg install mtr',
    glyph: 'activity',
    commands: [
      { args: '-rwc 10 example.com', what: 'run ten cycles and print a final report, the form you would paste into a bug report' },
      { args: '--report example.com', what: 'produce a single report and exit without the live display' },
      { args: '-n example.com', what: 'keep addresses numeric so the report stays compact and quick' },
      { args: '-u -c 20 example.com', what: 'sample over UDP to match the behaviour of DNS and streaming traffic' },
      { args: '--tcp -P 443 example.com', what: 'probe with TCP on port 443 to follow a path that treats web traffic differently' }
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
    about: 'netcat is a small utility that opens raw TCP or UDP connections and pipes data through them, or listens for an incoming one. You would reach for it to test whether a port is open, to talk to a service by hand, or to move a single file between two machines you control. The version packaged for Termux is the OpenBSD one.',
    developer: 'The OpenBSD project',
    url: 'https://man.openbsd.org/nc.1',
    bin: 'nc',
    install: 'pkg install netcat-openbsd',
    glyph: 'terminal',
    commands: [
      { args: '-zv example.com 22', what: 'test whether a single TCP port is open without sending real data, a lightweight reachability check for a host you manage' },
      { args: '-lvnp 4444', what: 'listen on port 4444 for a single arriving connection, handy for moving one file between two machines you control' },
      { args: '-w 3 example.com 80', what: 'open a raw session to a web port so you can type a request by hand and read the reply' },
      { args: '-u -l 5353', what: 'listen over UDP instead of TCP, useful for debugging DNS and other datagram services' },
      { args: '-zv -w 2 example.com 20-25', what: 'sweep a small range of ports to see which are listening before a deeper scan' }
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
    about: 'socat connects two data channels of almost any kind and copies bytes between them, so a port, a socket, a file or a serial line can be joined to another. You would reach for it when you need a quick relay or a bridge between a program and a service that do not speak the same transport. It is a general-purpose tool for building small data paths.',
    developer: 'Gerhard Rieger',
    url: 'http://www.dest-unreach.org/socat/',
    bin: 'socat',
    install: 'pkg install socat',
    glyph: 'split',
    commands: [
      { args: 'TCP-LISTEN:8080,fork TCP:127.0.0.1:80', what: 'forward every connection arriving on port 8080 to a local web server, a quick way to relay or expose a service' },
      { args: 'TCP:example.com:80', what: 'open a plain stream to a remote port and pipe data through it, the building block for many relay setups' },
      { args: 'UNIX-LISTEN:/tmp/app.sock,fork UNIX-CONNECT:/tmp/real.sock', what: 'bridge two Unix sockets, which helps when a program is hard-wired to a socket path you need to move' },
      { args: 'UDP-RECVFROM:9999,fork -', what: 'receive UDP datagrams and print them, a simple way to inspect traffic that a stream tool would never see' },
      { args: 'OPEN:notes.txt CREATE:/tmp/out.txt', what: 'copy a file through the same channel machinery, occasionally useful for testing a data path end to end' }
    ]
  },
  {
    slug: 'curl',
    name: 'curl',
    category: 'transfer',
    tagline: 'Transfer data over HTTP, HTTPS, FTP and many more',
    about: 'This is the command-line transfer tool most people reach for when scripting a download or an API call, speaking HTTP, HTTPS, FTP, SFTP and dozens of other protocols. You would use it to fetch a page, upload a file, or send a request with custom headers and data. It is included in Termux and available on nearly every system you will meet.',
    developer: 'Daniel Stenberg and the project contributors',
    url: 'https://curl.se/',
    bin: 'curl',
    install: 'pkg install curl',
    glyph: 'download',
    commands: [
      { args: '-i https://example.com', what: 'fetch a page and show the response headers alongside the body, which reveals status codes and caching directives' },
      { args: '-O https://example.com/file.zip', what: 'download a file and save it under the name the server suggests' },
      { args: '-L -o page.html https://example.com', what: 'follow redirects and write the result to a chosen filename, the usual way to grab a page for offline reading' },
      { args: '-X POST -d "a=1&b=2" https://example.com/api', what: 'send form data to an endpoint with a POST request, the quickest way to exercise an API you are testing' },
      { args: '-H "Authorization: Bearer TOKEN" https://example.com/api', what: 'attach an authentication header when calling a protected endpoint' },
      { args: '-s -o /dev/null -w "%{http_code}" https://example.com', what: 'print only the HTTP status code, handy in a script that checks whether a site is responding' }
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
    tagline: 'Non-interactive downloader that can mirror a site',
    about: 'This downloader fetches files over HTTP, HTTPS and FTP without any prompts, which makes it a natural fit for scripts and scheduled jobs. You would reach for it to pull a single file, resume a broken transfer, or mirror a small site for offline reading. It is part of the GNU Project.',
    developer: 'The GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/wget/',
    bin: 'wget',
    install: 'pkg install wget',
    glyph: 'cloud',
    commands: [
      { args: '-O page.html https://example.com', what: 'download a page and save it under a filename you choose' },
      { args: '-c https://example.com/big.iso', what: 'resume an interrupted download from where it stopped, which matters on a flaky mobile connection' },
      { args: '-r -l 2 https://example.com/docs/', what: 'mirror a small site to a chosen depth so you can read it offline' },
      { args: '--spider https://example.com', what: 'check that a URL exists without saving it, useful for validating links in a script' },
      { args: '-q -O - https://example.com/status', what: 'fetch quietly and print to standard output so another tool can consume the result' }
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
    about: 'aria2 is a downloader that can pull one file over several connections at once, fetch a batch of URLs in a single run, and handle BitTorrent and Metalink as well. You would reach for it when a large download needs to make the most of a fast link or when several files must be fetched together. It is controlled entirely from the command line or a small RPC interface.',
    developer: 'Tatsuhiro Tsujikawa',
    license: 'GPL-2.0',
    url: 'https://aria2.github.io/',
    bin: 'aria2c',
    install: 'pkg install aria2',
    glyph: 'gauge',
    commands: [
      { args: '-x 8 -s 8 https://example.com/big.iso', what: 'download a single file over eight parallel connections to make the most of a fast link' },
      { args: '-d /sdcard/Download -o file.zip https://example.com/file.zip', what: 'choose the destination directory and filename explicitly, handy on a phone where storage paths matter' },
      { args: '-Z https://example.com/a https://example.com/b https://example.com/c', what: 'fetch several URLs in one run, each with its own progress line' },
      { args: '-c https://example.com/big.iso', what: 'continue a partial download that was cut off partway through' },
      { args: '--seed-time=0 file.torrent', what: 'download a torrent and stop sharing it the moment it finishes, which suits a phone on metered data' }
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
    tagline: 'Light download accelerator that splits a file',
    about: 'axel is a small downloader that opens several connections to one server and splits a file between them to speed the transfer up. You would reach for it when a single large file is crawling on a slow link and the server allows parallel requests. It also resumes a partial download from a given byte offset.',
    developer: 'Wilmer van der Gaast and contributors',
    url: 'https://github.com/axel-download-accelerator/axel',
    bin: 'axel',
    install: 'pkg install axel',
    glyph: 'activity',
    commands: [
      { args: '-n 8 https://example.com/big.iso', what: 'download one file using eight connections to speed up a large transfer' },
      { args: '-o file.zip https://example.com/file.zip', what: 'save the download under a specific filename instead of the default' },
      { args: '-a https://example.com/big.iso', what: 'show a simpler progress bar that is easier to read in a narrow phone terminal' },
      { args: '-n 4 -o data.bin https://example.com/data.bin', what: 'combine a chosen connection count with an explicit output name in one run' },
      { args: '-s 1048576 https://example.com/big.iso', what: 'start the download at a byte offset so a broken transfer can be picked up again' }
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
    about: 'OpenSSH provides the encrypted remote shell and the file transfer tools that sit alongside it, including secure copy, an interactive transfer client and a key generator. You would reach for it to log into a server, run commands on a remote machine, or move files over an encrypted channel. In Termux it also lets your phone act as the server so another device can connect to it.',
    developer: 'The OpenSSH project',
    url: 'https://www.openssh.com/',
    bin: 'ssh',
    install: 'pkg install openssh',
    glyph: 'key',
    commands: [
      { args: '-p 2222 user@192.168.1.10', what: 'connect to a host over a non-standard port, the usual case when a phone runs the server on its own high port' },
      { args: '-i id_ed25519 user@example.com', what: 'authenticate with a specific private key instead of the default one' },
      { args: '-L 8080:localhost:80 user@example.com', what: 'forward a local port through the connection, letting you reach a remote service as if it were on your own device' },
      { args: '-N -f -D 1080 user@example.com', what: 'start a background SOCKS proxy over the connection for routing traffic from other apps' },
      { args: '-o StrictHostKeyChecking=accept-new user@example.com', what: 'connect to a host seen for the first time without the interactive prompt, useful inside scripts' },
      { args: '-J jump@example.com user@internal', what: 'reach an internal host through a jump server in a single step' }
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
    about: 'rclone moves and synchronises files between local storage and dozens of cloud services, treating each provider as a remote you configure once. You would reach for it to back a folder up, keep two locations in step, or mount a remote so other apps can read it. It is a single self-contained program with no background service of its own.',
    developer: 'Nick Craig-Wood',
    license: 'MIT',
    url: 'https://rclone.org/',
    bin: 'rclone',
    install: 'pkg install rclone',
    glyph: 'sync',
    commands: [
      { args: 'config', what: 'run the interactive setup to add a cloud remote and its credentials' },
      { args: 'copy ~/Documents remote:backup', what: 'upload a local folder to a remote without deleting anything already there' },
      { args: 'sync ~/Pictures remote:photos', what: 'make a remote folder match a local one exactly, removing files at the destination that are gone locally' },
      { args: 'ls remote:backup', what: 'list the files stored in a remote folder to confirm a backup landed' },
      { args: 'check ~/Documents remote:backup', what: 'compare a local folder with a remote one and report any differences, a good pre-flight before a large sync' },
      { args: 'mount remote: /mnt/remote', what: 'expose a remote as a normal filesystem so other apps can read and write it directly' }
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
    about: 'Syncthing keeps folders in step between devices directly, with no central server holding your data. You would reach for it to mirror photos or notes between a phone and a laptop on the same network, or across the internet when both ends are online. Devices are paired by exchanging identifiers, and transfers are encrypted end to end.',
    developer: 'The Syncthing Foundation',
    license: 'MPL-2.0',
    url: 'https://syncthing.net/',
    bin: 'syncthing',
    install: 'pkg install syncthing',
    glyph: 'sync',
    commands: [
      { args: 'serve', what: 'start the background service that keeps folders in step with your other devices' },
      { args: 'generate', what: 'create the initial configuration and device identity on first run' },
      { args: 'cli show system', what: 'print the running service status, including its device identifier and version' },
      { args: 'cli show connections', what: 'list which peer devices are currently connected and how fast each link is' },
      { args: 'cli device id', what: 'show the identifier of this device so you can pair it with another' },
      { args: '--gui-address=0.0.0.0:8384 serve', what: 'expose the web control panel on all interfaces so you can manage it from a browser on the same network' }
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
    about: 'lftp is a transfer client that speaks FTP, SFTP, HTTP and several other protocols and can mirror whole directory trees in either direction. You would reach for it when a task needs more than a single file, such as refreshing a website from a local copy or pulling an entire public archive. It runs commands from a script as easily as from its own prompt.',
    developer: 'Alexander V. Lukyanov',
    license: 'GPL-3.0',
    url: 'https://lftp.yar.ru/',
    bin: 'lftp',
    install: 'pkg install lftp',
    glyph: 'folder',
    commands: [
      { args: '-u user,secret sftp://example.com', what: 'connect to a secure transfer server with credentials given on the command line' },
      { args: 'ftp://ftp.example.com', what: 'open an interactive session to a public FTP server and browse it like a shell' },
      { args: 'mirror /pub /local/pub', what: 'download an entire remote directory tree in one go' },
      { args: 'mirror -R /local/site /public_html', what: 'upload a local directory tree to a server, refreshing only what changed' },
      { args: '-e "mirror --only-newer /pub" ftp://ftp.example.com', what: 'run a mirror and exit straight away, which suits a scheduled job' },
      { args: '-p 2222 sftp://example.com', what: 'connect to a non-standard port when the server does not use the default' }
    ]
  },
  {
    slug: 'yt-dlp',
    name: 'yt-dlp',
    category: 'transfer',
    tagline: 'Download video and audio from many sites',
    about: 'yt-dlp fetches video and audio from a long list of streaming sites and can extract just the soundtrack or pick a particular quality. You would reach for it to keep a copy of a talk or a lecture for offline viewing, or to pull the audio for listening on the move. Respect the terms of service of any site you use it with.',
    developer: 'The yt-dlp project',
    url: 'https://github.com/yt-dlp/yt-dlp',
    bin: 'yt-dlp',
    install: 'pkg install yt-dlp',
    glyph: 'download',
    commands: [
      { args: '-f best https://example.com/video', what: 'download the best combined video and audio stream available for a link' },
      { args: '-x --audio-format mp3 https://example.com/video', what: 'extract the audio track and save it as an MP3 for offline listening' },
      { args: '-F https://example.com/video', what: 'list every format the site offers with its code, so you can choose one deliberately' },
      { args: '-o "%(title)s.%(ext)s" https://example.com/video', what: 'save the file using the title of the video rather than a generic name' },
      { args: '-f "bv*+ba" https://example.com/video', what: 'grab the best video stream and the best audio stream and merge them into one file' }
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
    about: 'OpenSSL is a cryptography toolkit that can generate random data, compute checksums, create and inspect certificates, and encrypt files. You would reach for it to make a self-signed certificate for a service you run, to verify a download, or to look at what a server presents during a TLS handshake. The Termux package is openssl-tool, which installs the command-line program.',
    developer: 'The OpenSSL Project',
    license: 'Apache-2.0',
    url: 'https://www.openssl.org/',
    bin: 'openssl',
    install: 'pkg install openssl-tool',
    glyph: 'lock',
    commands: [
      { args: 'rand -base64 32', what: 'generate 32 bytes of random data and print them in base64, a common way to make a strong token or key' },
      { args: 'dgst -sha256 notes.txt', what: 'compute a SHA-256 checksum so you can confirm a file has not changed' },
      { args: 'req -new -x509 -key key.pem -out cert.pem -days 365', what: 'create a self-signed certificate for a service you run on your own network' },
      { args: 'enc -aes-256-cbc -salt -in notes.txt -out notes.enc', what: 'encrypt a file with a passphrase so it can be stored or sent safely' },
      { args: 's_client -connect example.com:443', what: 'inspect the TLS handshake and certificate chain a server presents' },
      { args: 'x509 -in cert.pem -text -noout', what: 'decode a certificate and read its subject, issuer and validity dates in plain text' }
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
    about: 'GnuPG implements the OpenPGP standard so you can encrypt a file to someone else, decrypt one sent to you, and sign or verify content. You would reach for it when you need end-to-end encryption for files and email, or a durable signature that proves authorship. Keys live in a keyring on the device and can be backed up and moved.',
    developer: 'The GnuPG Project',
    license: 'GPL-3.0',
    url: 'https://gnupg.org/',
    bin: 'gpg',
    install: 'pkg install gnupg',
    glyph: 'key',
    commands: [
      { args: '--gen-key', what: 'create a new key pair and attach your name and email to it' },
      { args: '--list-keys', what: 'show the public keys in your keyring along with their identifiers' },
      { args: '-e -r user@example.com notes.txt', what: 'encrypt a file so only the holder of that public key can read it' },
      { args: '-d secret.pgp', what: 'decrypt a file that was encrypted to one of your keys' },
      { args: '--sign --armor notes.txt', what: 'produce a readable signature proving a file came from you and is unchanged' },
      { args: '--verify notes.txt.asc', what: 'check a detached signature against its file and report whether it is valid' }
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
    about: 'age is a file encryption tool designed to be small and easy to use, working with either a passphrase or a recipient public key. You would reach for it when you want to protect a file quickly without managing a full keyring, or to encrypt something to a colleague by their public key. It has a deliberately tiny set of options and no configuration files.',
    developer: 'Filippo Valsorda and contributors',
    license: 'BSD-3-Clause',
    url: 'https://github.com/FiloSottile/age',
    bin: 'age',
    install: 'pkg install age',
    glyph: 'lock',
    commands: [
      { args: '-p -o notes.enc notes.txt', what: 'encrypt a file with a passphrase you type, and write the result to a chosen output file' },
      { args: '-d notes.enc', what: 'decrypt a file that was protected with a passphrase' },
      { args: '-r age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p -o secret.enc secret.txt', what: 'encrypt to the public key of a recipient so only they can open it' },
      { args: '-R recipients.txt -o backup.enc archive.tar', what: 'encrypt to every key listed in a file, handy for a small team' },
      { args: '-a -p -o message.enc message.txt', what: 'produce armoured text output that can be pasted into a chat instead of sent as a file' }
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
    about: 'pass keeps credentials in plain files encrypted with GnuPG, with one file per entry under a directory you control. You would reach for it when you want a store that is scriptable, version-controllable and free of any proprietary app, and that can sync through ordinary file tools. Entries can be generated, read and removed entirely from the terminal.',
    developer: 'Jason A. Donenfeld',
    license: 'GPL-2.0',
    url: 'https://www.passwordstore.org/',
    bin: 'pass',
    install: 'pkg install pass',
    glyph: 'key',
    commands: [
      { args: 'init user@example.com', what: 'set up a new encrypted store tied to a GPG key, the first step on a fresh device' },
      { args: 'insert github.com', what: 'add a new entry, opening an editor so you can type the value' },
      { args: 'show github.com', what: 'print a stored entry to the terminal after decrypting it' },
      { args: 'generate amazon.com 24', what: 'create a random 24-character value and save it under a site name in one step' },
      { args: 'ls', what: 'list the entries in the store as a tree of site names' },
      { args: 'rm github.com', what: 'delete an entry you no longer need from the store' }
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
    about: 'pwgen produces random strings, either pronounceable ones that are easier to read out or fully random ones for maximum strength. You would reach for it when you need a batch of candidate values or a single strong secret for a script. Options control length, count, symbols and the exclusion of look-alike characters.',
    developer: "Theodore Ts'o",
    url: 'https://github.com/jbernard/pwgen',
    bin: 'pwgen',
    install: 'pkg install pwgen',
    glyph: 'wand',
    commands: [
      { args: '16 5', what: 'generate five 16-character values that are easy to read aloud but still strong' },
      { args: '-s 20 3', what: 'produce three fully random 20-character strings with no attempt to make them memorable' },
      { args: '-y 14 4', what: 'include at least one symbol in each 14-character value, for sites that demand one' },
      { args: '-1 18', what: 'print a single 18-character value, convenient inside a script' },
      { args: '-n 12 5', what: 'avoid characters that look alike, which helps when a value has to be typed by hand' },
      { args: '-B 16 3', what: 'exclude characters that are ambiguous in many fonts, such as the digit one and the letter l' }
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
    tagline: 'Recover hashes to audit password strength',
    about: 'hashcat tests candidate values against a list of hashes to see which ones it can recover, which shows how weak the underlying secrets are. Use it only on hashes from systems you own or have written permission to test, such as auditing your own application or an authorised engagement. It supports many hash types and both dictionary and brute-force modes.',
    developer: 'Jens Steube (atom) and the hashcat project',
    license: 'MIT',
    url: 'https://hashcat.net/hashcat/',
    bin: 'hashcat',
    install: 'pkg install hashcat',
    glyph: 'hash',
    commands: [
      { args: '-m 0 -a 0 hashes.txt wordlist.txt', what: 'test a list of MD5 digests against a wordlist to check how weak the secrets behind them are, on hashes you own or are authorised to audit' },
      { args: '-m 1000 -a 0 ntlm.txt wordlist.txt', what: 'run the same check against Windows NTLM hashes taken from a system you are allowed to test' },
      { args: '-m 0 -a 3 hashes.txt ?a?a?a?a', what: 'try every four-character combination, useful for short values that a wordlist would miss' },
      { args: '--show hashes.txt', what: 'print any digests already recovered in earlier runs alongside their plaintext' },
      { args: '-m 1800 -a 0 sha512.txt wordlist.txt', what: 'audit SHA-512 digests with a dictionary attack to gauge the strength of a policy' },
      { args: '-b', what: 'benchmark the device so you know how many candidates per second to expect' }
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
    tagline: 'Password audit suite with many hash formats',
    about: 'John the Ripper tests candidate values against stored hashes to find which ones it can recover, and ships with many format modules and rules. Use it only on hashes from systems you own or have written permission to test, such as checking that a password policy actually holds up. It offers wordlist, incremental and rule-based modes.',
    developer: 'Openwall',
    url: 'https://www.openwall.com/john/',
    bin: 'john',
    install: 'pkg install john',
    glyph: 'hash',
    commands: [
      { args: '--format=raw-md5 hashes.txt', what: 'audit a set of MD5 digests, on data you own or are authorised to test, to show how quickly weak values fall' },
      { args: '--wordlist=wordlist.txt hashes.txt', what: 'run a dictionary attack against a hash file to measure how strong the policy is' },
      { args: '--show hashes.txt', what: 'list the digests that were already recovered and their plaintext' },
      { args: '--incremental hashes.txt', what: 'try progressively longer combinations when a wordlist does not succeed' },
      { args: '--format=bcrypt shadow.txt', what: 'audit bcrypt entries taken from a system you are permitted to test' },
      { args: '--list=formats', what: 'print every hash format this build supports so you can pick the right one' }
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
    tagline: 'Test login services against candidate credentials',
    about: 'hydra tries lists of usernames and candidate values against a login service to see whether any are accepted, covering many protocols and web forms. Use it only against systems you own or have written permission to test, for example to confirm that a lockout policy or a rate limit actually works. It supports parallel tasks and can stop at the first success.',
    developer: "The Hacker's Choice (THC)",
    url: 'https://github.com/vanhauser-thc/thc-hydra',
    bin: 'hydra',
    install: 'pkg install hydra',
    glyph: 'bug',
    commands: [
      { args: '-l admin -P pass.txt ssh://192.168.1.10', what: 'test a list of candidates against one account on a server you own, to confirm a lockout policy really engages' },
      { args: '-L users.txt -P pass.txt ftp://192.168.1.10', what: 'check many accounts at once on a service you are authorised to audit' },
      { args: '-l admin -P pass.txt -t 4 192.168.1.10 http-post-form', what: 'exercise a login form on your own test application to see whether it resists guessing' },
      { args: '-l admin -P pass.txt -f -V ssh://192.168.1.10', what: 'stop at the first success and show every attempt, useful while tuning a rule set' },
      { args: '-L users.txt -P pass.txt -s 2222 ssh://192.168.1.10', what: 'run the check against a service listening on a non-standard port' }
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
    about: 'sqlmap probes request parameters for SQL injection flaws and can enumerate the databases behind a vulnerable endpoint once it finds one. Use it only on applications you own or have written permission to test, such as your own staging site before a release. It can replay a saved request so headers and cookies are sent exactly as captured.',
    developer: 'Bernardo Damele and Miroslav Stampar',
    url: 'https://sqlmap.org/',
    bin: 'sqlmap',
    install: 'pkg install sqlmap',
    glyph: 'bug',
    commands: [
      { args: '-u "https://example.com/item?id=1" --batch', what: 'probe a parameter for injection flaws on an application you own or are authorised to test, running unattended' },
      { args: '-u "https://example.com/item?id=1" --dbs', what: 'list the database names once an injectable parameter is found' },
      { args: '-r request.txt --batch', what: 'replay a saved HTTP request so headers and cookies are included exactly as captured' },
      { args: '--data="id=1" -u https://example.com/api', what: 'test a POST body parameter rather than a query string' },
      { args: '-u "https://example.com/item?id=1" --tables -D appdb', what: 'enumerate the tables in a specific database during an authorised assessment' },
      { args: '-u "https://example.com/item?id=1" --risk 3 --level 5', what: 'raise the number of payloads and tests, slower but more thorough' }
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
    about: 'nikto runs a series of checks against a web server and reports missing security headers, default files, outdated software banners and other common oversights. Use it only on sites you own or have written permission to test, such as a server you have just stood up. It can write findings to a report file for later review.',
    developer: 'Chris Sullo and David Lodge',
    url: 'https://github.com/sullo/nikto',
    bin: 'nikto',
    install: 'pkg install nikto',
    glyph: 'shield',
    commands: [
      { args: '-h https://example.com', what: 'run a baseline check on a site you own to catch missing headers and default files' },
      { args: '-h https://example.com -p 8080', what: 'point the check at a service on a non-standard port' },
      { args: '-h https://example.com -Tuning 123', what: 'limit the scan to specific test groups to keep a run short' },
      { args: '-h https://example.com -ssl', what: 'force TLS for a server that redirects oddly or serves both schemes' },
      { args: '-h https://example.com -o report.html -Format html', what: 'write the findings to a shareable HTML report' },
      { args: '-h https://example.com -id admin:secret', what: 'supply credentials so authenticated areas of your own site are checked too' }
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
    about: 'WireGuard is a virtual private network that builds an encrypted tunnel between peers using public keys, with a deliberately small and auditable code base. You would reach for it to route your traffic through a server you control or to link two networks together securely. The command-line tools in Termux let you generate keys and manage tunnels.',
    developer: 'Jason A. Donenfeld',
    license: 'GPL-2.0',
    url: 'https://www.wireguard.com/',
    bin: 'wg',
    install: 'pkg install wireguard-tools',
    glyph: 'shield',
    commands: [
      { args: 'genkey', what: 'create a fresh private key for a new peer' },
      { args: 'pubkey', what: 'derive the matching public key from a private one so it can be shared' },
      { args: 'show', what: 'list the active tunnels and their interfaces' },
      { args: 'show wg0', what: 'print the peers, endpoints and latest handshake for one tunnel' },
      { args: 'set wg0 peer aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789= allowed-ips 10.0.0.2/32', what: 'add a peer to a running tunnel and tell it which addresses belong to that peer' },
      { args: 'show wg0 transfer', what: 'show how many bytes have moved through the tunnel since it came up' }
    ],
    example: {
      args: 'show wg0',
      out: 'interface: wg0\n  public key: aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789=\n  listening port: 51820\npeer: eFgHiJkLmNoPqRsTuVwXyZ0123456789aBc=\n  endpoint: 203.0.113.5:51820\n  latest handshake: 12 seconds ago'
    }
  }
];
