import { fetchHomeTimeline } from 'twitter-api-ts';
import * as option from 'fp-ts/lib/Option';

const CONSUMER_KEY = '';
const CONSUMER_SECRET = '';
const TOKEN = '';
const TOKEN_SECRET = '';

fetchHomeTimeline({
    oAuth: {
        consumerKey: CONSUMER_KEY,
        consumerSecret: CONSUMER_SECRET,
        token: option.some(TOKEN),
        tokenSecret: option.some(TOKEN_SECRET),
    },
    query: {
        count: option.some(50),
    },
})
    // We use fp-ts’ Task type, which is lazy. Running the task returns a
    // promise.
    .run()
    .then(response => {
        console.log(response);
        // => Either<ErrorResponse, TwitterAPITimelineResponseT>
    });
