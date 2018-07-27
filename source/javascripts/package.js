// Importing the /bin/ version doesn't work, possibly due to `require`
// collision with brunch?
import 'termly.js/dist/termly-prompt.min';
import {listSingleEvent, listEvents, nextEvent, previousEvent, openIssues} from './commands';

const terminal = new TermlyPrompt('#terminal', {
  commands: {
    klcodeclub: {
      name: 'klcodeclub',
      man: 'The first rule of Code Club is: You must commit code.',
      fn: function klcodeclub(ARGV) {
        if (ARGV.l || ARGV.list) {
          const arg = ARGV.l || ARGV.list;
          if (arg !== true) {
            return listSingleEvent(arg);
          }
          return listEvents();

        } else if (ARGV.n || ARGV.next) {
          return nextEvent();

        } else if (ARGV.p || ARGV.previous) {
          return previousEvent();

        } else if (ARGV.i || ARGV.issues) {
          return openIssues();

        } else {
          return helpInfo();
        }
      }
    }
  },
  env: {
    USER: 'visitor',
    HOSTNAME: 'klcc'
  }
});

terminal.container.addEventListener('keydown', tabCompletion);
document.addEventListener('click', refocus);

function helpInfo() {
  return `The first rule of Code Club is: You must commit code.
The second rule of Code Club is: You must commit code!

Usage: klcodeclub [options]

-h, --help                Make helpful text appear.

-l, --list[=YYYY-MM-DD]   List all events. Pass a date to get info about a
                          specific event.

-n, --next                Get info about the next event.

-n, --previous            Get info about the previous event.

-i, --issues              Make a bug report / feature request on Github.
`;
}

function tabCompletion(e) {
  if (e.keyCode === 9) {
    e.preventDefault();

    const input = terminal.container.querySelector('.current .terminal-input');
    const search = input.value;
    const commands = Object.keys(terminal.ShellCommands)
      .filter(c => c.indexOf(search) === 0);

    // TODO Cycle through options
    if (commands.length) {
      input.value = commands[0];
      input.focus();
    }
  }
}

function refocus() {
  const input = terminal.container.querySelector('.current .terminal-input');
  input.focus();
}
