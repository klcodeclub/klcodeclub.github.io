// Importing the /bin/ version doesn't work, probably due to `require` collision
import 'termly.js/dist/termly-prompt.min';
import events from './events.js';

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

function listSingleEvent(date) {
  if (!/20[0-9]{2}-(10|11|12|0[0-9])-(0[1-9]|[12]\d|3[01])/.test(date)) {
    return `${date} is not a valid date (YYYY-MM-DD). Try again?`;

  } else if (!events[date]) {
    return `No event found for ${date}. Try again?`;

  } else {
    const event = events[date];
    const output = [];
    output.push(`KL Code Club v${event.version} | ${date}`);

    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const today = `${now.getFullYear()}-${month}-${day}`;
    if (today > date) output[0] += ' (past)';

    if (event.register) {
      output.push(`RSVP at: <${event.register}>`);
    }

    if (event.base) {
      return fetch(`/.netlify/functions/get-event?base=${event.base}`)
        .then(response => response.json())
        .then(attendees => {
          const list = attendees.map(a => `${[a.Github]}\n${a.Project}`);
          list.unshift('ATTENDEES:');
          output.push(list.join("\n\n"));
          return output.join("\n\n");
        });
    }

    return output.join("\n\n");
  }
}

function listEvents() {
  return events;
}

function nextEvent() {
  const dates = Object.keys(events)
    .filter(key => !!events[key].register)
    .sort((a, b) => b > a ? -1 : 1);

  if (!dates.length) {
    return 'Next event has yet to be scheduled. Stay tuned!';
  } else {
    return listSingleEvent(dates[0]);
  }
}

function previousEvent() {
  const dates = Object.keys(events)
    .filter(key => !events[key].register)
    .sort((a, b) => b > a ? -1 : 1);

  if (!dates.length) {
    return 'Next event has yet to be scheduled. Stay tuned!';
  } else {
    return listSingleEvent(dates[dates.length - 1]);
  }
}

function helpInfo() {
  return `The first rule of Code Club is: You must commit code.
The second rule of Code Club is: You must commit code!

Usage: klcodeclub [options]

-h, --help                Make helpful text appear.

-l, --list[=YYYY-MM-DD]   List all events. Pass a date to get info about a
                          specific event.

-n, --next                Get info about the next event.

-n, --previous            Get info about the previous event.
`;
}
