// Importing the /bin/ version doesn't work due to internal use of `require`
import 'termly.js/dist/termly-prompt.min';

const terminal = new TermlyPrompt('#terminal', {
  env: {
    USER: 'visitor',
    HOSTNAME: 'klcc'
  }
});
