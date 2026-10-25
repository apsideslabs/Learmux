/**
 * Practice sets for the environment track: variables, packages, the shell
 * config, scripting, scheduling and archives.
 *
 * Each set follows one lesson and ends with a single output task. The tasks
 * ask for output that differs from one phone to another, so the rules describe
 * what a correct answer means rather than the exact characters: a variable
 * name, an absolute path, a timestamped log line, a folder name at the start
 * of every archive entry.
 */

import type { PracticeSet } from './types';

export const environmentSets: PracticeSet[] = [
  {
    slug: 'environment-and-variables',
    title: 'Environment variables',
    topic: 'environment-and-variables',
    summary: 'What the shell remembers, and how PATH decides which command runs.',
    intro:
      'Every Termux session starts with a fresh shell and a set of named values it keeps for you. These questions cover reading those values, setting your own, and the one that decides which program runs when you type a name.',
    questions: [
      {
        id: 'env-1',
        question: 'What does export do to a variable that a plain assignment does not?',
        options: [
          'It puts the variable into the environment, so the programs you launch inherit it',
          'It saves the variable to a file so it survives a reboot',
          'It prints the value of the variable to the screen',
          'It makes the variable read only',
        ],
        answer: 0,
        explanation:
          'A plain assignment such as project=notes creates a shell variable that only this shell can see. A child process, such as another bash, is started with a copy of the environment and knows nothing about your private shell variables. export marks the variable so it is copied into that environment. It writes nothing to disk, so the value still disappears when the session ends, and it does not make the variable permanent or read only.',
      },
      {
        id: 'env-2',
        question: 'PATH lists two folders and both contain a program called python. Which one runs when you type python?',
        options: [
          'The one in the folder that appears first in PATH',
          'The one in the folder that appears last in PATH',
          'The newest of the two',
          'Neither, because a command name has to be unique',
        ],
        answer: 0,
        explanation:
          'The shell walks PATH from left to right and stops at the first match, so the leftmost folder wins. That is why prepending a folder with export PATH="$HOME/bin:$PATH" makes your own copy of a program take priority, and why appending it with export PATH="$PATH:$HOME/bin" makes it a last resort instead. The shell never compares versions; it only looks at the position of the folder in the list.',
      },
      {
        id: 'env-3',
        question: 'You set a variable with project=notes, then run bash -c "echo $project" and nothing prints. Why?',
        options: [
          'The variable was not exported, so the child shell did not inherit it',
          'The child shell deleted the variable',
          'echo cannot print variables that were set in the same session',
          'The name project is reserved by bash',
        ],
        answer: 0,
        explanation:
          'The child shell is a new process, and a new process starts with the environment rather than with the private variables of the shell that launched it. Until you export project, it exists only in the shell that set it, so the child reads an empty value. Running export project and trying again makes the value appear, which is the whole difference between a shell variable and an environment variable.',
      },
      {
        id: 'env-4',
        question: 'What is the difference between echo "home is $HOME" and echo \'home is $HOME\'?',
        options: [
          'Double quotes expand the variable, single quotes print it literally',
          'Single quotes expand the variable, double quotes print it literally',
          'Both expand the variable, and the quotes only affect spacing',
          'Neither expands it, because the dollar sign needs escaping',
        ],
        answer: 0,
        explanation:
          'The shell expands $HOME inside double quotes, so the first command prints the path. Inside single quotes nothing is expanded, so the second prints the text home is $HOME exactly as written. That makes single quotes useful when you want a literal dollar sign, and it makes double quotes the safer habit around a variable that might hold a space.',
      },
    ],
    tasks: [
      {
        id: 'env-t1',
        title: 'Print the environment the shell gives you',
        prompt:
          'This lists every environment variable in the current session, in alphabetical order. Read the names as well as the values.',
        command: 'printenv | sort',
        hint: 'The list is long. Look for HOME, PATH, PREFIX and SHELL rather than reading every line.',
        expects:
          'A long list, one NAME=value pair per line, sorted so the names run from A to Z. The values differ from one phone to another, which is the point: your home directory, your search path and your locale are all personal to your device. Find HOME and PATH in the list and read them carefully, because those two decide where you land and which programs the shell can find by name.',
        rules: [
          { type: 'matches', pattern: '^\\s*HOME=', label: 'the home directory variable is present' },
          { type: 'matches', pattern: '^\\s*PATH=', label: 'the command search path is present' },
          { type: 'lines', min: 5, label: 'the whole environment is printed, not a single value' },
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
    slug: 'managing-packages',
    title: 'Managing packages',
    topic: 'managing-packages',
    summary: 'Refresh the index, install and remove packages, and find where Termux keeps them.',
    intro:
      'Termux ships with a package manager called pkg, and almost everything you add later arrives through it. These questions cover refreshing the index, installing and removing, and the private prefix where all of it lands.',
    questions: [
      {
        id: 'mp-1',
        question: 'What is the difference between pkg update and pkg upgrade?',
        options: [
          'update refreshes the list of available packages, and upgrade installs newer versions of what you have',
          'update installs newer versions, and upgrade refreshes the list',
          'update upgrades one package, and upgrade upgrades all of them',
          'They are two names for the same command',
        ],
        answer: 0,
        explanation:
          'update only refreshes the index: it fetches the current list of packages and versions and changes nothing you have installed. upgrade compares that index against your installed versions and installs the newer ones. Run update first, because upgrade reads the list it produces, and a stale list can name versions that have since been withdrawn.',
      },
      {
        id: 'mp-2',
        question: 'What does the $PREFIX variable point at in Termux?',
        options: [
          'The private directory where Termux installs its packages, such as /data/data/com.termux/files/usr',
          'Your home directory',
          'The root of the whole filesystem',
          'The folder where downloaded files are stored',
        ],
        answer: 0,
        explanation:
          'Termux does not install into the usual system directories, because an ordinary Android app cannot write there. Everything goes into a private prefix instead, and $PREFIX holds its path. List that directory and you see the familiar layout of a Linux install: bin for programs, etc for configuration, lib for shared libraries and var for caches and logs. Your home directory is a different variable, HOME.',
      },
      {
        id: 'mp-3',
        question: 'You run pkg list-installed and see a package you do not recognise. Why does the lesson treat that as worth investigating?',
        options: [
          'Someone who has gained a foothold often adds a package or replaces one, and the list is one of the quickest places to spot it',
          'It always means the package is out of date',
          'It means the package manager has been corrupted',
          'It means the device has been rooted',
        ],
        answer: 0,
        explanation:
          'The installed list is a short inventory of everything on the machine, so it is a natural thing to read now and then. A name you did not add is a question worth answering, because adding a small tool or swapping a common one is a quiet way to keep access. It is a prompt to look rather than proof of anything on its own, and the other answers describe things the list cannot tell you.',
      },
      {
        id: 'mp-4',
        question: 'Why run pkg update before installing something new?',
        options: [
          'An out-of-date index can point at versions that no longer exist, so the install fails partway through',
          'It removes the packages you no longer need first',
          'It installs the package and its dependencies for you',
          'It is required, and the install is refused without it',
        ],
        answer: 0,
        explanation:
          'The list of packages that ships with the app is a snapshot from whenever it was built, and packages come and go from the repository over time. If the index still names a version that has been withdrawn, the download fails after the dependencies have been worked out. Refreshing first costs a few seconds and avoids that failure. The command installs nothing itself, and the tool does not enforce it.',
      },
    ],
    tasks: [
      {
        id: 'mp-t1',
        title: 'Show the Termux prefix',
        prompt:
          'This prints the directory Termux installs into, then lists what is inside it. The listing is the standard layout of a Linux install.',
        command: 'echo $PREFIX; ls $PREFIX',
        hint: 'The first line is the path itself. The lines after it are the folders inside that path.',
        expects:
          'Two parts. The first line is an absolute path ending in usr, which is where Termux keeps everything it installs. The lines after it are the folders inside: bin for the programs you run, etc for configuration, lib for shared libraries, and others such as share and var. The exact set of folders differs a little between devices, depending on what is installed, so read the shape rather than expecting a fixed list.',
        rules: [
          { type: 'matches', pattern: '^\\s*/', label: 'the prefix is printed as an absolute path' },
          { type: 'contains', value: 'bin', label: 'the prefix holds the standard program directory' },
          { type: 'lines', min: 2, label: 'both the prefix and its contents are shown' },
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
    slug: 'shell-config-and-aliases',
    title: 'Shell config and aliases',
    topic: 'shell-config-and-aliases',
    summary: 'Your bashrc, short names for long commands, the prompt, and the search path.',
    intro:
      'The shell reads a startup file before it gives you a prompt. Editing that file is how you keep your aliases, your prompt and your PATH across sessions instead of retyping them every time.',
    questions: [
      {
        id: 'sc-1',
        question: 'What is ~/.bashrc, and when does it run?',
        options: [
          'A startup file that bash reads each time an interactive shell starts',
          'A log of every command you have typed',
          'A list of the packages you have installed',
          'The file that decides which user you log in as',
        ],
        answer: 0,
        explanation:
          'Each time you open Termux and get an interactive bash prompt, bash reads ~/.bashrc before showing it. Anything you put there runs on every new session, so a line added once keeps working. That is why an alias typed at the prompt lasts only until you close the shell, while the same line in the file lasts every session. It is not a history file and not a package list.',
      },
      {
        id: 'sc-2',
        question: 'You type alias ll=\'ls -l\' at the prompt. How long does it last?',
        options: [
          'Until you close this shell, unless you put the line in ~/.bashrc',
          'Forever, because aliases are written to disk',
          'For the one command you run next',
          'Until the next time you run pkg update',
        ],
        answer: 0,
        explanation:
          'An alias set at the prompt lives in that shell process and nowhere else, so closing the session discards it. To keep it, put the same line in ~/.bashrc and run source ~/.bashrc once, or simply open a new session. Setting an alias prints nothing when it works, which is why listing them with alias is the way to confirm it took.',
      },
      {
        id: 'sc-3',
        question: 'What does source ~/.bashrc do?',
        options: [
          'Reads the file into the current shell, so its changes take effect without opening a new one',
          'Prints the file so you can read it',
          'Deletes the file and writes a fresh default',
          'Copies the file into your home directory',
        ],
        answer: 0,
        explanation:
          'source runs the contents of the file in the shell you are already using, so any aliases, exports or prompt changes it sets apply at once. Without it you would have to close Termux and open it again to pick up an edit. It does not print the file, and it does not delete it; cat is the command for reading a file.',
      },
      {
        id: 'sc-4',
        question: 'What does export PATH="$HOME/bin:$PATH" change?',
        options: [
          'It puts your own bin folder at the front of the search path, so your programs win over the system ones',
          'It moves your bin folder to the end of the search path',
          'It empties the search path and replaces it with $HOME/bin',
          'It copies the system programs into your bin folder',
        ],
        answer: 0,
        explanation:
          'The shell searches PATH from left to right and runs the first match, so prepending $HOME/bin makes anything there take priority. Writing $PATH on the right keeps the existing folders, so nothing is lost: the value is not replaced, only reordered. Appending instead, with export PATH="$PATH:$HOME/bin", would make your folder the last resort rather than the first.',
      },
    ],
    tasks: [
      {
        id: 'sc-t1',
        title: 'Set an alias and show the search path',
        prompt:
          'This sets a short name for a long command, lists the aliases in the shell, then prints the folders the shell searches for commands.',
        command: "alias ll='ls -l'; alias; echo $PATH",
        hint: 'The alias line proves the alias exists. The line after it is one long string with colons in it.',
        expects:
          'The first line is the alias you set, shown as alias ll= followed by the command it stands for. Then a line listing any other aliases the shell already has. The last line is your PATH: several folder names joined by colons, searched from left to right. The exact folders are personal to your setup, so read the shape and the order rather than expecting particular paths.',
        rules: [
          { type: 'contains', value: 'alias ll=', label: 'the alias you set is listed' },
          { type: 'matches', pattern: '^\\s*/', label: 'the search path is printed as an absolute path' },
          { type: 'contains', value: 'bin', label: 'the search path includes the system program folders' },
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
    slug: 'shell-scripting-basics',
    title: 'Shell scripting basics',
    topic: 'shell-scripting-basics',
    summary: 'A shebang, variables, quoting, and reading the exit code of a run.',
    intro:
      'A script is the commands you keep retyping, written into a file once. These questions cover the shebang that starts it, the quoting that keeps values intact, and the exit code that tells you whether it worked.',
    questions: [
      {
        id: 'ss-1',
        question: 'What is the shebang, and what does a first line of #!/bin/sh do?',
        options: [
          'It names the program that should run the file, so the system knows it is a script',
          'It is a comment and has no effect on how the file runs',
          'It sets the file permissions to executable',
          'It prints a message when the script starts',
        ],
        answer: 0,
        explanation:
          'The first line of a script, beginning with #!, tells the system which interpreter to use when the file is run directly. Naming /bin/sh asks for a POSIX shell, which keeps the script portable, and that shell is present on Termux. The line does not make the file executable, which is a separate step with chmod, and although it looks like a comment it is read by the system before the shell starts.',
      },
      {
        id: 'ss-2',
        question: 'Why write "$name" rather than $name when the variable might hold a space?',
        options: [
          'An unquoted variable splits into separate words at each space, which breaks the command',
          'Quotes make the variable expand faster',
          'Quotes are needed only for variables that hold numbers',
          'An unquoted variable is deleted after it is read',
        ],
        answer: 0,
        explanation:
          'Without quotes the shell splits the value into words wherever it finds whitespace, so a name such as Study Cipher becomes two arguments instead of one. Double quotes keep it as a single value, which is almost always what you meant. The lesson\'s advice is to quote variables everywhere unless you have a specific reason to let the splitting happen.',
      },
      {
        id: 'ss-3',
        question: 'What does $? hold after a command finishes?',
        options: [
          'The exit code of the last command, where zero means success',
          'The name of the last command',
          'The output of the last command',
          'The number of commands run so far',
        ],
        answer: 0,
        explanation:
          'Every command finishes with an exit code, and $? reads the one from the command just run. Zero means it succeeded, and anything else means a problem, which is why a failing command such as cat on a missing file sets 1. Scripts and shells use these codes to decide whether to carry on, and a script that ends cleanly leaves zero behind.',
      },
      {
        id: 'ss-4',
        question: 'You have written hello.sh. Why does ./hello.sh fail with a permission error before you run chmod +x hello.sh?',
        options: [
          'A new file is not executable, and running it directly needs the execute permission',
          'The script must be in your home directory first',
          'The shebang line is missing',
          'The file must be renamed to remove the .sh suffix',
        ],
        answer: 0,
        explanation:
          'When you create a file it gets read and write permission but not execute, so the system refuses to run it as a program. chmod +x adds execute, after which ./hello.sh works. The location and the name do not matter, and the shebang is about which interpreter to use rather than whether the file may run at all.',
      },
    ],
    tasks: [
      {
        id: 'ss-t1',
        title: 'Run a script and read its exit code',
        prompt:
          'This writes a three-line script that stores today\'s date in a variable and prints it, makes the file executable, runs it, then prints the exit code of the run.',
        command: "printf '%s\\n' '#!/bin/sh' 'today=$(date +%F)' 'echo \"backup for $today\"' > ~/date.sh; chmod +x ~/date.sh; ~/date.sh; echo $?",
        hint: 'Two lines come back: the script output, then a single digit from the exit code.',
        expects:
          'The first line reads backup for followed by today\'s date in year-month-day form, which is what date +%F produces and what the script captured in its variable. The second line is the exit code of the run, and it should be 0, which means the script finished without error. If you see a message about permission denied instead, the chmod step did not run.',
        rules: [
          { type: 'matches', pattern: '^\\s*backup for \\d{4}-\\d{2}-\\d{2}', label: 'the script prints the date it ran' },
          { type: 'matches', pattern: '^\\s*0\\s*$', label: 'the script finished with a success code' },
          { type: 'lines', min: 2, label: 'the script output and its exit code are both shown' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|Permission denied',
            label: 'the script actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'scheduling-with-cron',
    title: 'Scheduling work with cron',
    topic: 'scheduling-with-cron',
    summary: 'Reading the five time fields, absolute paths, and logging what a job did.',
    intro:
      'Cron runs a command for you at the times you choose, so you stop having to remember. These questions cover the five fields of a cron line, the small environment a job runs in, and sending its output somewhere you can read it later.',
    questions: [
      {
        id: 'cr-1',
        question: 'What does the cron line 30 7 * * * /home/bin/backup.sh mean?',
        options: [
          'Run the script at 07:30 every day',
          'Run the script at 07:30 on the seventh day of each month',
          'Run the script thirty times a day',
          'Run the script every thirty minutes for seven hours',
        ],
        answer: 0,
        explanation:
          'The five fields are minute, hour, day of the month, month and day of the week, in that order. Here the minute is 30, the hour is 7, and the three stars mean every day of the month, every month and every day of the week. So it fires once a day at 07:30. The star is the part people misread: it means every value, not a literal seven.',
      },
      {
        id: 'cr-2',
        question: 'Why does a cron job need the full path to a script, such as /data/data/com.termux/files/home/bin/backup.sh?',
        options: [
          'Cron does not read your shell startup files and runs with a minimal PATH, so a bare name may not be found',
          'Cron runs as a different user with no home directory',
          'Cron deletes any file it cannot find',
          'Absolute paths run faster than relative ones',
        ],
        answer: 0,
        explanation:
          'A job runs in its own small environment, without the PATH your interactive shell builds from ~/.bashrc. A name such as backup.sh or python may be found when you type it yourself and not when cron runs it, which is the classic reason a job that works by hand fails on the timer. The fix is to name the full path, or to set PATH at the top of the script itself.',
      },
      {
        id: 'cr-3',
        question: 'In the line 30 7 * * * /home/bin/backup.sh >> /home/backup.log 2>&1, what do the two redirections do?',
        options: [
          '>> appends normal output to the log, and 2>&1 sends errors to the same place',
          '>> sends output to the screen, and 2>&1 saves it to the log',
          '>> overwrites the log each time, and 2>&1 discards the errors',
          '>> runs the job twice, and 2>&1 keeps only the second result',
        ],
        answer: 0,
        explanation:
          'A job in the background has no terminal to print to, so its output is mailed away or lost unless you redirect it. A single > would replace the log on every run, which is why the lesson uses >> to append instead. Errors go to file descriptor 2, and 2>&1 points that descriptor at the same file, so nothing slips past unrecorded.',
      },
      {
        id: 'cr-4',
        question: 'You have installed cron in Termux and written a correct crontab line. Why might the job still never fire?',
        options: [
          'Termux does not start cron by default, so the service has to be enabled first',
          'Cron runs jobs only while Termux is in the foreground',
          'The crontab file has to be marked executable',
          'Jobs run only after the phone is rebooted',
        ],
        answer: 0,
        explanation:
          'A correct crontab is not enough on its own, because the cron daemon has to be running before anything is scheduled. In Termux you install the cronie package and the service manager, then enable the daemon, which is why the lesson reaches for sv-enable crond before adding a job. The crontab file is read by cron rather than executed, so its permissions are not the issue.',
      },
    ],
    tasks: [
      {
        id: 'cr-t1',
        title: 'Log a job the way cron would',
        prompt:
          'This appends a timestamped line and a result line to a log, the way a scheduled job writes its output, then reads the log back with tail.',
        command:
          'echo "run at $(date +%H:%M)" >> ~/cron-test.log 2>&1; echo "finished ok" >> ~/cron-test.log 2>&1; tail -n 5 ~/cron-test.log',
        hint: 'You should see the two lines you just appended. Run it again and the log grows, because >> adds to the end rather than replacing it.',
        expects:
          'The lines you appended, ending with a run at line carrying a time and a finished ok line. Because the command appends rather than overwrites, running it more than once makes the log longer, and tail shows only the last five lines, which is the habit the lesson teaches for checking on a job. The exact time depends on when you ran it, so read the shape of the line rather than the digits.',
        rules: [
          { type: 'matches', pattern: '^\\s*run at \\d{2}:\\d{2}', label: 'the log records the time the job ran' },
          { type: 'contains', value: 'finished ok', label: 'the log records that the job completed' },
          { type: 'lines', min: 2, label: 'the log holds the entries the job appended' },
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
    slug: 'archives-and-compression',
    title: 'Archives and compression',
    topic: 'archives-and-compression',
    summary: 'Packing a folder with tar, listing it before you extract, and gzip on one file.',
    intro:
      'An archive turns a folder into a single file you can move or back up, and compression makes it smaller. These questions cover tar, gzip, and the listing you should always do before extracting anything you did not create.',
    questions: [
      {
        id: 'ac-1',
        question: 'In tar -czf project.tar.gz project, what do the letters c, z and f ask for?',
        options: [
          'c creates the archive, z compresses it with gzip, and f names the file to write',
          'c compresses, z creates, and f extracts',
          'c checks the archive, z lists it, and f finds it',
          'c copies, z zips each file, and f flattens the folders',
        ],
        answer: 0,
        explanation:
          'Each letter is one option. c tells tar to create a new archive, z pipes it through gzip so the result is compressed, and f says the next argument is the file name to write, which is why the name follows immediately. The .tar.gz ending records the same thing in the name: a tar archive that has then been gzipped.',
      },
      {
        id: 'ac-2',
        question: 'Why run tar -czf project.tar.gz project rather than tar -czf project.tar.gz project/*?',
        options: [
          'Naming the folder stores the folder itself, so extracting rebuilds project/ instead of scattering loose files',
          'The wildcard form is not valid syntax',
          'Naming the folder compresses better',
          'The wildcard form would delete the originals',
        ],
        answer: 0,
        explanation:
          'With project, every entry in the archive sits under project/, so extracting it recreates that folder and its contents. With project/*, the shell expands the pattern before tar sees it, so the archive holds a loose pile of files with nothing above them, and extracting drops them straight into your current directory. Neither form deletes anything, and the compression ratio is not the point.',
      },
      {
        id: 'ac-3',
        question: 'Why run tar -tzf on an archive before extracting one you did not create?',
        options: [
          'An archive can hold any path, including absolute paths or ../ entries that overwrite files you already have',
          'Listing an archive is required before tar will extract it',
          'Listing makes the archive smaller',
          'Extraction deletes the archive, so you have to check it first',
        ],
        answer: 0,
        explanation:
          'The -t flag lists the entries without unpacking anything, so you can read the paths before they touch your disk. That matters because an archive is just a stream of names and contents, and a hostile one can name a path outside the folder you meant to extract into, replacing a file you trust. If you see an absolute path or one starting with ../, stop. Extracting into a fresh empty folder limits the damage either way.',
      },
      {
        id: 'ac-4',
        question: 'What does gzip a.txt leave behind?',
        options: [
          'A file called a.txt.gz, with the original a.txt replaced',
          'Both a.txt and a.txt.gz',
          'A folder called a.txt holding the compressed data',
          'Nothing, until you name an output file',
        ],
        answer: 0,
        explanation:
          'gzip compresses the file in place: the original is replaced by a compressed copy that ends in .gz, so a.txt is gone and a.txt.gz remains. To bring it back, gunzip a.txt.gz restores the original. This is also why gzip is paired with tar, since gzip handles one file at a time, so a folder is packed into a single file first and that file is then compressed.',
      },
    ],
    tasks: [
      {
        id: 'ac-t1',
        title: 'Pack a folder and list it back',
        prompt:
          'This builds a small folder, packs it into a compressed tar archive, then lists the archive contents without extracting anything.',
        command:
          'mkdir -p ~/project/notes; echo alpha > ~/project/a.txt; echo beta > ~/project/notes/c.txt; tar -czf ~/project.tar.gz -C ~ project; tar -tzf ~/project.tar.gz',
        hint: 'Look at the start of every line in the listing, not just the file names.',
        expects:
          'A listing of the archive contents, one entry per line, with the folder and the files it holds. Every line begins with project/, which means the folder itself was stored, so extracting the archive will rebuild project/ rather than scatter the files into whatever directory you are in. The nested notes/c.txt should appear too, which shows that tar walked the whole tree.',
        rules: [
          { type: 'matches', pattern: '^\\s*project/', label: 'the archive stores the folder itself, so extraction rebuilds it' },
          { type: 'contains', value: 'a.txt', label: 'a file you packed is listed' },
          { type: 'lines', min: 3, label: 'every packed entry is listed, including the nested one' },
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
