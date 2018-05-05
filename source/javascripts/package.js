// Importing the /bin/ version doesn't work due to internal use of `require`
import 'termly.js/dist/termly-prompt.min';

new TermlyPrompt('#terminal', {
  commands: {
    klcodeclub: {
      name: 'klcodeclub',
      man: 'The first rule of Code Club is: You must commit code.',
      fn: function klcodeclub(ARGV) {
        if (ARGV.n || ARGV['next']) {
          return nextEvent();
        } else if (ARGV.p || ARGV['past']) {
          return pastEvent();
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

function nextEvent() {
  // Get next event info

  return `Follow along at https://klcodeclub.peatix.com/`;
}

function pastEvent() {
  // Get past event info

  return `Follow along at https://klcodeclub.peatix.com/`;
}

function helpInfo() {
  return `The first rule of Code Club is: You must commit code.
The second rule of Code Club is: You must commit code!

Usage: klcodeclub [options]

-h, --help                Make helpful text appear.

-n, --next                Info about the next event.

-p, --past[=YYYY-MM-DD]   Get a list of past events. If passed a date, output
                          details about that specific event.
`;
}
