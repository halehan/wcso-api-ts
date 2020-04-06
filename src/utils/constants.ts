export class Constants {
   // static readonly DATE_FMT = 'dd/MMM/yyyy';
    static readonly DATE_FMT = 'MMM-dd-yyyy';
    static readonly DATE_TIME_FMT = `${Constants.DATE_FMT} hh:mm:ss a`;

    static readonly SERVER_URL = 'https://wcso-api-ts.herokuapp.com/';

    static readonly FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
    static readonly FACEBOOK_PAGE_VERIFY_TOKEN = process.env.FACEBOOK_PAGE_VERIFY_TOKEN;
    static readonly GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    static readonly TWILIO_ACCOUNTSID = process.env.TWILIO_ACCOUNTSID;
    static readonly TWILIO_AUTHTOKEN = process.env.TWILIO_AUTHTOKEN;
    static readonly TWILIO_NUMBER = process.env.TWILIO_NUMBER;
    static readonly WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;
    static readonly SUPERSECRET = "dog";

    static readonly REPLY_MESSAGE = 'We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respond.' + 
    '\n\n If you would like to share your location that may help us find you in the event that this is applicable.\n\n' +
    'Your Message: \n';

    static readonly REPLY_SMS = "We have recived your message and have added the request to our queue.  Please standby for a law enforcement representative to respond.  If this is an emergency situation please call 911.";
    
  }