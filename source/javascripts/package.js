// Importing the /bin/ version doesn't work, possibly due to `require`
// collision with brunch?
import 'termly.js/dist/termly-prompt.min';
import {listSingleEvent, listEvents, nextEvent, previousEvent, openIssues} from './commands';

new TermlyPrompt('#terminal', {
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
