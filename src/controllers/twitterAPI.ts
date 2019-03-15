import { fetchHomeTimeline } from 'twitter-api-ts';
import * as option from 'fp-ts/lib/Option';

const CONSUMER_KEY = '49mP76jXOA54FTKvkytF1wTqe';
const CONSUMER_SECRET = 'K0PcJaE6D47QrwcwUHb2GpzSdnxfQPXCZDcn4yepO0aPGYV21s';
const TOKEN = '13948572-OupVqd0PrEreEJEq2qhz176pyZkQPxDeJpcaeE5hm';
const TOKEN_SECRET = '1cLeVydAWzeKHR2gAIHKc2ksflCWYNF39WxckotGFwHE7';

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