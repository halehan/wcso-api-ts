export class Constants {
   // static readonly DATE_FMT = 'dd/MMM/yyyy';
    static readonly DATE_FMT = 'MMM-dd-yyyy';
    static readonly DATE_TIME_FMT = `${Constants.DATE_FMT} hh:mm:ss a`;

    static readonly SERVER_URL = 'https://wcso-api-ts.herokuapp.com/';

    static readonly FACEBOOK_VERIFY_TOKEN = 'halehan';
    // static readonly FACEBOOK_PAGE_VERIFY_TOKEN = 'EAAHuAlckN1IBAIZBiZB9dfqXpEi9zk0PyzOd7sG7RwHALntFtxxEEFSt8o1CJcrMrW1bGMYkD4LQN0s1LZCDqknBziTvImDLBAsqIYiFEtaEOaALEoNfnFoI0DY986tpsjBPlDQsZAzhXJhTjtIY9IP9A6rwBujHz4jsH7vZBt4NN61BuUZCZBIKtdWV3nFihMZD';
    static readonly FACEBOOK_PAGE_VERIFY_TOKEN = 'EAAMGq9ZBqZBG0BAIvfvHhrGVxOnZA1CdaOOPsgMqSCgtgMeiaTZBdmyt3rrlh7gP8uzY3sA5gaaRgt29ApZAMyvdHuXDqgvqaIRtpUqdeognrZCQyhpULV9ASjZA6wZC4bVeIGLmvwlfvt1TlN8dZBy8c0YoKCUK1oZCn35ddEf9iiZCJAot1qZBriC6aI7ZCOZBx4k44ZD';
    
    static readonly GOOGLE_API_KEY = 'AIzaSyAGZ6xu-PUDubQLdxQvBl5DeJgXscWEbPo';

    static readonly REPLY_MESSAGE = 'We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respond.' + 
    '\n\n If you would like to share your location that may help us find you in the event that this is applicable.\n\n' +
    'Your Message: \n';
  }