const { NEW_RELIC_LICENSE_KEY, NEW_RELIC_APP_NAME } = process.env;

exports.config = {
    app_name: NEW_RELIC_APP_NAME,
    license_key: NEW_RELIC_LICENSE_KEY,    
    logging: {
      level: 'info'
    }
  }; 
  