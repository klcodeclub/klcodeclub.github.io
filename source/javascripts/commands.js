import events from './events.js';

const now = new Date();
const month = ('0' + (now.getMonth() + 1)).slice(-2);
const day = ('0' + now.getDate()).slice(-2);
const today = `${now.getFullYear()}-${month}-${day}`;

export function listSingleEvent(date) {
  if (!/20[0-9]{2}-(10|11|12|0[0-9])-(0[1-9]|[12]\d|3[01])/.test(date)) {
    return `${date} is not a valid date (YYYY-MM-DD). Try again?`;

  } else if (!events[date]) {
    return `No event found for ${date}. Try again?`;

  } else {
    const event = events[date];
    const output = [];
    output.push(`KL Code Club v${event.version} | ${date}`);

    if (today > date) {
      output[0] += ' (past)';
      output.push(`View details:\n${event.url}`);
    } else {
      if (today === date) {
        output[0] += ' (today)';
      }
      output.push(`Register to attend:\n${event.url}`);
    }

    // Divider
    output[0] += "\n-" + Array(output[0].length).join('-');

    return output.join("\n\n");
  }
}

export function listEvents() {
  const dates = Object.keys(events)
    .sort((a, b) => b < a ? -1 : 1);

  return dates.map(listSingleEvent).join("\n\n");
}

export function nextEvent() {
  const dates = Object.keys(events)
    .filter(date => date >= today)
    .sort((a, b) => b > a ? -1 : 1);

  if (dates.length) {
    return listSingleEvent(dates[0]);
  } else {
    return 'Next event has yet to be scheduled. Stay tuned!';
  }
}

export function previousEvent() {
  const dates = Object.keys(events)
    .filter(date => date < today)
    .sort((a, b) => b < a ? -1 : 1);

  if (dates.length) {
    return listSingleEvent(dates[0]);
  }
}

export function openIssues() {
  const win = window.open('https://github.com/klcodeclub/klcodeclub.github.io/issues', '_blank');
  if (win) {
    win.focus();
    return 'Opened issue log in new tab.';
  } else {
    return 'Could not open issue log. Please file an issue. ;)';
  }
}
