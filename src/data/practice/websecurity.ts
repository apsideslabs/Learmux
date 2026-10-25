/**
 * Practice sets for the web and application security track.
 *
 * Each set follows one lesson. The multiple-choice questions check that the
 * idea behind the bug has landed, and the single output task asks for a
 * command whose output proves the fix rather than the exploit. The rules
 * describe what a correct answer means, not what it looks like, so a paste
 * from any phone is judged on its meaning.
 */

import type { PracticeSet } from './types';

export const webSecuritySets: PracticeSet[] = [
  {
    slug: 'how-a-web-request-works',
    title: 'How a web request is handled',
    topic: 'how-a-web-request-works',
    summary: 'Reading a request end to end, and closing the path traversal it can carry.',
    intro:
      'A request is text, and every character in it came from the client. This set checks that you can read a request line, and that you can confine the path it carries to the directory the server meant to serve.',
    questions: [
      {
        id: 'req-1',
        question: 'In the request line GET /hello HTTP/1.1, what is /hello?',
        options: [
          'The path the client is asking for',
          'The method the client used',
          'The version of the protocol',
          'A header the client added',
        ],
        answer: 0,
        explanation:
          'A request line is three tokens: the method, the path and the version. GET is the method, HTTP/1.1 is the version, and /hello is the path, which is the part a file server most often turns into a file name. Every one of those three tokens is chosen by the client, which is why none of them can be trusted on its own.',
      },
      {
        id: 'req-2',
        question: 'Why is curl --path-as-is needed to demonstrate a path traversal?',
        options: [
          'Without it, curl removes the .. segments before sending the request',
          'Without it, curl sends the path as an encrypted value',
          'Without it, the server refuses every request',
          'Without it, curl sends a HEAD request instead of a GET',
        ],
        answer: 0,
        explanation:
          'curl tidies a path by default, so a request for /../secret.txt becomes /secret.txt before it leaves the phone and the traversal never reaches the server. The --path-as-is option turns that tidy-up off, so the server sees exactly the path you typed. A real attacker would not use curl, but for a test on your own server you want the raw path to arrive intact.',
      },
      {
        id: 'req-3',
        question: 'The flawed server returned 404 for /%2e%2e/secret.txt but 200 for /../secret.txt. Why?',
        options: [
          'The server uses the path as it arrived, and %2e%2e is not a directory name',
          'The file did not exist under that name',
          'http.server blocks the encoded form but not the plain one',
          'The encoded request was too long to read',
        ],
        answer: 0,
        explanation:
          'The handler joins the path onto the root and opens the result. It never decodes percent escapes, so %2e%2e stays as the literal text percent two e percent two e, which is not the parent directory. The plain .. is a real directory name, so it works. This is exactly why a blocklist of .. is fragile: the attacker only has to find a spelling the blocklist forgot.',
      },
      {
        id: 'req-4',
        question: 'Why does os.path.realpath make the path check reliable?',
        options: [
          'It resolves .. and symbolic links to the true file, so the check runs on the real target',
          'It removes every slash from the path',
          'It converts the path to lowercase so case cannot be used to escape',
          'It makes the path read only',
        ],
        answer: 0,
        explanation:
          'realpath follows every .. segment and every symbolic link and returns the file that would actually be opened. Comparing that resolved path against the root catches traversal however it was written, because the comparison happens after all the indirection has been removed. Checking the raw text instead means you are guessing at every spelling an attacker might use.',
      },
    ],
    tasks: [
      {
        id: 'req-t1',
        title: 'Show a path escaping its root, and the check that stops it',
        prompt:
          'This writes a small web root with a public file, then a secret file just outside it. It joins the request /../secret.txt onto the root the way the flawed server does, prints what the join points at, then resolves the path and asks whether it is still inside the root. Run it and paste what comes back.',
        command:
          `mkdir -p /tmp/wr; echo public > /tmp/wr/index.txt; echo secret > /tmp/secret.txt; python3 -c "import os; root='/tmp/wr'; path=os.path.join(root,'../secret.txt'); print('served:', open(path).read().strip()); fixed=os.path.realpath(path); print('fixed path:', fixed); print('allowed :', fixed.startswith(root))"`,
        hint: 'Three lines should come back. The first shows what the flawed join served, and the last is a yes or no answer.',
        expects:
          'Three lines. The first reads served: secret, which shows the flawed join walked out of the web root and read a file that was never meant to be served. The second prints the resolved path, which is outside /tmp/wr. The third reads allowed : False, which is the confinement check refusing it. Together they show the bug and the fix in one run: the plain join escapes, and the resolved-path check catches it.',
        rules: [
          { type: 'matches', pattern: '^\\s*served\\s*:\\s*secret', label: 'the flawed join served a file outside the root' },
          { type: 'matches', pattern: '^\\s*fixed path\\s*:\\s*/tmp/secret\\.txt', label: 'the resolved path is shown outside the root' },
          { type: 'matches', pattern: '^\\s*allowed\\s*:\\s*False', label: 'the confinement check refuses the path' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'untrusted-input',
    title: 'Input you do not control',
    topic: 'untrusted-input',
    summary: 'Why every request value is hostile until checked, and how an allowlist beats a blocklist.',
    intro:
      'A value from the query string is text until you make it something else, and it can be any text at all. This set checks that you know why a blocklist loses to an allowlist, and that you can write the check that keeps a value inside the shape you meant.',
    questions: [
      {
        id: 'inp-1',
        question: 'Why does a value from the query string need checking before it is used?',
        options: [
          'It is text the client wrote, and it can be any text at all',
          'It is always a number, but sometimes negative',
          'It arrives already encrypted and must be decoded',
          'It is limited to letters by the URL format',
        ],
        answer: 0,
        explanation:
          'The query string is just text the client composed. It can hold a number, a word, an empty value, or something far longer and stranger than you imagined. The server has no way to tell a value the client meant well from one it did not, so the only safe rule is to check every value against the shape you expect before you use it for anything.',
      },
      {
        id: 'inp-2',
        question: 'Why does an allowlist beat a blocklist for validating input?',
        options: [
          'An allowlist names what is permitted, so anything else fails, while a blocklist must predict every hostile shape',
          'An allowlist is faster to run',
          'A blocklist cannot handle numbers',
          'An allowlist works only on files, a blocklist only on queries',
        ],
        answer: 0,
        explanation:
          'A blocklist has to name every dangerous shape in advance, and the attacker only has to find one you missed, such as %2e%2e in place of ... An allowlist turns that around: you name what is allowed, and everything that does not match is refused by default. New spellings of old attacks fail automatically because they were never on the list.',
      },
      {
        id: 'inp-3',
        question: 'What does re.fullmatch(r"[0-9]{1,3}", n) reject that a length check alone would allow?',
        options: [
          'It rejects anything that is not one to three digits, so letters and symbols fail even at the right length',
          'It rejects numbers larger than three',
          'It rejects lowercase letters but not uppercase',
          'It rejects empty values only',
        ],
        answer: 0,
        explanation:
          'fullmatch requires the whole value to fit the pattern, so a value of abc is refused even though it is short. A length check on its own would happily accept abc, 1x2 and -99, because they are all short. Combining the two ideas, a shape and a bound, is what makes the check worth having.',
      },
      {
        id: 'inp-4',
        question: 'Why does the fixed server answer a bad value with 400 rather than 500?',
        options: [
          'A 400 says the request was wrong, which is honest, and it does not reveal anything about the server',
          'A 400 is faster to send than a 500',
          'A 500 is only used for missing pages',
          'A 400 hides the fact that the server exists',
        ],
        answer: 0,
        explanation:
          'A 4xx code says the request had a problem, and a 5xx code says the server did. Bad input is the client side, so 400 is the accurate answer. It also keeps the reply boring: no traceback, no file names, and no hint about how the server is built, which is the opposite of what the crashing version leaked.',
      },
    ],
    tasks: [
      {
        id: 'inp-t1',
        title: 'Let an allowlist refuse the hostile filenames',
        prompt:
          'This feeds five filenames through a single allowlist: the first character must be a letter or a digit, and the rest may be letters, digits, dots, dashes or underscores. Run it and paste the filenames that survive.',
        command:
          `printf '%s\\n' 'report.pdf' '../secret' 'a%2e%2e' 'notes.txt' '..' | grep -E '^[A-Za-z0-9][A-Za-z0-9_.-]*$'`,
        hint: 'Two filenames should come back, and neither of them is a traversal attempt.',
        expects:
          'Two lines, report.pdf and notes.txt. Everything else was refused. The plain ../secret and the bare .. were dropped, and so was the encoded a%2e%2e. The pattern allows dots after the first character, but it insists the first character is a letter or a digit, so a name that begins with a dot cannot pass. That single detail is what stops .. walking through an allowlist that looked reasonable at a glance.',
        rules: [
          { type: 'matches', pattern: '^\\s*report\\.pdf\\s*$', label: 'a plain filename passes' },
          { type: 'matches', pattern: '^\\s*notes\\.txt\\s*$', label: 'a second plain filename passes' },
          { type: 'absent', pattern: 'secret|%2e', label: 'the traversal attempts were refused' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'injection',
    title: 'Injection: when data becomes code',
    topic: 'injection',
    summary: 'How a value crosses into a shell command or a query, and the two fixes that stop it.',
    intro:
      'Injection is a value being read as code by something that runs code. This set checks that you can spot where the crossing happens, and that you know an argument list and a query parameter keep a value a value.',
    questions: [
      {
        id: 'inj-1',
        question: 'What turns a name value into a command in the greeting server?',
        options: [
          'The value is joined into a string that is handed to a shell with shell=True',
          'The value is longer than the server expected',
          'The value is sent as a POST body',
          'The value contains a space',
        ],
        answer: 0,
        explanation:
          'The server builds one string, "echo hello " plus the name, and gives it to a shell to run. The shell does not see a name; it sees a command line and obeys every mark in it, so a semicolon starts a second command. The crossing happens the moment the value is concatenated into the command text.',
      },
      {
        id: 'inj-2',
        question: 'Why does subprocess.run(["echo", "hello", name], shell=False) stop the injection?',
        options: [
          'There is no shell to read the marks, so the whole value stays one argument',
          'It escapes the value before passing it',
          'It runs the command in a sandbox with no permissions',
          'It refuses to run if the value contains a semicolon',
        ],
        answer: 0,
        explanation:
          'With shell=False and a list, Python runs echo directly and hands it the arguments as written. No shell is involved, so a semicolon is an ordinary character inside an argument and is printed rather than obeyed. Nothing is escaped and nothing is guessed: the value is passed as data because that is the only thing it can be.',
      },
      {
        id: 'inj-3',
        question: 'What does the ? in "... where name = ?" do in a parameterised query?',
        options: [
          'It marks the value as data, so it is never parsed as part of the query',
          'It matches any single character, like a wildcard',
          'It makes the query run faster',
          'It removes the value from the result set',
        ],
        answer: 0,
        explanation:
          'The question mark is a placeholder. The driver sends the query text and the value separately, and the database treats the value as data, not as query text. A value such as ada OR 1=1 is then compared as a literal string and matches nothing. In the pasted version the same value closed the quote and added a condition, because it was read as code.',
      },
      {
        id: 'inj-4',
        question: 'Why does percent-encoding a semicolon not defeat the injection?',
        options: [
          'The value is decoded before it reaches the shell, so the semicolon is back by the time it matters',
          'The shell cannot read encoded characters',
          'Percent-encoding is only for spaces',
          'It does defeat the injection, and that is the fix',
        ],
        answer: 0,
        explanation:
          'Encoding is a way to carry a character through a channel that would otherwise mangle it, and the server decodes it on arrival. By the time the value is concatenated into the command, the semicolon is a plain semicolon again. Encoding changes the form of a value in transit; it does not change what the value means once it has arrived.',
      },
    ],
    tasks: [
      {
        id: 'inj-t1',
        title: 'Pass a hostile value as an argument and watch it stay inert',
        prompt:
          'This runs the fixed greeting, which passes the name as an argument to a program rather than to a shell. The name here contains a semicolon and a second command. Run it and paste what comes back.',
        command:
          `python3 -c "import subprocess; name='world; id'; out=subprocess.run(['echo','hello',name],shell=False,capture_output=True,text=True).stdout; print(out,end=''); print('lines:',len(out.strip().split(chr(10))))"`,
        hint: 'Two lines should come back: the greeting with the value printed whole, then a line count.',
        expects:
          'Two lines. The first is hello world; id, with the whole value printed as one piece of text, semicolon and all. The second reads lines: 1, because echo produced a single line. Nothing ran the id command, so no identity output appears. That is the fix in action: the value is data, the shell is out of the picture, and the marks inside the value mean nothing.',
        rules: [
          { type: 'contains', value: 'hello world; id', label: 'the whole value went in as one argument' },
          { type: 'matches', pattern: '^\\s*lines\\s*:\\s*1\\s*$', label: 'only one line came out, so nothing ran' },
          { type: 'absent', pattern: 'uid=', label: 'no identity output leaked, so the injected command did not run' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'cross-site-scripting',
    title: 'Cross-site scripting',
    topic: 'cross-site-scripting',
    summary: 'A value crossing into a browser as markup, and the escaping that keeps it text.',
    intro:
      'When a value the client sent is placed into a page without escaping, the browser reads it as markup, and markup can carry a script. This set checks that you know why escaping is the fix, and why a header is a second line of defence.',
    questions: [
      {
        id: 'xss-1',
        question: 'What makes a reflected value become a script in the browser?',
        options: [
          'It is placed into the page as markup, so the browser reads a tag rather than showing text',
          'It is sent over an unencrypted connection',
          'It is longer than the page can display',
          'It is stored in a cookie',
        ],
        answer: 0,
        explanation:
          'A browser reads the response as HTML, so anything that looks like a tag is treated as one. A value such as a script tag therefore becomes a script element and its contents run, in the site origin, with the site cookies. The value was never meant to be markup; it became markup because the server put it in the page without escaping it.',
      },
      {
        id: 'xss-2',
        question: 'What does html.escape(q) change about the value?',
        options: [
          'It turns the characters that matter in HTML into safe forms, so the value shows as text',
          'It removes the value from the page entirely',
          'It encrypts the value so the browser cannot read it',
          'It shortens the value to a safe length',
        ],
        answer: 0,
        explanation:
          'html.escape replaces the characters that HTML treats as markup, so a less than sign becomes &lt; and a greater than sign becomes &gt;. The browser then renders the value as visible text, because that is what it now is. The value is not removed or hidden; it is shown, safely, exactly as the user typed it.',
      },
      {
        id: 'xss-3',
        question: 'Why can curl show the bug without running the payload?',
        options: [
          'curl prints the response body as text and runs nothing, so a raw tag in the body is the evidence',
          'curl blocks scripts for you',
          'curl renders the page and reports any script it finds',
          'curl only works on pages with no scripts',
        ],
        answer: 0,
        explanation:
          'curl is not a browser. It asks for the response and prints the bytes, so when the raw script tag appears in the body you are reading the exact thing a browser would execute. That is why the response body is the proof: the browser would turn that tag into running code, and curl lets you see it before that happens.',
      },
      {
        id: 'xss-4',
        question: 'What does Content-Security-Policy: default-src none add?',
        options: [
          'It tells the browser to run no script and load no resource for the page, as a second line of defence',
          'It escapes the output automatically',
          'It blocks the request before it reaches the server',
          'It stores the value in a safe place',
        ],
        answer: 0,
        explanation:
          'A content security policy is a set of rules the browser enforces about what the page may load and run. default-src none says nothing at all is allowed, so even a value that slipped through the escaping would have no script to run. It is a second line of defence, not a replacement for escaping the output.',
      },
    ],
    tasks: [
      {
        id: 'xss-t1',
        title: 'Show a payload reflected raw, then escaped',
        prompt:
          'This builds a page fragment twice, once with the value placed in as-is and once with the same value escaped. The value is a script tag. Run it and paste both lines.',
        command:
          `python3 -c "import html; q='<script>alert(1)</script>'; print('raw  :', '<p>'+q+'</p>'); print('safe :', '<p>'+html.escape(q)+'</p>')"`,
        hint: 'Two lines should come back. One still contains a live script tag, and one does not.',
        expects:
          'Two lines. The raw line holds a live script tag inside a paragraph, which a browser would run. The safe line holds the same value with its angle brackets turned into &lt; and &gt;, so it shows as text and runs nothing. Comparing the two lines is the whole lesson: the value is the same, and only the escaping differs.',
        rules: [
          { type: 'matches', pattern: '^\\s*raw\\s*:.*<script>', label: 'the raw line contains a live script tag' },
          { type: 'contains', value: '&lt;script&gt;', label: 'the escaped line replaces the angle brackets' },
          { type: 'absent', pattern: '^\\s*safe\\s*:.*<script', label: 'the escaped line has no live script tag' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'access-control-and-misconfiguration',
    title: 'Broken access control and misconfiguration',
    topic: 'access-control-and-misconfiguration',
    summary: 'Records handed to the wrong caller, and the checks that deny by default.',
    intro:
      'Access control is the decision about who may do what, and it breaks when the server trusts the request or forgets to check at all. This set checks that you can spot a missing check and know what a check that denies by default looks like.',
    questions: [
      {
        id: 'acl-1',
        question: 'What is an insecure direct object reference?',
        options: [
          'The server names a record by a value the client controls and never checks whether the caller may see it',
          'The client stores the record in a cookie it can edit',
          'The record is sent over an unencrypted connection',
          'The record is stored in a file with the wrong permissions',
        ],
        answer: 0,
        explanation:
          'The id in the URL is the object reference, and the client controls it. If the server looks up that id and returns the record without asking whether the caller is allowed to see it, then changing one number is enough to read someone else data. The flaw is not the id being in the URL; it is the missing check behind it.',
      },
      {
        id: 'acl-2',
        question: 'Why is hiding the link to the admin area not access control?',
        options: [
          'If the server will answer the request, the resource is reachable, whatever the page shows',
          'Links are always visible in the page source anyway',
          'The admin area needs a password field to be secure',
          'Hiding the link slows the page down',
        ],
        answer: 0,
        explanation:
          'The page is not the gate; the server is. A client can send any request it likes, with or without a link to follow, so if the server answers /admin without a check then the area is public. Hiding a link only removes the hint, and a hint is not a control. The check has to live on the server, on every path that needs it.',
      },
      {
        id: 'acl-3',
        question: 'Why is a traceback in a response a finding?',
        options: [
          'It names the file, the line and the variable, which is a map of the server for anyone who asks',
          'It makes the response larger and slower',
          'It proves the server has no password',
          'It stops the server answering other requests',
        ],
        answer: 0,
        explanation:
          'A traceback is written for a developer, so it gives away the file name, the line number and the values in play. To an attacker that is a guide to how the server is built and where to push next. The fix is to log the detail where you can read it and return a plain message to the client, such as a 404 with no extra words.',
      },
      {
        id: 'acl-4',
        question: 'What does a check that denies by default look like?',
        options: [
          'The check runs first and refuses anything unexpected, then the answer runs only for the case you meant',
          'The answer runs first, and a check cleans up afterwards',
          'The check runs only on the admin path',
          'The check trusts a header the client sends',
        ],
        answer: 0,
        explanation:
          'Deny by default means the safe answer is the one you get when nothing matches. The check comes first, and only the case you deliberately allowed reaches the answer. If the answer ran first and a check tidied up afterwards, every new path would be open until someone remembered to add a check, which is how missing checks creep in.',
      },
    ],
    tasks: [
      {
        id: 'acl-t1',
        title: 'Hand a record to the wrong caller, then refuse it',
        prompt:
          'This models one request: caller 1 asks for record 2, which belongs to someone else. It prints the request, what the flawed code returns, and what a check that denies by default returns. Run it and paste all three lines.',
        command:
          `python3 -c "users={'1':'ada','2':'grace'}; caller='1'; role='user'; target='2'; print('caller', caller, 'asks for record', target); print('flawed :', 'returns '+users[target]); print('fixed  :', users[target] if (role=='admin' or caller==target) else '403 forbidden')"`,
        hint: 'Three lines should come back: the request, a record handed over, and a refusal.',
        expects:
          'Three lines. The first names the caller and the record, and they do not match. The flawed line returns grace, which is another user record handed over with no check. The fixed line reads 403 forbidden, because the caller is not the owner and is not an admin, so the check refuses. The same request produces a leak in one version and a refusal in the other, and the only difference is the check.',
        rules: [
          { type: 'matches', pattern: '^\\s*flawed\\s*:\\s*returns\\s+grace', label: 'the flawed code handed over another user record' },
          { type: 'matches', pattern: '^\\s*fixed\\s*:\\s*403\\s+forbidden', label: 'the fixed check refuses the request' },
          { type: 'matches', pattern: '^\\s*caller\\s+1\\s+asks\\s+for\\s+record\\s+2', label: 'the request names a caller and a record that is not theirs' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the command actually ran' },
        ],
      },
    ],
  },
];
